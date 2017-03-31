import { Document } from 'mongoose'
import * as Promise from 'bluebird';

export interface IWrite<T> {
  create: (item: T) => Promise<Document>;
  update: (item: T) => Promise<Document>;
  delete: (_id: any) => Promise<void>;
}