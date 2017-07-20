import * as express from 'express';
import * as Datastore from 'nedb';
import * as bodyParser from 'body-parser';

import Routes from './routes';
import Store from './store';

export function run() {
    return 'Application started...';
}

const app = express();
const db = new Datastore({
    filename: './data/subscriptionData.txt'
});
db.loadDatabase();
const store = new Store(db);
const routes = new Routes();

app.use(function allowCrossDomain(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
app.use(bodyParser.json());

routes.build(app, store);

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});