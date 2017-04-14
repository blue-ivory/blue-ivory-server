import * as SocketIO from 'socket.io';
import { Server } from "http";

export class Socket {

    private socket: SocketIO.Server

    constructor(server: any) {
        this.socket = SocketIO(server);
        this.socket.on('connection', (socket:SocketIO.Socket) => {
            console.log('Connection has established');
        });
    }
}