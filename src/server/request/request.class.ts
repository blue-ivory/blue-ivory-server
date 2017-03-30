import * as Promise from 'bluebird';
import { IOrganization } from './../organization/organization.interface';
import { IUser } from './../user/user.interface';
import { IVisitor } from './../visitor/visitor.interface';
import { IRequest, CarType } from './request.interface';
import { Document, Types } from 'mongoose';
import { RequestRepository } from './request.repository';
import { ICollection } from "../helpers/collection";
import { Visitor } from "../visitor/visitor.class";
import { User } from "../user/user.class";
import { Organization } from "../organization/organization.class";

export class Request {
    private static _requestRepository: RequestRepository = new RequestRepository();

    static createRequest(startDate: Date,
        endDate: Date,
        visitor: IVisitor,
        requestor: IUser,
        description: string,
        car: CarType,
        carNumber: number,
        organization: IOrganization,
        phoneNumber?: string): Promise<Document> {

        let request = <IRequest>{
            requestDate: new Date(),
            startDate: startDate,
            endDate: endDate,
            visitor: visitor,
            description: description,
            car: car,
            carNumber: carNumber,
            organization: organization,
            requestor: requestor,
            phoneNumber: phoneNumber
        };
        return Organization.findOrganization(organization ? organization._id : null).then((fetchedOrganization: IOrganization) => {
            if (fetchedOrganization) {
                request.organization = fetchedOrganization;
                return User.findUser(requestor ? requestor._id : null)
            }
        }).then((fetchedRequestor: IUser) => {
            if (fetchedRequestor) {
                request.requestor = fetchedRequestor;
                return Visitor.findOrCreateVisitor(visitor);
            }
        }).then((fetchedVisitor: IVisitor) => {
            request.visitor = fetchedVisitor;
            return Request._requestRepository.create(request);
        });

    }

    static findRequest(id: Types.ObjectId, populateField?: Object): Promise<Document> {
        let populate = [
            { path: 'requestor', select: 'firstName lastName mail' },
            { path: 'workflow.organization' , select: 'name'},
            { path: 'workflow.authorizer', select: 'firstName lastName mail' },
            { path: 'organization', select: 'name' },
            { path: 'visitor' }
        ];

        if (populateField) {
            populate.push(<any>populateField);
        }

        return Request._requestRepository.findById(id, populate)
    }

    static updateRequest(request: IRequest): Promise<Document> {
        let populate = [
            { path: 'requestor', select: 'firstName lastName mail' },
            { path: 'workflow.organization' , select: 'name'},
            { path: 'workflow.authorizer', select: 'firstName lastName mail' },
            { path: 'organization', select: 'name' },
            { path: 'visitor' }
        ];

        return Request._requestRepository.update(request, populate);
    }

    static deleteRequest(id: Types.ObjectId): Promise<void> {
        return Request._requestRepository.delete(id);
    }

    static searchMyRequests(user: IUser, searchTerm?: string, paginationOptions?: { skip: number, limit: number }): Promise<ICollection<IRequest>> {
        return Request._requestRepository.searchMy(user, searchTerm, paginationOptions);
    }

    static searchPendingRequests(user: IUser, searchTerm?: string, paginationOptions?: { skip: number, limit: number }): Promise<ICollection<IRequest>> {
        return Request._requestRepository.searchPending(user, searchTerm, paginationOptions);
    }

    static searchAllRequests(user: IUser, searchTerm?: string, paginationOptions?: { skip: number, limit: number }): Promise<ICollection<IRequest>> {
        return Request._requestRepository.searchAll(user, searchTerm, paginationOptions);
    }
}