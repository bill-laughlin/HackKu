//https://weblog.jamisbuck.org/2011/1/3/maze-generation-kruskal-s-algorithm
//https://stackoverflow.com/questions/38502/whats-a-good-algorithm-to-generate-a-maze


var size = 20
var box_dimension = 30

var vision = 3 //boxes up or down
//if 3, total vision is a 7x7 grid (one in the center for a player)

var maze = []
var parents = []
var start = {"x":0, "y":0}
var exit = {"x":0, "y":0}



var visited = [];
var numcells = size * size    
for (var i = 0; i < numcells; i++) {
    visited.push(false);
}

var player = {"x":0, "y":0}



$(document).ready(function(){
    $("#maze").css("width", size*box_dimension+"px")
    $("#maze").css("height", size*box_dimension+"px")
    $("#mask_maze").css("width", size*box_dimension+"px")
    $("#mask_maze").css("height", size*box_dimension+"px")
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
    //gray_maze()
    recGenerate(Math.floor(Math.random() * numcells))
    gen_start()
    player = start
    gen_end()

    // gen_mask()
    // move_mask()
})

async function gray_maze(){
    for(let i = 0; i< size; i++){
        for(let j = 0; j < size; j++){
            $("#Box_"+j+"_"+i).css("background-color", "gray")
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

function remove_wall(x, y, direction){ 
    if(direction == "R"){
        $("#Box_"+x+"_"+y).css("border-right", "solid white 2px")
        remove_neighbor_wall(x+1, y, "L")
    }
    else if(direction == "L"){
        $("#Box_"+x+"_"+y).css("border-left", "solid white 2px")
        remove_neighbor_wall(x-1, y, "R")
    }
    else if(direction == "U"){
        $("#Box_"+x+"_"+y).css("border-top", "solid white 2px")
        remove_neighbor_wall(x, y-1, "D")
    }
    else if(direction == "D"){
        $("#Box_"+x+"_"+y).css("border-bottom", "solid white 2px")
        remove_neighbor_wall(x, y+1, "U")
    }  
}

function remove_neighbor_wall(x, y, direction){
    if(direction == "R"){
        $("#Box_"+x+"_"+y).css("border-right", "solid white 2px")
    }
    else if(direction == "L"){
        $("#Box_"+x+"_"+y).css("border-left", "solid white 2px")
    }
    else if(direction == "U"){
        $("#Box_"+x+"_"+y).css("border-top", "solid white 2px")
    }
    else if(direction == "D"){
        $("#Box_"+x+"_"+y).css("border-bottom", "solid white 2px")
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
    $("#Box_"+start.x+"_"+start.y).css("background-color", "transparent")
    let point = gen_point_restricted()
    if(Math.random() > .5){
        point.x += size - gen_box_size
    }
    if(Math.random() > .5){
        point.y += size - gen_box_size
    }
    $("#Box_"+point.x+"_"+point.y).css("background-color", "red")
    player = {"x": point.x, "y": point.y};
    start = point
}

function gen_end(){
    $("#Box_"+exit.x+"_"+exit.y).css("background-color", "transparent")
    let point = gen_point_full()
    var distance = Math.sqrt(Math.pow((point.x - start.x), 2) + Math.pow((point.y - start.y), 2))
    while(distance < Math.floor(size*.75)){
        console.log(distance)
        point = gen_point_full()
        distance = Math.sqrt(Math.pow((point.x - start.x), 2) + Math.pow((point.y - start.y), 2))
    }
    $("#Box_"+point.x+"_"+point.y).css("background-color", "green")
    exit = point
}

function findNewCell(cell, direction){
    var directionCalc = [1, -1, -size, size] // R, L, U, D
    var num = cell + directionCalc[direction]

    // error check for going off the grid
    if(num % size == 0 && direction == 0){ // Right border
        num = -1
    }
    else if(num < 0){ // Top border
        num = -1
    }
    else if(num > numcells-1){ // Bottom border
        num = -1 
    }
    else if(((num+1) % size) == 0 && direction == 1){ // Left border
        num = -1
    }
    return num
}

function isValid(newcell){
    // values of -1 are off the grid (handled in findNewCell)
    if(newcell == -1){
        return false
    }
    return !visited[newcell]
}

function recGenerate(cell){
    var alphaDirections = ["R", "L", "U", "D"]
    var arrayDirections = [0, 1, 2, 3] // R, L, U, D
    var randDirections = []
    
    // randomize order of directions to visit
    for(let i = 0; i < 4; i++){
        var rand = Math.floor(Math.random() * arrayDirections.length);
        var value = arrayDirections[rand]
        randDirections.push(value)
        arrayDirections.splice(rand, 1)
    }
    
    for(let i = 0; i < 4; i++){
        var direction = randDirections[i] // R, L, U, D
        var newcell = findNewCell(cell, direction) // get newcell's number
        if(isValid(newcell)){
            var x = cell % size
            var y = (cell - x) / size
            remove_wall(x, y, alphaDirections[direction])            
            visited[newcell] = true // mark newcell as visited
            recGenerate(newcell) // recursively move to newcell
        }
    }
}


document.addEventListener('keydown', function(event) {
    if (event.keyCode >= 37 && event.keyCode <= 40) {
        event.preventDefault();

        var tile = document.getElementById("Box_"+player.x+"_"+player.y)
        const borderOpen = "rgb(255, 255, 255)";
        
        tile.style.backgroundImage = "";

        computedStyle = window.getComputedStyle(document.getElementById("Box_"+player.x+"_"+player.y));
        const borderTopColor = computedStyle.getPropertyValue('border-top-color');
        const borderRightColor = computedStyle.getPropertyValue('border-right-color');
        const borderBottomColor = computedStyle.getPropertyValue('border-bottom-color');
        const borderLeftColor = computedStyle.getPropertyValue('border-left-color');
        console.log(borderTopColor+" "+borderBottomColor+" "+borderLeftColor+" "+borderRightColor);

        if (event.code === 'ArrowUp' && borderTopColor == borderOpen) {
            player.y--
        } else if (event.code === 'ArrowDown' && borderBottomColor == borderOpen) {
            player.y++
        } else if (event.code === 'ArrowLeft' && borderLeftColor == borderOpen) {
            player.x--
        } else if (event.code === 'ArrowRight' && borderRightColor == borderOpen) {
            player.x++
        }
        
        tile = document.getElementById("Box_"+player.x+"_"+player.y)
        tile.style.backgroundImage = "url('https://play-lh.googleusercontent.com/IeNJWoKYx1waOhfWF6TiuSiWBLfqLb18lmZYXSgsH1fvb8v1IYiZr5aYWe0Gxu-pVZX3')" //url is placeholder for now
        // move_mask()
    }

    

    tile = document.getElementById("Box_"+player.x+"_"+player.y)
    tile.style.backgroundImage = "url('https://play-lh.googleusercontent.com/IeNJWoKYx1waOhfWF6TiuSiWBLfqLb18lmZYXSgsH1fvb8v1IYiZr5aYWe0Gxu-pVZX3')" //url is placeholder for now
    // move_mask()
});

function visitedArrayRefresh(){
    visited.length = 0 // remove all values
    numcells = size * size  // might need to have another here function for size changes
    for (var i = 0; i < numcells; i++) {
        visited.push(false);
    }
}

function gen_mask(){
    $("#mask_maze").empty()
    var str = ""
    for(let j = 0; j<size;j++){
        var line = []
        str += "<div class='row'>"
        for (let i = 0; i < size; i++){
            var id = "Mask_" + i +"_"+j
            line.push(id)
          
            str += `<div id="`+id+`" class="mask_box"></div>`
        }
        str+="</div>"
        maze.push(line)
    }
    $("#mask_maze").append(str)
}

function move_mask(){
    gen_mask()
    console.log(player)
    for(let i = player.x-vision;i< player.x+(vision+1); i++){
        for(let j = player.y-vision; j< player.y+(vision+1); j++){
            $("#Mask_"+i+"_"+j).css("background-color", "transparent")
        }
    }
}

function resetBoard(){
	visitedArrayRefresh()
	for(let i = 0; i< size; i++){
        for(let j = 0; j < size; j++){
            $("#Box_"+j+"_"+i).css("border", "2px solid black")
        }
    }
    recGenerate(Math.floor(Math.random() * numcells))
    gen_start()
    gen_end()
}

function resetSize(){
	for(let i = 0; i< size; i++){
        for(let j = 0; j < size; j++){
            $("#Box_"+j+"_"+i).css("border", "2px solid white")
        }
    }
}

function mazeResize(newsize){
    if (newsize == size){
        return
    }
    resetSize()
    size = newsize
    generateBox()
    resetBoard()
}

function generateBox(){
    $("#maze").empty()
    $("#maze").css("width", size*box_dimension+"px")
    $("#maze").css("height", size*box_dimension+"px")
    $("#mask_maze").css("width", size*box_dimension+"px")
    $("#mask_maze").css("height", size*box_dimension+"px")
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
}

function directions(){
    alert(`Welcome to the maze!\n
    \nWhen you are ready, select 'Generate New Maze'.\n
    \nIf you would like to generate a new maze before you finish, select 'Generate New Maze'.\n
    \nNavigate to the exit using the arrow keys.\n
    \nTo make exit available, you must find and collect the key."
    `)
}