import * as http from 'http';
import * as Express from 'express';
import { Controller, route } from 'sierra';

import { IConfig } from '../../interfaces/IConfig';

import Push from '../push';

import { ISubscription } from '../../interfaces/data/ISubscription';

export default class SubscriptionService extends Controller<Express.Router, Express.RequestHandler> {
    deleteService: {
        host: string;
        port: number;
        path: string;
    }
    constructor(config: IConfig) {
        super();
        this.deleteService = config.deleteService;
    }

    deleteSubscription(subscription: ISubscription) {
        return new Promise<any>((resolve, reject) => {
            http.request({
                method: 'DELETE',
                host: this.deleteService.host,
                port: this.deleteService.port,
                path: this.deleteService.path + subscription.keys.auth
            }, (res) => {
                if (res.statusCode === 200) {
                    resolve(res);
                } else {
                    reject(new Error('Status Code: ' + res.statusCode));
                }
            });
        });
    }

    @route('post', '/', false)
    async post(req, res) {
        let notification = JSON.stringify(req.body.notification);
        let subscriptions: ISubscription[] = req.body.subscriptions;
        try {
            let results = await Promise.all(subscriptions.map(async (subscription) => {
                try {
                    await Push.triggerPushMsg(subscription, notification);
                    return true;
                } catch (err) {
                    if (err.statusCode === 410) {
                        // Not waiting for delete
                        this.deleteSubscription(subscription);
                    } else {
                        console.log('Subscription is no longer valid: ', err);
                    }
                    return err;
                }
            }));
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ results: results }));
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
