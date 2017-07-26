import * as Express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as Datastore from 'nedb';

import { IConfig } from '../interfaces/IConfig';

import { allowCrossDomain } from '../middleware';
import Routes from '../routes';
import Store from '../store';

export default class Application {
    config: IConfig;
    app: Express.Express;

    constructor(config: IConfig) {
        this.config = config;
        this.app = Express();
    }

    init() {
        this.connectDatabase();
        this.addMiddleware();
        this.buildRoutes();
    }

    addMiddleware() {
        this.app.locals.config = this.config;
        this.app.disable('x-powered-by');
        if (this.config.cors) {
            this.app.use(allowCrossDomain);
        }
        this.app.use(bodyParser.json());
    }

    connectDatabase() {
        (mongoose as any).Promise = global.Promise;
        mongoose.connect(this.config.mongodb.uri, this.config.mongodb.options, (err) => {
            if (err) {
                console.log('ERROR connecting to: ' + this.config.mongodb.uri + '. ' + err);
            } else {
                console.log('Succeeded connected to: ' + this.config.mongodb.uri);
            }
        });
    }

    buildRoutes() {
        const db = new Datastore({
            filename: './data/subscriptionData.txt'
        });
        db.loadDatabase();
        const store = new Store(db);
        const routes = new Routes();

        routes.build(this.app, store);
    }

    listen() {
        this.app.listen(this.config.port, () => {
            console.log('Listening on port ' + this.config.port + '...');
        });
    }
}