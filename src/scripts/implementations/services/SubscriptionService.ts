import * as Express from 'express';
import { Controller, route } from 'sierra';

import Store from '../stores/store';
import Push from '../../lib/push';

export default class SubscriptionService extends Controller<Express.Router, Express.RequestHandler> {
    store: Store;

    constructor(store: Store) {
        super();
        this.store = store;
    }

    @route('get', '/', false)
    get(req, res) {
        res.send('Hello World!')
    }

    @route('post', '/api/save-subscription/', false)
    saveSubscription(req, res) {
        console.log('Creating subscription');

        if (!isValidSaveRequest(req, res)) {
            return;
        }

        return this.store.saveSubscriptionToDatabase(req.body)
            .then((subscriptionId) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ data: { success: true } }));
            })
            .catch((err) => {
                res.status(500);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    error: {
                        id: 'unable-to-save-subscription',
                        message: 'The subscription was received but we were unable to save it to our database.'
                    }
                }));
            });
    }

    @route('post', '/api/trigger-push-msg/', false)
    triggerPushMessage(req, res) {
        let dataToSend = JSON.stringify(req.body);
        return this.store.getSubscriptionsFromDatabase()
            .then((subscriptions) => {
                let promiseChain = Promise.resolve();

                for (let i = 0; i < subscriptions.length; i++) {
                    const subscription = subscriptions[i];
                    promiseChain = promiseChain.then(() => {
                        return Push.triggerPushMsg(subscription, dataToSend).catch((err) => {
                            if (err.statusCode === 410) {
                                return this.store.deleteSubscriptionFromDatabase(subscription._id);
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
            .catch((err) => {
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
    }
}

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