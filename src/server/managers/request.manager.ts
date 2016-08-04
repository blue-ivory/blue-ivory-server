import { IDAO } from './../interfaces/IDAO';
import { Request } from './../classes/request';
import * as RequestModel from './../models/request.model';

export class RequestManager implements IDAO<Request>{
    public all(callback: Function): void {
        RequestModel.find((err, requests) => {
            callback(err, requests);
        });
    }

    public create(request: Request, callback: Function): void {
        var requestModel = new RequestModel(request);
        requestModel.save((err, request) => {
            callback(err, request);
        });
    }

    public read(id, callback: Function): void {
        RequestModel.findById(id, (err, request) => {
            callback(err, request);
        });
    }

    public update(request: Request, callback: Function): void {
        RequestModel.findOneAndUpdate({ _id: request.getID }, request, { upsert: true }, (err, request) => {
            callback(err, request);
        });
    }

    public delete(id, callback: Function): void {
        RequestModel.findOneAndRemove({ _id: id }, (err, request) => {
            callback(err, request);
        });
    }
}