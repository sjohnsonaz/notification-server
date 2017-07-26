import * as Express from 'express';
import * as ExpressSession from 'express-session';
import * as Grant from 'grant-express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as Datastore from 'nedb';

import { IConfig } from '../interfaces/IConfig';

import { allowCrossDomain } from '../middleware';
import SubscriptionService from '../SubscriptionService';
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
        // Grant OAuth
        let grant = new Grant({

        });
        this.app.use(ExpressSession({ secret: 'grant' }));
        this.app.use(grant);

        // View Data
        this.app.locals.config = this.config;

        // Header Information
        this.app.disable('x-powered-by');
        if (this.config.cors) {
            this.app.use(allowCrossDomain);
        }

        // Body Parser
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
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
        const subscriptionService = new SubscriptionService(store);
        this.app.use('/', subscriptionService.expressRouter);
    }

    listen() {
        this.app.listen(this.config.port, () => {
            console.log('Listening on port ' + this.config.port + '...');
        });
    }
}