/// <reference path="./../../../typings/index.d.ts" />

import * as mongoose from 'mongoose';
import { Base } from './../classes/base';

var baseSchema: mongoose.Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

var BaseModel = mongoose.model<Base>("Base", baseSchema);

export = BaseModel;