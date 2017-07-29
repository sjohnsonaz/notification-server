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

    create(data, callback: (err: any, res: any) => void) {
        var user = new this.modelType(data);
        user.save(callback);
    }

    get(id, callback: (err: any, res: T) => void) {
        this.modelType.findOne({
            _id: id
        }, callback);
    }

    list(params: {
        find: any;
        select: any;
        page: number;
        pageSize: number;
        sort: any;
    }, callback: (err: any, res?: IQueryResult<T>) => void) {
        params = params || {} as any;
        var find = params.find || {};
        var select = params.select;
        var page = params.page || 0;
        var pageSize: number | string = typeof params.pageSize === 'string' ? params.pageSize || 20 : params.pageSize;
        var sort = params.sort;

        this.modelType.find(find).count((err, count) => {
            if (!err) {
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
                query.exec((err, result) => {
                    if (!err) {
                        callback(err, {
                            count: count,
                            results: result
                        });
                    } else {
                        callback(err);
                    }
                });
            } else {
                callback(err);
            }
        });
    }

    update(id, data, callback: (err: any, raw: any) => void) {
        this.modelType.update(
            {
                _id: id
            }, data, {
                runValidators: true
            }, callback);
    }

    delete(id, callback: (err: any) => void) {
        this.modelType.remove({
            _id: id
        }, callback);
    }
}
