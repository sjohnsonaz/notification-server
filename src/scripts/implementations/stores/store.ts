import * as DataStore from 'nedb';

import { ISubscription, ISubscriptionDocument } from '../../interfaces/data/ISubscription';

export default class Store {
    db: DataStore;

    constructor(db: DataStore) {
        this.db = db;
    }

    saveSubscriptionToDatabase(subscription: ISubscription) {
        return new Promise<string>((resolve, reject) => {
            this.db.find({ endpoint: subscription.endpoint }, (err, docs: ISubscriptionDocument[]) => {
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }

                if (docs && docs.length) {
                    resolve(docs[0]._id);
                } else {
                    this.db.insert(subscription, (err, newDoc: ISubscriptionDocument) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                            return;
                        }

                        resolve(newDoc._id);
                    });
                }
            });
        });
    };

    getSubscriptionsFromDatabase() {
        return new Promise<ISubscriptionDocument[]>((resolve, reject) => {
            this.db.find({}, (err, docs: ISubscriptionDocument[]) => {
                if (err) {
                    console.log(err);
                    reject(err);
                    return
                }

                resolve(docs);
            });
        });
    }

    deleteSubscriptionFromDatabase(id: string) {
        return new Promise<number>((resolve, reject) => {
            this.db.remove({ _id: id }, {}, (err, numRemoved) => {
                if (err) {
                    console.log(err);
                    reject(err);
                    return
                }

                resolve(numRemoved);
            });
        })
    }
}