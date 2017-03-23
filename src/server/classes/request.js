"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Request {
    constructor(startDate, endDate, visitor, requestor, description, isSoldier, needEscort, organization) {
        this.requestDate = new Date();
        this.startDate = startDate;
        this.endDate = endDate;
        this.visitor = visitor;
        this.requestor = requestor;
        this.authorizer = null;
        this.description = description;
        this.isSolider = isSoldier;
        this.needEscort = needEscort;
        this.organization = organization;
    }
}
exports.Request = Request;
var CarType;
(function (CarType) {
    CarType[CarType["NONE"] = "NONE"] = "NONE";
    CarType[CarType["PRIVATE"] = "PRIVATE"] = "PRIVATE";
    CarType[CarType["ARMY"] = "ARMY"] = "ARMY";
})(CarType = exports.CarType || (exports.CarType = {}));
