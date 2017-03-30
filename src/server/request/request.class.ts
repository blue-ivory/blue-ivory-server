import * as Promise from 'bluebird';
import { IOrganization } from './../organization/organization.interface';
import { IUser } from './../user/user.interface';
import { IVisitor } from './../visitor/visitor.interface';
import { IRequest, CarType } from './request.interface';
import { Document, Types } from 'mongoose';
import { RequestRepository } from './request.repository';

export class Request {
    private static _requestRepository: RequestRepository = new RequestRepository();

    static createRequest(startDate: Date,
        endDate: Date,
        visitor: IVisitor,
        requestor: IUser,
        description: string,
        car: CarType,
        carNumber: number,
        organization: IOrganization): Promise<Document> {

        let request = <IRequest>{
            requestDate: new Date(),
            startDate: startDate,
            endDate: endDate,
            visitor: visitor,
            description: description,
            car: car,
            carNumber: carNumber,
            organization: organization,

        };

        return Request._requestRepository.create(request);
    }
}