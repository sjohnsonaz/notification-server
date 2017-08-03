import { IConfig } from './interfaces/IConfig';
let config: IConfig = {
    port: 3001,
    cors: true,
    deleteService: {
        host: 'http://localhost',
        port: 3000,
        path: '/subscription/'
    }
};

export default config;