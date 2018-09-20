import { Socket } from "../helpers/socket.handler";
import { IUser } from "./user.interface";

export default function (socketHandler: Socket) {
    let nsp = '/auth';
    return {
        emitPermissionChanged: (user:IUser) => {
            socketHandler.emit(nsp, `${user._id}_permission_changed`, user);
        },
        
        emitProfileChanged:(user:IUser) => {
            socketHandler.emit(nsp, `${user._id}_profile_changed`, user);
        }
    }
}