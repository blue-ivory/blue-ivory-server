"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(firstName, lastName, uniqueId, mail) {
        this.firstName = firstName;
        this.lastName = lastName;
        this._id = uniqueId;
        this.mail = mail;
    }
    get name() {
        return this.firstName + ' ' + this.lastName;
    }
}
exports.User = User;
