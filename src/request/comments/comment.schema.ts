import * as mongoose from 'mongoose';

export let commentSchema: mongoose.Schema = new mongoose.Schema({
    date: {
        type: Date,
        default: new Date()
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        ref: 'User',
        required: true
    }
})