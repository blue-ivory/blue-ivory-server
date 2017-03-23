"use strict";
const mongoose = require("mongoose");
var visitorSchema = new mongoose.Schema({
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
var VisitorModel = mongoose.model("Visitor", visitorSchema);
module.exports = VisitorModel;
