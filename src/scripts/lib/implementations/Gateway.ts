import * as mongoose from 'mongoose';

export interface IQueryResult<T extends mongoose.Document> {
    count: number;
    results: T[];
}

export default class Gateway<T extends mongoose.Document> {
    modelType: mongoose.Model<T>;
    constructor(modelType: mongoose.Model<T>) {
        this.modelType = modelType;
    }

    async create(data: T) {
        var user = new this.modelType(data);
        return user.save();
    }

    async get(id) {
        return this.modelType.findOne({
            _id: id
        });
    }

    async list(params?: {
        find?: any;
        select?: any;
        page?: number;
        pageSize?: number | 'all';
        sort?: any;
    }) {
        params = params || {} as any;
        var find = params.find || {};
        var select = params.select;
        var page = params.page || 0;
        var pageSize: number | string = typeof params.pageSize === 'string' ? params.pageSize || 20 : params.pageSize;
        var sort = params.sort;

        let count = await this.modelType.find(find).count();
        var query = this.modelType.find(find);
        if (select) {
            query = query.select(select);
        }
        if (pageSize !== 'all') {
            query = query.skip(page * (pageSize as number)).limit(pageSize as number);
        }
        if (sort) {
            query.sort(sort);
        }
        let results = await query.exec();
        return {
            count: count,
            results: results
        };
    }

    update(id, data: T) {
        return this.modelType.update
            ({
                _id: id
            },
            data,
            {
                runValidators: true
            });
    }

    delete(id) {
        return this.modelType.remove({
            _id: id
        });
    }
}
