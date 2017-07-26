import { IConfig } from './interfaces/IConfig';
let config: IConfig = {
    port: 3000,
    cors: true,
    mongodb: {
        uri: 'mongodb://localhost/cascade-demo',
        options: {
        }
    }

};

export default config;