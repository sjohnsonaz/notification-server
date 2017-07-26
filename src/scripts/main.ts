import Config from './config';
import Application from './implementations/Application';

const application = new Application(Config);

application.init();
application.listen();