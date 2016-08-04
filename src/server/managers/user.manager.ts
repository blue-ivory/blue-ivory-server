import { IDAO } from './../interfaces/IDAO';
import { User } from './../classes/user';
import * as UserModel from './../models/user.model';

export class UserManager implements IDAO<User>{
    public all(callback: Function): void {
        UserModel.find((err, users) => {
            callback(err, users);
        });
    }

    public create(user: User, callback: Function): void {
        var userModel = new UserModel(user);
        userModel.save((err, user) => {
            callback(err, user);
        });
    }

    public read(id: string, callback: Function): void {
        UserModel.findById(id, (err, user) => {
            callback(err, user);
        });
    }

    public update(user: User, callback): void {
        UserModel.findOneAndUpdate({ _id: user.getID }, user, { upsert: true }, (err, user) => {
            callback(err, user);
        });
    }

    public delete(id: string, callback: Function): void {
        UserModel.findOneAndRemove({ _id: id }, (err, user) => {
            callback(err, user);
        });
    }
}