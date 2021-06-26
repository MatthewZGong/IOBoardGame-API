import { Server } from 'socket.io';
import { MapClient } from "../game/hexaboard.js"
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
        map.hexagon(5);
        let hexes = []
        for(const hex of map){
            hexes.push(hex)
        }

        socket.on('request-map', (callback) => {
            callback(hexes)
        })

        socket.on('request-map.distance', (tile, distance, callback) => {
            const center_hex = {vector: tile}
            let requested_hexes = []
            for (let hex of map) {
                if (hex.distance(center_hex) === distance) {
                    requested_hexes.push(hex)
                }
            }
            callback(requested_hexes)
        })

    });

    return io;
}
export default app;