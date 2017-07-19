import * as express from 'express';
import * as Datastore from 'nedb';
import * as webpush from 'web-push';

export function run() {
    return 'Application started...';
}

const app = express();
const db = new Datastore();

var allowCrossDomain = function (req, res, next) {
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
};
app.use(allowCrossDomain);

app.get('/', function (req, res) {
    res.send('Hello World!')
})
const isValidSaveRequest = (req, res) => {
    // Check the request body has at least an endpoint.
    if (!req.body || !req.body.endpoint) {
        // Not a valid subscription.
        res.status(400);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            error: {
                id: 'no-endpoint',
                message: 'Subscription must have an endpoint.'
            }
        }));
        return false;
    }
    return true;
};

function saveSubscriptionToDatabase(subscription) {
    return new Promise(function (resolve, reject) {
        db.insert(subscription, function (err, newDoc) {
            if (err) {
                reject(err);
                return;
            }

            resolve(newDoc._id);
        });
    });
};

app.post('/api/save-subscription/', function (req, res) {
    console.log('/spi/save-subscription/');

    if (!isValidSaveRequest(req, res)) {
        return;
    }

    return saveSubscriptionToDatabase(req.body)
        .then(function (subscriptionId) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ data: { success: true } }));
        })
        .catch(function (err) {
            res.status(500);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({
                error: {
                    id: 'unable-to-save-subscription',
                    message: 'The subscription was received but we were unable to save it to our database.'
                }
            }));
        });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

const vapidKeys = {
    publicKey: 'BFycNS1Ah5TUoHY-9pHWfsriqqsiyC2ZKcy8eMVkKdG5h2Ayi4Bnd6mgzBI02_Do7aH2HFVBtuNfag_WVaHtXx8',
    privateKey: 'bBsZIdvdVpyoN4bfjpWp7-i4jQK-Mg--pzCLWChnFM4'
};

webpush.setVapidDetails(
    'mailto:sjohnson@cubexsystem.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);