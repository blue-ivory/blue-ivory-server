import * as Promise from 'bluebird';
import { Document } from 'mongoose';
import { RepositoryBase } from "../helpers/repository";
import { IVisitor } from "./visitor.interface";
import { VisitorModel } from './visitor.model';
import { ICollection } from "../helpers/collection";

export class VisitorRepository extends RepositoryBase<IVisitor> {

    constructor() {
        super(VisitorModel);
    }

    search(searchTerm?: string, paginationOptions?: { skip: number, limit: number }): Promise<ICollection<IVisitor>> {
        return new Promise<ICollection<IVisitor>>((resolve, reject) => {
            let searchFilter = this.generateSearchFilter(searchTerm);
            let visitorsPromise = VisitorModel.find(searchFilter);

            if (paginationOptions) {
                visitorsPromise = visitorsPromise
                    .skip(paginationOptions.skip)
                    .limit(paginationOptions.limit);
            }

            let countPromise = VisitorModel.count(searchFilter);

            Promise.all([visitorsPromise, countPromise]).then(values => {
                let result = <ICollection<IVisitor>>{
                    set: values[0],
                    totalCount: values[1]
                }

                resolve(result);
            }).catch(reject);
        });
    }

    private generateSearchFilter(searchTerm: string): Object {
        let queryFilter = {};

        if (searchTerm) {
            let searchTermRegExp = new RegExp(searchTerm, 'i');
            queryFilter = {
                '$or': [
                    { '_id': searchTermRegExp },
                    { 'name': searchTermRegExp }
                ]
            };
        }

        return queryFilter;
    }

    findOrCreate(visitor: IVisitor): Promise<Document> {
        if (!visitor) {
            return Promise.resolve(null);
        }

        return new Promise<Document>((resolve, reject) => {
            this.findById(visitor._id).then((fetchedVisitor: IVisitor) => {
                if (fetchedVisitor) {
                    resolve(fetchedVisitor);
                } else {
                    resolve(this.create(visitor));
                }
            }).catch(reject);
        });
    }
}