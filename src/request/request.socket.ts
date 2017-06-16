import { Socket } from "../helpers/socket.handler";
import { IRequest } from "./request.interface";
import { Types } from "mongoose";
import { TaskStatus } from "../workflow/task-status.enum";

export default function (socketHandler: Socket) {
    let nsp = '/request';
    return {

        emitNewRequest: (request: IRequest) => {
            socketHandler.emit(nsp, `new_request_for_${request.organization._id.toHexString()}`, {});
        },

        emitDeletedRequest: (requestId: Types.ObjectId) => {
            socketHandler.emit(nsp, 'delete_request', requestId.toHexString());
        },

        emitStatusChanged: (requestId: Types.ObjectId, status: TaskStatus) => {
            socketHandler.emit(nsp, 'request_status_changed', {
                id: requestId.toHexString(),
                status: status
            });
        }
    }
}