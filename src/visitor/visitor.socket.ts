import { Socket } from "../helpers/socket.handler";
import { IVisitor } from "./visitor.interface";

export default function (socketHandler: Socket) {
    let nsp = '/visitor';
    return {
        emitVisitorUpdated: (visitor: IVisitor) => {
            socketHandler.emit(nsp, 'visitor_updated', visitor);
        },
    }
}