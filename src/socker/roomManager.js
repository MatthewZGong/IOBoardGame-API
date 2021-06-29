import GameClient from "../game/gameClient.js"

export default class RoomManager{
    constructor(server, namespace){
        this.socRoom= {}; 
        this.rooms = new Set();
        this.gameclients = {};
        this.queue = new Queue();
        this.room_num = 1
        this.io = server
        this.namespace = namespace
        this.roomSetUp(server)

    }
    joinClassicQueue(socketID){
        if(this.queue.peek() == null){
            this.queue.enqueue(socketID);
        }else{
            //console.log(io)
            let player1ID = this.queue.dequeue()  
            //console.log(io.of("/"))
            let namesapceIO = this.io.of(this.namespace)
            let player1 = namesapceIO.sockets.get(player1ID)
            let player2 = namesapceIO.sockets.get(socketID)
            let new_room = `room${this.room_num}`
            // this.room_num += 1 
            this.room_num += 1 
            player1.join(new_room)
            player2.join(new_room)
            let game = new GameClient();
            this.gameclients[new_room] = game;
            game.gameStart(new_room);
            this.rooms.add(new_room)
            this.socRoom[player1.id] = new_room
            this.socRoom[player2.id] = new_room

            this.gameINIT(player1)
            this.gameINIT(player2)
            this.io.to(new_room).emit("game-start")
        }
    }
    roomSetUp(io){
      io.of(this.namespace).adapter.on("create-room", (room) => {
        console.log(`room ${room} was created`);
      });
      // io.of(this.namespace).adapter.on("leave-room", (room, id) => {
      //     console.log(`${id} left ${room}`)
      //     if(this.rooms.has(room)){
      //       this.deleteRoom(room)
      //     }
      // });
      io.of(this.namespace).adapter.on("delete-room", (room) => {
        console.log(`${room} was deleted`)
    });

    }
    deleteRoom(room){
      if(this.rooms.has(room)){
        this.rooms.delete(room)
        console.log(this.rooms)
        delete this.gameclients[room]
        this.io.to(room).emit("game-stop")
      }
    } 
    gameINIT(socket){
      socket.on('request-map', (callback) => {
        console.log("request-map 2")
        if(!(socket.id in this.socRoom)){
          return 
        }
        callback(this.getHexMap(this.socRoom[socket.id]))
      })
      socket.on('request-map.distance', (tile, distance, callback) => {
        const center_hex = {vector: tile}   
        if(!(socket.id in this.socRoom)){
          return 
        }
        if(!(this.socRoom[socket.id] in this.gameclients)){
          return 
        }
        let requested_hexes = this.gameclients[this.socRoom[socket.id]].getPath(center_hex,distance)
        callback(requested_hexes)
      })


    }
    getHexMap(roomID){
      return this.gameclients[roomID].getHexMap();
    }
}
//place holder queue before we add mmr 
class Queue {
    constructor() {
      this.items = {};
      this.headIndex = 0;
      this.tailIndex = 0;
    }
  
    enqueue(item) {
      this.items[this.tailIndex] = item;
      this.tailIndex++;
    }
  
    dequeue() {
      const item = this.items[this.headIndex];
      delete this.items[this.headIndex];
      this.headIndex++;
      if(this.headIndex == this.tailIndex){
          this.reset(); 
      }
      return item;
    }
    reset(){
      this.headIndex = 0; 
      this.tailIndex = 0; 
    }
  
    peek() {
      return this.items[this.headIndex];
    }
  
    length() {
      return this.tailIndex - this.headIndex;
    }
  }
  