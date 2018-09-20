import * as SocketIO from 'socket.io';

export class Socket {

    public socket: SocketIO.Server

    constructor(server: any) {
        this.socket = SocketIO(server);
        this.socket.on('connection', (socket: SocketIO.Socket) => {
            console.log('Connection has established');
        });
    }

    emit(nsp: string, eventName: string, data: any) {
        this.socket.of(nsp).emit(eventName, data);
    }
}