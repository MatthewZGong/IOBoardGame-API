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
      return item;
    }
  
    peek() {
      return this.items[this.headIndex];
    }
  
    length() {
      return this.tailIndex - this.headIndex;
    }
  }
  
class Hex{
    static directions =[ new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
    constructor(q,r,s = -q-r){
        this.vector = [q,r,s];
        this.object = null 
    }
    setVector(v){
        this.vector = v
    }
    // constructor(q,r){
    //     this.vector = [q,r,-q-r];
    // }
    setCharacter(character){
        this.character = character
    }
    equals(otherHex){
        return this.vector == otherHex.vector;
    }  
    add(otherhex){
        return new Hex(this.vector[0]+otherhex.vector[0], this.vector[1]+otherhex.vector[1],this.vector[2]+otherhex.vector[2] );
    }
    subtract(otherhex){
        return new Hex(this.vector[0]-otherhex.vector[0], this.vector[1]-otherhex.vector[1],this.vector[2]-otherhex.vector[2] );
    }
    multiply(factor){
        return new Hex(this.vector[0]*factor, this.vector[1]*factor,this.vector[2]*factor );
    }
    length(v){
        return ( Math.abs(this.vector[0]) + Math.abs(this.vector[1])+Math.abs(this.vector[2]) ) /2 ;
    }
    distance(otherhex){
        return this.subtract(otherhex).length()
    }
    neighbor(d){
        d = (6 + (d % 6)) % 6
        return this.add(Hex.directions[d])
    }
    toString(){
        return this.vector.toString()
    }
    round(){
        var qi = Math.round(this.vector[0]);
        var ri = Math.round(this.vector[1]);
        var si = Math.round(this.vector[2]);
        var q_diff = Math.abs(qi - this.vector[0]);
        var r_diff = Math.abs(ri - this.vector[1]);
        var s_diff = Math.abs(si - this.vector[2]);
        if (q_diff > r_diff && q_diff > s_diff) {
            qi = -ri - si;
        }
        else if (r_diff > s_diff) {
            ri = -qi - si;
        }
        else {
            si = -qi - ri;
        }
        return new Hex(qi, ri, si);
    }
}
Hex.prototype.toString = function(){ return this.vector.toString(); }
class Layout{
    
    constructor(orientation, size, origin){
        this.size = size 
        this.origin = origin 
        this.orientation = orientation
    }

    hexToPixel(hex){
        const or = this.orientation
        const size = this.size
        const origin = this.origin
        const vec = hex.vector
        const x = (or.f0 * vec[0] + or.f1 * vec[1]) * size.x;
        const y = (or.f2 * vec[0] + or.f3 * vec[1]) * size.y;
        return new Point(x + origin.x ,y+ origin.y)
    }

    pixelToHex(p) {
        var or = this.orientation;
        var size = this.size;
        var origin = this.origin;
        var pt = new Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
        var q = or.b0 * pt.x + or.b1 * pt.y;
        var r = or.b2 * pt.x + or.b3 * pt.y;
        return new Hex(q, r, -q - r);
    }

    hexCornerOffset(corner) {
        var or = this.orientation;
        var size = this.size;
        var angle = 2.0 * Math.PI * (or.start_angle - corner) / 6.0;
        return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
    }
    getPolygonCorners(hex){
        var corners = [] 
        var center = this.hexToPixel(hex)
        for (var i = 0; i < 6; i++) {
            var offset = this.hexCornerOffset(i);
            corners.push(new Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
        
    }
}
class Point{
    constructor(x,y){
        this.x = x; 
        this.y = y
    }
}

class MapClient{
    constructor(){
        this.m = {};
        var or = new Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
        this.layout = new Layout(or, new Point(50, 50), new Point(400, 400));
    }
    parallelogram(width,length){

        for(var q = -(width>>1); q < width>>1; q++){
            for(let r = -(length>>1); r< length>>1; r++){
                let new_hex = new Hex(q,r);
                this.m[new_hex.toString()] = new_hex
            }
        }
    }
    hexagon(radius){
        for (var q = -radius; q <= radius; q++) {
            var r1 = Math.max(-radius, -q - radius);
            var r2 = Math.min(radius, -q + radius);
            for (let r = r1; r <= r2; r++) {
                let new_hex = new Hex(q,r);
                this.m[new_hex.toString()] = new_hex
            }
        }
    }
    rectangle(map_width, map_height){
        for (var r = -(map_height>>1); r < map_height>>1; r++) {
            var r_offset = r >> 1;  // or r>>1
            for (var q = -r_offset-(map_width>>1); q < (map_width>>1) - r_offset; q++) {
                let new_hex = new Hex(q,r);
                this.m[new_hex.toString()] = new_hex
            }
        }
    }
    hexToPixel(hex){
        return this.layout.hexToPixel(hex); 
    }
    pixelToHex(point){
        return this.layout.pixelToHex(point);
    }
    *[Symbol.iterator]() {
        for(let key in this.m){
            yield this.m[key]
        }
    }
    bfs(hex,distance){
        let queue = new Queue();
        hex = new Hex(hex.vector[0],hex.vector[1],hex.vector[2])
        queue.enqueue(hex);
        let stop = false;
        let res = [];
        while(queue.length() != 0 && stop == false ){
            let current_hex = queue.dequeue();
            if(current_hex.distance(hex) > distance){
                stop = true;
            }else{
                if(current_hex.toString() in this.m && this.m[current_hex.toString()].object == null){
                    res.push(current_hex);
                    for(let i = 0; i < 6; i++){
                        queue.enqueue(current_hex.neighbor(i));

                    }
                }
            }
        }
        return res
    }
    getHexMap(){
        let hexs = [] 
        for(let key in this.m){
            hexs.push(this.m[key])
        }
        return hexs 
    }
}



class Orientation {
    constructor(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
        this.f0 = f0;
        this.f1 = f1;
        this.f2 = f2;
        this.f3 = f3;
        this.b0 = b0;
        this.b1 = b1;
        this.b2 = b2;
        this.b3 = b3;
        this.start_angle = start_angle;
    }
}


function HexagonMap(radius) {
    let map = new MapClient();
    map.hexagon(radius);
    return map
}

function ParallelogramMap(width, length) {
    let map = new MapClient();
    map.parallelogram(width, length);
    return map;
}

// var flat_top = new Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);
// var pointy_top = new Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
// var test_map = new MapClient();
// var test = new Layout(flat_top, new Point(50,50), new Point(400,300));
// test_map.hexagon(5)
// console.log("hi")
// let test_vec = new Hex(5,0)
// console.log(test_map.m)
// console.log(test_vec)
// console.log(test_vec.toString() in test_map.m)
// console.log("h")
// for(let hex of test_map){
//     console.log(hex)
// }

// test_map.m.forEach((value) => { 
//     console.log(test.hexToPixel(value) )
// })

// var test_hex = new Hex(0,0);
// console.log(test_hex)
// console.log( test.getPolygonCorners(test_hex));
// console.log( test.hexToPixel(test_hex));s

export {MapClient, Layout, Orientation, Point, HexagonMap, ParallelogramMap}