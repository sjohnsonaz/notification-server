import Config from './config';
import Application from './implementations/Application';

export function run() {
    const application = new Application(Config);

    application.init();
    application.listen();
}