import * as mongoose from 'mongoose';

import { ISubscription } from '../../interfaces/data/ISubscription';

export const SubscriptionSchema: mongoose.Schema = new mongoose.Schema({
    endpoint: {
        type: String,
        required: true
    },
    keys: {
        type: Object,
        required: true
    }
});

SubscriptionSchema.index({
    'endpoint': 1,
    'keys.auth': 1
});

export interface SubscriptionDocument extends mongoose.Document, ISubscription {

}

export default mongoose.model<SubscriptionDocument>('Subscription', SubscriptionSchema);
