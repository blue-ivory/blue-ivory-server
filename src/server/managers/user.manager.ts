import { IDAO } from './../interfaces/IDAO';
import { User } from './../classes/user';

export class UserManager implements IDAO<User>{
    public create(user: User): User {

        return null;
    }

    public read(id: number): User {
        return null;
    }

    public update(user: User): boolean {
        return false;
    }

    public delete(id: number): boolean {
        return false;
    }
}