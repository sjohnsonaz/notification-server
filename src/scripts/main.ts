import * as Datastore from 'nedb';

import Config from './config';
import NotificationService from './implementations/services/NotificationService';

import NotificationApplication from './implementations/NotificationApplication';

export function run() {
    const application = new NotificationApplication(Config);

    const db = new Datastore({
        filename: './data/subscriptionData.txt'
    });
    db.loadDatabase();
    const notificationService = new NotificationService();

    application.addController(notificationService);
    application.init();
    application.listen();
}