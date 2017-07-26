export interface IConfig {
    port?: number;
    cors?: boolean;
    mongodb?: {
        uri?: string;
        options?: any
    }
}