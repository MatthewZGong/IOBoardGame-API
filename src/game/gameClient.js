import { MapClient } from "./hexaboard.js"

export default class GameClient{
    constructor(){
        this.characters = [] 
        this.map = new MapClient() 

    }
    gameStart(roomID){
        this.map.hexagon(5)
        return;
    }
    getHexMap(){
        return this.map.getHexMap();
    }
    getPath(center, distance){
        return this.map.bfs(center, distance);
    }
}