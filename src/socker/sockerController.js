import { Server } from 'socket.io';
import { MapClient } from "../game/hexaboard.js"
import RoomManager from "./roomManager.js"
import dotenv from 'dotenv'
const app = app => {
    dotenv.config()
    console.log(process.env.CLIENT_ORIGIN)
    const io = new Server(app, {
        cors: {
            origin: [process.env.CLIENT_ORIGIN]
        }
    });
    let  roomManager = new  RoomManager(io,"/"); 
    console.log('connected')
    io.on('connection', (socket) => {
        console.log('user ' + socket.id + ' connected');
        var map = new MapClient(); 
        map.hexagon(5);
        let hexes = []
        for(const hex of map){
            hexes.push(hex)
        }
        

        roomManager.joinClassicQueue(socket.id, io)
    });
    io.of("/").adapter.on("leave-room", (room, id) => {
        console.log(`${id} left ${room}`)
        roomManager.deleteRoom(room)
        console.log("llulululululu")
    });

    return io;
}
export default app;