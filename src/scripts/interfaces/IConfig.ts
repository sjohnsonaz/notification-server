export interface IConfig {
    port?: number;
    cors?: boolean;
    deleteService?: {
        host: string;
        port: number;
        path: string;
    }
}