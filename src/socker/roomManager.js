import { MapClient } from "../game/hexaboard.js";

export default class RoomManager{
    constructor(){
        this.rooms = null; 
        this.gameclients = {};
        this.queue = new Queue();
        this.room_num = 1
        

    }
    joinClassicQueue(socketID,io){
        if(this.queue.peek() == null){
            this.queue.enqueue(socketID);
        }else{
            //console.log(io)
            let player1ID = this.queue.dequeue()  
            //console.log(io.of("/"))
            let namesapceIO = io.of("/")
            let player1 = namesapceIO.sockets.get(player1ID)
            let player2 = namesapceIO.sockets.get(socketID)
            let new_room = `room${this.room_num}`
            // this.room_num += 1 
            this.room_num += 1 
            player1.join(new_room)
            player2.join(new_room)
            let map = new MapClient();
            this.gameclients[new_room] = map;
            map.hexagon(5);
            this.gameINIT(player1)
            this.gameINIT(player2)
            io.to(new_room).emit("game-start")
        }
    }
    gameINIT(socket){
      socket.on('request-map', (callback) => {
        console.log("request-map 2")
        callback(this.getHexMap("room1"))
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
  