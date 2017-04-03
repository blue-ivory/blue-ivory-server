import { Request } from 'express';
import { IPaginationOptions } from "./pagination.interface";

export class Pagination {
    static getPaginationOptions(request: Request): IPaginationOptions {
        let paginationOptions = <IPaginationOptions>null;

        let page = +request.query['page'];
        let pageSize = +request.query['pageSize'];

        if (page && pageSize) {
            paginationOptions = <IPaginationOptions>{
                skip: (page - 1) * pageSize,
                limit: pageSize
            };
        }

        return paginationOptions;
    }
}