import { IDAO } from './../interfaces/IDAO';
import { Visitor } from './../classes/visitor';
import * as VisitorModel from './../models/visitor.model';

export class VisitorManager implements IDAO<Visitor>{
    public all(callback: Function): void {
        VisitorModel.find((err, visitors) => {
            callback(err, visitors);
        });
    }

    public create(visitor: Visitor, callback: Function): void {
        var VisitorModel = new VisitorModel(visitor);
        VisitorModel.save((err, visitor) => {
            callback(err, visitor);
        });
    }

    public read(id: string, callback: Function): void {
        VisitorModel.findById(id, (err, visitor) => {
            callback(err, visitor);
        });
    }

    public update(visitor: Visitor, callback): void {
        VisitorModel.findOneAndUpdate({ _id: visitor.getID }, visitor, { upsert: true }, (err, user) => {
            callback(err, user);
        });
    }

    public delete(id: string, callback: Function): void {
        VisitorModel.findOneAndRemove({ _id: id }, (err, visitor) => {
            callback(err, visitor);
        });
    }
}