export interface ISubscription {
    endpoint: string;
    keys: {
        [index: string]: string;
        auth: string;
    }
}
