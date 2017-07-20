import * as Express from 'express';

import Store from './store';
import Push from './push';

export default class Routes {
    build(app: Express.Express, store: Store) {
        app.get('/', function (req, res) {
            res.send('Hello World!')
        });

        const isValidSaveRequest = (req, res) => {
            // Check the request body has at least an endpoint.
            if (!req.body || !req.body.endpoint) {
                // Not a valid subscription.
                res.status(400);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    error: {
                        id: 'no-endpoint',
                        message: 'Subscription must have an endpoint.'
                    }
                }));
                return false;
            }
            return true;
        };

        app.post('/api/save-subscription/', function (req, res) {
            console.log('Creating subscription');

            if (!isValidSaveRequest(req, res)) {
                return;
            }

            return store.saveSubscriptionToDatabase(req.body)
                .then(function (subscriptionId) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ data: { success: true } }));
                })
                .catch(function (err) {
                    res.status(500);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        error: {
                            id: 'unable-to-save-subscription',
                            message: 'The subscription was received but we were unable to save it to our database.'
                        }
                    }));
                });
        });

        app.post('/api/trigger-push-msg/', function (req, res) {
            let dataToSend = JSON.stringify(req.body);
            return store.getSubscriptionsFromDatabase()
                .then(function (subscriptions) {
                    let promiseChain = Promise.resolve();

                    for (let i = 0; i < subscriptions.length; i++) {
                        const subscription = subscriptions[i];
                        promiseChain = promiseChain.then(() => {
                            return Push.triggerPushMsg(subscription, dataToSend).catch((err) => {
                                if (err.statusCode === 410) {
                                    return store.deleteSubscriptionFromDatabase(subscription._id);
                                } else {
                                    console.log('Subscription is no longer valid: ', err);
                                }
                            });
                        });
                    }

                    return promiseChain;
                }).then(() => {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({ data: { success: true } }));
                })
                .catch(function (err) {
                    res.status(500);
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({
                        error: {
                            id: 'unable-to-send-messages',
                            message: `We were unable to send messages to all subscriptions : ` +
                            `'${err.message}'`
                        }
                    }));
                });
        });
    }
}