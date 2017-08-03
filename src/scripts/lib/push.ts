import * as webpush from 'web-push';

import { ISubscription } from '../interfaces/data/ISubscription';

const vapidKeys = {
    publicKey: 'BFycNS1Ah5TUoHY-9pHWfsriqqsiyC2ZKcy8eMVkKdG5h2Ayi4Bnd6mgzBI02_Do7aH2HFVBtuNfag_WVaHtXx8',
    privateKey: 'bBsZIdvdVpyoN4bfjpWp7-i4jQK-Mg--pzCLWChnFM4'
};

webpush.setVapidDetails(
    'mailto:sjohnson@cubexsystem.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

export default class Push {
    static triggerPushMsg<T>(subscription: ISubscription, dataToSend: T): Promise<any> {
        return webpush.sendNotification(subscription, dataToSend);
    }
}