var size = 30
var maze = []
$(document).ready(function(){
    $("#maze").css("min-width", 30*20+"px")
    var str = ""
    for(let j = 0; j<size;j++){
        var line = []
        str += "<div class='row'>"
        for (let i = 0; i < size; i++){
            var id = "Box_" + j +"_"+i
            line.push(id)
          
            str += `<div id="`+id+`" class="box"></div>`
        }
        str+="</div>"
        console.log(line)
        maze.push(line)
    }
    console.log(maze)
    $("#maze").append(str)
    $("#Box_1_1").css('background', 'red')
})