import { User } from './../../src/server/classes/user';
import * as core from "express-serve-static-core";

declare module 'express' {
    interface Request extends core.Request {
        user: User;
    }
}