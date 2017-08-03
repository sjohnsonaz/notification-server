export interface ISubscription {
    endpoint: string;
    keys: {
        [index: string]: string;
        auth: string;
    }
}

export interface ISubscriptionDocument extends ISubscription {
    _id: string;
}