import { Document } from 'mongoose';
import { ICollection } from '../helpers/collection';
import { IPaginationOptions } from "../pagination/pagination.interface";
import { IVisitor } from "./visitor.interface";
import { VisitorRepository } from "./visitor.repository";

export class Visitor {

    private _visitor: IVisitor;
    private static _visitorRepository: VisitorRepository = new VisitorRepository();

    constructor(visitorInterface: IVisitor) {
        this._visitor = visitorInterface;
    }

    static createVisitor(visitor: IVisitor): Promise<Document> {
        return Visitor._visitorRepository.create(visitor);
    }

    static findVisitor(id: string): Promise<Document> {
        return Visitor._visitorRepository.findById(id);
    }

    static findOrCreateVisitor(visitor: IVisitor): Promise<Document> {
        return Visitor._visitorRepository.findOrCreate(visitor);
    }

    static updateVisitor(visitor: IVisitor): Promise<Document> {
        return Visitor._visitorRepository.update(visitor);
    }

    static deleteVisitor(id: string): Promise<void> {
        return Visitor._visitorRepository.delete(id);
    }

    static searchVisitors(searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IVisitor>> {
        return Visitor._visitorRepository.search(searchTerm, paginationOptions);
    }
}