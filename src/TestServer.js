import { Server } from 'socket.io';
import http from 'node:http';
import {MapClient, Hex} from "./game/hexaboard.js";
const server = http.createServer();

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:8000']
    }
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});

io.on('connection', (socket) => {
    console.log('user ' + socket.id + ' connected');
    const map = new MapClient();
    map.hexagon(5);
    let hexes = []
    for(const hex of map){
        hexes.push(hex)
    }

    const ally_char = {
        pos: [0, 0, 0],
        atk_acts: ['atk 1', 'atk 2'],
        def_acts: ['def 1', 'def 2'],
        idle_acts: ['idle 1'],
        range: 3
    }

    const def_char = {
        pos: [3, -2, -1],
        atk_acts: ['ATTACK 1', 'ATTACK 2'],
        def_acts: ['DEFEND 1', 'DEFEND 2'],
        idle_acts: ['IDLE 1'],
        range: 2
    }

    socket.on('request-map', (callback) => {
        callback(hexes, [ally_char.pos], [def_char.pos])
    })

    socket.on('request-map.distance', (tile, distance, callback) => {
        const center_hex = {vector: tile}
        let requested_hexes = map.bfs(center_hex, distance)
        callback(requested_hexes)
    })

    socket.on('request-map.char-range', (charId, callback) => {
        const char = charId === 1 ? ally_char : def_char
        const centerHex = {
            vector: char.pos
        }
        let requested_hexes = map.bfs(centerHex, char.range)
        callback(requested_hexes)
    })

    socket.on('move-char', (charId, tile, callback) => {
        const char = charId === 1 ? ally_char : def_char
        char.pos = tile
        callback()
    })

    socket.on('request-char.actions', (charId, callback) => {
        const char = charId === 1 ? ally_char : def_char
        const other = charId === 1 ? def_char : ally_char

        const charHex = new Hex(char.pos[0], char.pos[1])
        const otherHex = new Hex(other.pos[0], other.pos[1])
        const dist = charHex.distance(otherHex)

        const {atk_acts, idle_acts} = char

        callback((dist <= 1 ? atk_acts : []).concat(idle_acts))
    })


});