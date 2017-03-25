import * as mongoose from 'mongoose';
import { IVisitor } from './../classes/visitor';

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

var VisitorModel = mongoose.model<IVisitor>("Visitor", visitorSchema);

export = VisitorModel;