//https://weblog.jamisbuck.org/2011/1/3/maze-generation-kruskal-s-algorithm
//https://stackoverflow.com/questions/38502/whats-a-good-algorithm-to-generate-a-maze


var size = 100
var maze = []
var start
var exit = {}
$(document).ready(function(){
    $("#maze").css("min-width", size*20+"px")
    var str = ""
    for(let j = 0; j<size;j++){
        var line = []
        str += "<div class='row'>"
        for (let i = 0; i < size; i++){
            var box = {}
            box.id = "Box_" + i +"_"+j
            box.value = -1
            line.push(id)
          
            str += `<div id="`+box.id+`" class="box"></div>`
        }
        str+="</div>"
        maze.push(line)
    }
    $("#maze").append(str)
    // gray_maze()
    // test()
    gen_start()
})

async function gray_maze(){
    for(let i = 0; i< size; i++){
        for(let j = 0; j < size; j++){
            $("#Box_"+j+"_"+i).css("background-color", "gray")
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

function test(){
    for(let i = 0; i < size; i++){
        for(let j = 0; j < size; j++){
            var rand = Math.floor(Math.random() * 4);
            if(rand ==  0){
                remove_border(i, j, "R")
            }
            else if(rand == 1){
                remove_border(i, j, "L")
            }
            else if(rand == 2){
                remove_border(i, j, "U")
            }
            else if(rand == 3){
                remove_border(i, j, "D")
            }
        }
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

var gen_box_size = 20
function gen_point(){
    return {
        "x":Math.floor(Math.random() * gen_box_size),
        "y":Math.floor(Math.random() * gen_box_size)
    }
}
function gen_start(){
    let point = gen_point()
    console.log(point)
    if(Math.random() > .5){
        point.x += 100 - gen_box_size
    }
    if(Math.random() > .5){
        point.y += 100 - gen_box_size
    }
    $("#Box_"+point.y+"_"+point.x).css("background-color", "red")
    start = point
    console.log(start)
    
}