import { Server } from 'socket.io';
const app = app => {
    const io = new Server(app);
    // {
    //     transports: ['websocket'], // To avoid sticky sessions when using multiple servers
    //     path: '/classic-mode',
    //     cors: fixedOrigin(ALLOWLIST_HOSTS),
    //     rememberUpgrade: true,
    //   }
      io.on('connection', (socket) => {
        console.log('a user connected');
      });
      
    return io;
}
export default app;