import * as Datastore from 'nedb';

import Config from './config';
import SubscriptionService from './implementations/services/SubscriptionService';
import Store from './implementations/stores/store';

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