import { Server } from 'socket.io';
const app = app => {
    const io = new Server(app, {
        cors: {
            origin: ['http://localhost:8000']
        }
    });

    console.log('connected')
    io.on('connection', (socket) => {
        console.log('user ' + socket.id + ' connected');
    });
      
    return io;
}
export default app;