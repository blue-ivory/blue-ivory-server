import { IDAO } from './../interfaces/IDAO';
import { User } from './../classes/user';
import * as Promise from 'bluebird';
import * as UserModel from './../models/user.model';

export class UserManager implements IDAO<User>{
    public all(): Promise<any> {
        let deferred = Promise.defer();
        UserModel.find((err, users) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(users);
            }
        });

        return deferred.promise;
    }

    public create(user: User): Promise<any> {
        let deferred = Promise.defer();
        let userModel = new UserModel(user);
        userModel.save((err, user) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
        });
        return deferred.promise;
    }

    public read(id: string): Promise<any> {
        let deferred = Promise.defer();
        UserModel.findById(id, (err, user) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
        });

        return deferred.promise;
    }

    public update(user: User): Promise<any> {
        let deferred = Promise.defer();
        UserModel.findOneAndUpdate({ _id: user._id }, user, { new: true }, (err, user) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
        });

        return deferred.promise;
    }


    public delete(id: string): Promise<any> {
        let deferred = Promise.defer();
        UserModel.findOneAndRemove({ _id: id }, (err, user) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
        });

        return deferred.promise;
    }
}