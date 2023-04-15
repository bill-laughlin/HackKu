var size = 30
var maze = []
$(document).ready(function(){
    $("#maze").css("min-width", size*20+"px")
    var str = ""
    for(let j = 0; j<size;j++){
        var line = []
        str += "<div class='row'>"
        for (let i = 0; i < size; i++){
            var id = "Box_" + i +"_"+j
            line.push(id)
          
            str += `<div id="`+id+`" class="box"></div>`
        }
        str+="</div>"
        maze.push(line)
    }
    $("#maze").append(str)
    $("#Box_1_1").css('background', 'red')
    console.log("READY")
    test()
    console.log("TESTS")
})

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