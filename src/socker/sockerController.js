import { Server } from 'socket.io';
import { MapClient } from "../game/hexaboard"
const app = app => {
    const io = new Server(app, {
        cors: {
            origin: ['http://localhost:8000']
        }
    });

    console.log('connected')
    io.on('connection', (socket) => {
        console.log('user ' + socket.id + ' connected');
        var map = new MapClient(); 
        map.hexagon(10); 
        var cords = [] 
        for(const hex of map){
            cords.push(map.hexToPixel(hex))
        }
        socket.emit("init board", cords)
        // socket.on("click", (cord) =>{
        //     map.pixelToHex(cord)
        // }); 
    }); 
    return io;
}
export default app;