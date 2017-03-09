/// <reference path="./../../../typings/index.d.ts" />

import * as mongoose from 'mongoose';
import { Request, CarType } from './../classes/request';

var requestSchema: mongoose.Schema = new mongoose.Schema({
    requestDate: {
        type: Date,
        default: new Date()
    },
    endDate: {
        type: Date,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    requestor: {
        type: String,
        ref: 'User',
        required: true
    },
    visitor: {
        type: String,
        ref: 'Visitor',
        required: true
    },
    authorizer: {
        type: String,
        ref: 'User',
        required: false
    },
    description: {
        type: String
    },
    phone: {
        type: String,
        default: '--'
    },
    isSolider: {
        type: Boolean,
        default: false
    },
    car: {
        type: String,
        enum: [
            CarType.NONE,
            CarType.PRIVATE,
            CarType.ARMY
        ],
        default: CarType.NONE
    },
    carNumber: {
        type: Number,
        required: false
    },
    needEscort: {
        type: Boolean,
        default: false
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
});

var RequestModel = mongoose.model<Request>("Request", requestSchema);

export = RequestModel;