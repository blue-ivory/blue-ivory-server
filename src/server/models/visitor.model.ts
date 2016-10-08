/// <reference path="./../../../typings/index.d.ts" />

import * as mongoose from 'mongoose';
import { Visitor } from './../classes/visitor';

var visitorSchema: mongoose.Schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    company: {
        type: String
    }
});
visitorSchema.virtual('pid').get(() => {
    return this._id;
});

var VisitorModel = mongoose.model<Visitor>("Visitor", visitorSchema);

export = VisitorModel;