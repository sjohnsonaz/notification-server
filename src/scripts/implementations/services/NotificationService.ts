import * as http from 'http';
import * as Express from 'express';
import { Controller, route } from 'sierra';

import Store from '../stores/store';
import Push from '../../lib/push';

import { ISubscription, ISubscriptionDocument } from '../../interfaces/data/ISubscription';

export default class SubscriptionService extends Controller<Express.Router, Express.RequestHandler> {
    store: Store;

    constructor(store: Store) {
        super();
        this.store = store;
    }

    @route('post', '/', false)
    async post(req, res) {
        let notification = JSON.stringify(req.body.notification);
        let subscriptions: ISubscription[] = req.body.subscriptions;
        let promiseChain = Promise.resolve();

        try {
            for (let i = 0; i < subscriptions.length; i++) {
                const subscription = subscriptions[i];
                promiseChain = promiseChain.then(() => {
                    return Push.triggerPushMsg(subscription, notification).catch((err) => {
                        if (err.statusCode === 410) {
                            http.request({
                                method: 'DELETE',
                                host: 'http://localhost',
                                port: 3000,
                                path: '/subscription/' + subscription.keys.auth
                            }, (res) => {

                            });
                        } else {
                            console.log('Subscription is no longer valid: ', err);
                        }
                    });
                });
            }

            await promiseChain;
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ data: { success: true } }));
        } catch (err) {
            res.status(500);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({
                error: {
                    id: 'unable-to-send-messages',
                    message: `We were unable to send messages to all subscriptions : ` +
                    `'${err.message}'`
                }
            }));
        }
    }
}
