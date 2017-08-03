import * as Express from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import { Application, Controller } from 'sierra';

import { IConfig } from '../interfaces/IConfig';

import { allowCrossDomain } from './middleware';

export default class NotificationApplication extends Application<Express.Router, Express.RequestHandler> {
    config: IConfig;
    app: Express.Express;
    server: http.Server;
    port: number;

    constructor(config: IConfig) {
        super();
        this.config = config;
        this.app = Express();
        this.port = config.port;
        this.app.set('port', this.port);
    }

    async connectDatabase() {
        return true;
    }

    addMiddleware() {
        // Header Information
        this.app.disable('x-powered-by');
        if (this.config.cors) {
            this.app.use(allowCrossDomain);
        }

        // Body Parser
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    buildRoute(controller: Controller<Express.Router, Express.RequestHandler>) {
        let expressRouter = Express.Router();
        controller.build(expressRouter, (app, verb, name, middleware, method) => {
            switch (verb) {
                case 'all':
                    app.all(name, ...middleware, method);
                    break;
                case 'get':
                    app.get(name, ...middleware, method);
                    break;
                case 'post':
                    app.post(name, ...middleware, method);
                    break;
                case 'put':
                    app.put(name, ...middleware, method);
                    break;
                case 'delete':
                    app.delete(name, ...middleware, method);
                    break;
                case 'patch':
                    app.patch(name, ...middleware, method);
                    break;
                case 'options':
                    app.options(name, ...middleware, method);
                    break;
                case 'head':
                    app.head(name, ...middleware, method);
                    break;
            }
        });
        this.app.use(expressRouter);
    }

    listen() {
        return new Promise<boolean>((resolve, reject) => {
            this.server = http.createServer(this.app);
            this.server.listen(this.port);
            this.server.on('listening', () => {
                console.log('Listening on port ' + this.config.port + '...');
                resolve(true);
            });
        });
    }
}