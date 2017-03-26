import * as Promise from 'bluebird';
import { RepositoryBase } from "../helpers/repository";
import { IVisitor } from "./visitor.interface";
import { VisitorModel } from './visitor.model';
import { ICollection } from "../helpers/collection";

export class VisitorRepository extends RepositoryBase<IVisitor> {

    constructor() {
        super(VisitorModel);
    }

    search(searchTerm?: string, paginationOptions?: { skip: number, limit: number } ): Promise<ICollection<IVisitor>>{
        return new Promise<ICollection<IVisitor>>((resolve, reject) => {

        });
    }
}