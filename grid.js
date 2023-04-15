//https://weblog.jamisbuck.org/2011/1/3/maze-generation-kruskal-s-algorithm
//https://stackoverflow.com/questions/38502/whats-a-good-algorithm-to-generate-a-maze


var size = 20
var maze = []
var parents = []
var start
var exit
$(document).ready(function(){
    $("#maze").css("min-width", size*20+"px")
    var str = ""
    var iter = 0;
    for(let j = 0; j<size;j++){
        var line = []
        str += "<div class='row'>"
        for (let i = 0; i < size; i++){
            iter++
            var id = "Box_" + i +"_"+j
            var box = {
                html_id:"",
                value:-1,
                id: iter
            }
            box.html_id = id
            line.push(box)
          
            str += `<div id="`+box.html_id+`" class="box"></div>`
        }
        str+="</div>"
        maze.push(line)
    }
    $("#maze").append(str)
    gray_maze()
    gen_start()
    gen_end()
})

async function gray_maze(){
    for(let i = 0; i< size; i++){
        for(let j = 0; j < size; j++){
            $("#Box_"+j+"_"+i).css("background-color", "gray")
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

function remove_border(x, y, direction){ 
    if(direction == "R" && x != size-1){
        $("#Box_"+x+"_"+y).css("border-right", "solid white 2px")
        remove_neighbor_border(x+1, y, "L")
    }
    else if(direction == "L" && x != 0){
        $("#Box_"+x+"_"+y).css("border-left", "solid white 2px")
        remove_neighbor_border(x-1, y, "R")
    }
    else if(direction == "U" && y != 0){
        $("#Box_"+x+"_"+y).css("border-top", "solid white 2px")
        remove_neighbor_border(x, y-1, "D")
    }
    else if(direction == "D" && y != size-1){
        $("#Box_"+x+"_"+y).css("border-bottom", "solid white 2px")
        remove_neighbor_border(x, y+1, "U")
    }  
}

function remove_neighbor_border(x, y, direction){
    if(direction == "R" && x < size){
        $("#Box_"+x+"_"+y).css("border-right", "solid white 2px")
    }
    else if(direction == "L" && x > 0){
        $("#Box_"+x+"_"+y).css("border-left", "solid white 2px")
    }
    else if(direction == "U" && y > 0){
        $("#Box_"+x+"_"+y).css("border-top", "solid white 2px")
    }
    else if(direction == "D" && y < size){
        $("#Box_"+x+"_"+y).css("border-bottom", "solid white 2px")
    }
}

function check_move(x, y, direction){
    if(direction == "R" && x+1 < size){
        return true
    }
    else if(direction == "L" && x > 0){
        return true
    }
    else if(direction == "U" && y > 0){
        return true
    }
    else if(direction == "D" && y+1 < size){
        return true
    }
    else{
        return false
    }
}

var gen_box_size = size*.2
function gen_point_restricted(){
    return {
        "x":Math.floor(Math.random() * gen_box_size),
        "y":Math.floor(Math.random() * gen_box_size)
    }
}

function gen_point_full(){
    return {
        "x":Math.floor(Math.random() * size),
        "y":Math.floor(Math.random() * size)
    }
}
function gen_start(){
    let point = gen_point_restricted()
    if(Math.random() > .5){
        point.x += size - gen_box_size
    }
    if(Math.random() > .5){
        point.y += size - gen_box_size
    }
    $("#Box_"+point.y+"_"+point.x).css("background-color", "red")
    start = point
    
}

function gen_end(){
    let point = gen_point_full()
    var distance = Math.sqrt(Math.pow((point.x - start.x), 2) + Math.pow((point.y - start.y), 2))
    while(distance < Math.floor(size*.75)){
        console.log(distance)
        point = gen_point_full()
        distance = Math.sqrt(Math.pow((point.x - start.x), 2) + Math.pow((point.y - start.y), 2))
    }
    $("#Box_"+point.y+"_"+point.x).css("background-color", "green")
    exit = point
    
}