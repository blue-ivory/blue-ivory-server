import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { IRead } from './read.interface';
import { IWrite } from './write.interface';
import { ICollection } from "./collection";
import { IPaginationOptions } from "../pagination/pagination.interface";

export abstract class RepositoryBase<T extends mongoose.Document> implements IRead, IWrite<T> {

  private _model: mongoose.Model<mongoose.Document>;

  constructor(schemaModel: mongoose.Model<mongoose.Document>) {
    this._model = schemaModel;
  }

  create(item: T): Promise<mongoose.Document> {
    return this._model.create(item);
  }

  update(item: T, populateOptions?: string | Object): Promise<mongoose.Document> {
    let updateQuery = this._model.findByIdAndUpdate({ _id: item._id }, item, { new: true });
    if (populateOptions) {
      updateQuery = updateQuery.populate(populateOptions);
    }
    return updateQuery.exec();
  }

  delete(_id: any): Promise<void> {
    return this._model.remove({ _id: _id }).exec();
  }

  findById(_id: any, populateOptions?: string | Object): Promise<mongoose.Document> {
    let findQuery = this._model.findById(_id);

    if (populateOptions) {
      findQuery = findQuery.populate(populateOptions);
    }

    return findQuery.exec();
  }

  findOne(cond?: Object, populateOptions?: string | Object): Promise<mongoose.Document> {
    let findQuery = this._model.findOne(cond);
    if (populateOptions) {
      findQuery = findQuery.populate(populateOptions);
    }
    return findQuery.exec();
  }

  find(cond?: Object, populate?: string | Object, select?: string): Promise<mongoose.Document[]> {

    let findPromise = this._model.find(cond);
    if (populate) {
      findPromise = findPromise.populate(populate);
    }
    if (select) {
      findPromise = findPromise.select(select);
    }

    return findPromise.exec();
  }

  abstract search(searchTerm?: string, paginationOptions?: IPaginationOptions, additionalFilter?: Object, ): Promise<ICollection<T>>;
}