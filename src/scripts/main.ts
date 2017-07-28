import * as Datastore from 'nedb';

import Config from './config';
import SubscriptionService from './SubscriptionService';
import Store from './store';

import NotificationApplication from './implementations/NotificationApplication';

export function run() {
    const application = new NotificationApplication(Config);

    const db = new Datastore({
        filename: './data/subscriptionData.txt'
    });
    db.loadDatabase();
    const store = new Store(db);
    const subscriptionService = new SubscriptionService(store);

    application.addController(subscriptionService);
    application.init();
    application.listen();
}