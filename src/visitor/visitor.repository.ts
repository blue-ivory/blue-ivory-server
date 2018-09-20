import { Document } from 'mongoose';
import { ICollection } from "../helpers/collection";
import { RepositoryBase } from "../helpers/repository";
import { IPaginationOptions } from "../pagination/pagination.interface";
import { IVisitor } from "./visitor.interface";
import { VisitorModel } from './visitor.model';

export class VisitorRepository extends RepositoryBase<IVisitor> {

    constructor() {
        super(VisitorModel);
    }

    async search(searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IVisitor>> {

        let searchFilter = this.generateSearchFilter(searchTerm);
        let visitorsPromise = VisitorModel.find(searchFilter);

        if (paginationOptions) {
            visitorsPromise = visitorsPromise
                .skip(paginationOptions.skip)
                .limit(paginationOptions.limit);
        }

        let countPromise = VisitorModel.count(searchFilter);

        let [visitors, count] = await Promise.all([visitorsPromise, countPromise]);
        let result = <ICollection<IVisitor>>{
            set: visitors,
            totalCount: count
        };
        
        return result;
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

    async findOrCreate(visitor: IVisitor): Promise<Document> {

        if(!visitor) {
            return null;
        }

        let fetchedVisitor = await this.findById(visitor._id);
        
        return fetchedVisitor || await this.create(visitor);
    }
}