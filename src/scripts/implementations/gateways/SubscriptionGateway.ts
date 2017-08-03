import Gateway from '../../lib/implementations/Gateway';

import SubscriptionSchemaModel, { SubscriptionDocument } from '../schemaModels/SubscriptionSchemaModel';

export default class SubscriptionGateway extends Gateway<SubscriptionDocument> {
    constructor() {
        super(SubscriptionSchemaModel);
    }
}