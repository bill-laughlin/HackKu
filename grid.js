//https://weblog.jamisbuck.org/2011/1/3/maze-generation-kruskal-s-algorithm
//https://stackoverflow.com/questions/38502/whats-a-good-algorithm-to-generate-a-maze



var size = 20


var box_dimension = 30

var vision = 7 //boxes up or down
//if 3, total vision is a 7x7 grid (one in the center for a player)

var maze = []
var parents = []
var start = {"x":0, "y":0}
var exit = {"x":0, "y":0}
var key = {"x":0, "y":0}
var isKeyFound = false
var fullVision = false

var start = false


var visited = [];
var numcells = size * size    
for (var i = 0; i < numcells; i++) {
    visited.push(false);
}

var player = {"x":0, "y":0}



$(document).ready(function(){
    start_sequence()
})

async function start_sequence() {
    
    const myPromise = new Promise(async (resolve, reject) => {
        // do something async
        generateBox()
        $("#Box_"+player.x+"_"+player.y).css("background-image", "")
        $("#Box_"+start.x+"_"+start.y).css("background-color", "transparent")
        $("#Box_"+key.x+"_"+key.y).css("background-color", "transparent")
        $("#Box_"+exit.x+"_"+exit.y).css("background-color", "transparent")
        await gray_maze()
        visitedArrayRefresh()
        for(let i = 0; i< size; i++){
            for(let j = 0; j < size; j++){
                $("#Box_"+j+"_"+i).css("background-color", "transparent")
            }
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        resolve(); // fulfilled
    }).then(function(){    
        const newpromise = new Promise(async (resolve, reject) => {
            // do something async
            await recGenerate(Math.floor(Math.random() * numcells))
            resolve(); 
        }).then(function(){ 
            $("#Box_"+player.x+"_"+player.y).css("background-image", "")
            gen_start()
            gen_end()
            gen_key()
            start = true; //
            gen_mask()
            move_mask()
            isKeyFound = false
            start = false;
            document.getElementById("Box_"+player.x+"_"+player.y).style.backgroundImage = "url('character.svg')"
            stopConfetti()
        })


    });
    
    
}


async function gray_maze(){
    for(let i = 0; i< size; i++){
        for(let j = 0; j < size; j++){
            $("#Box_"+j+"_"+i).css("background-color", "gray")
            $("#Box_"+j+"_"+i).css("border", "2px solid black")
            $("#Mask_"+j+"_"+i).css("background-color", "transparent")
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

//this function will "remove" a wall from a point (x,y) in the direction specified
//removing the wall is done by changing the color from black to white
//since each box has walls, it will need to remove its neighbor's wall that 
//intersects with it
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

//this function is called from its neighbor and turns the adjacent wall white
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


var gen_box_size = size*.2 // geneates a size of the corner that is 20% of the total size of the maze
//gen_point_restricted generates a point in a box that is 20% of the in the x and
// 20% of the size in the y of the entire box
function gen_point_restricted(){
    return {
        "x":Math.floor(Math.random() * gen_box_size),
        "y":Math.floor(Math.random() * gen_box_size)
    }
}

//gen_point_full generates a point within the entire box
function gen_point_full(){
    return {
        "x":Math.floor(Math.random() * size),
        "y":Math.floor(Math.random() * size)
    }
}


//gen_start picks the starting point of the player
function gen_start(){
    //need to clear previous start box
    $("#Box_"+start.x+"_"+start.y).css("background-color", "transparent")
    
    //gen a restricted point to ensure that an end point can be far enough away
    // from the start to make it difficult
    let point = gen_point_restricted()

    //have a 50* chance to move x and y direction to other corners of the board
    if(Math.random() > .5){
        point.x += size - gen_box_size
    }
    if(Math.random() > .5){
        point.y += size - gen_box_size
    }

    //update the color of the starting box
    // $("#Box_"+point.x+"_"+point.y).css("background-color", "red")

    //set the players starting positon
    player = {"x": point.x, "y": point.y};

    //record the starting position in the global variable
    start = point
}

//gen end generates a point that is at least 75% of board's size away from the starting point
//this is done to ensure that the board is difficult
function gen_end(){
    //clear the current endpoint and turn it transparent
    $("#Box_"+exit.x+"_"+exit.y).css("background-color", "transparent")

    //generate a point anywhere on the board
    let point = gen_point_full()

    //check the initial distance and make sure its far enough away
    var distance = Math.sqrt(Math.pow((point.x - start.x), 2) + Math.pow((point.y - start.y), 2))
    
    //if it is not far enough away, regenerate another point and check again
    while(distance < Math.floor(size*.75)){
        console.log(distance)
        point = gen_point_full()
        distance = Math.sqrt(Math.pow((point.x - start.x), 2) + Math.pow((point.y - start.y), 2))
    }

    //when a point is far enough away, change the color to green
    $("#Box_"+point.x+"_"+point.y).css("background-image", "url('door_icon.png')")

    //record the ending point
    exit = point
}


function gen_key(){
    let point = gen_point_full()
    var distance = Math.sqrt(Math.pow((point.x - start.x), 2) + Math.pow((point.y - start.y), 2))
    while(distance < Math.floor(size*.75)){
        console.log(distance)
        point = gen_point_full()
        distance = Math.sqrt(Math.pow((point.x - start.x), 2) + Math.pow((point.y - start.y), 2))
    }
    $("#Box_"+point.x+"_"+point.y).css("background-image", "url('key_icon2.png')")

    if (start != point && exit != point){ 
        key = point
    }
    else{
        gen_key() // point is at start or exit so recalculate
    }
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

async function recGenerate(cell){
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


function checkGoal(){
    if (player.x == key.x && player.y == key.y){
        isKeyFound = true
        $("#Box_"+player.x+"_"+player.y).css("background-image", "")
        //key found message goes here
    }
    if (isKeyFound == true && player.x == exit.x && player.y == exit.y){
        celebration()
    }
}

async function celebration(){
    // confetti
    // up level
    startConfetti()
    await new Promise(resolve => setTimeout(resolve, 10000))
    start_sequence()
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
        
        checkGoal()

        tile = document.getElementById("Box_"+player.x+"_"+player.y)
        tile.style.backgroundImage = "url('character.svg')" //url is placeholder for now
        move_mask()
    }
});

function visitedArrayRefresh(){
    visited.length = 0 // remove all values
    numcells = size * size  // might need to have another here function for size changes
    for (var i = 0; i < numcells; i++) {
        visited.push(false);
    }
}

function mazeResize(newsize){
    if (newsize == size){
        return
    }
    size = newsize
    // update visited array
    // generage new maze
}

//this function will generate a board ontop of the maze that is positioned identically
//this is done to be able to control which blocks are shown and which are not
function gen_mask(){
    //clear out the previous mask
    $("#mask_maze").empty()
    if(fullVision == true)
    {
        console.log("return")
        return
    }
    console.log("run mask")

    //start a html string to append to the mask
    var str = ""

    //loop through and create size^2 boxes
    for(let j = 0; j<size;j++){
        str += "<div class='row'>" //delcare a row
        for (let i = 0; i < size; i++){
            var id = "Mask_" + i +"_"+j //genearte a unique id
            
            str += `<div id="`+id+`" class="mask_box`
            if(start == true){ //if this is a start sequence, add the mask animation to fade in
                str+= " mask_animation"
            }
            str+= `"></div>`
        }
        str+="</div>"
    }
    //append the mask object to the mask div
    $("#mask_maze").append(str)

}

function toggleVisability(level){
    var levelArr = [0, 15, 10, 5]

    vision = levelArr[level]
    if(level != 0)
    {
        fullVision = false
    }
    else
    {
        fullVision = true
    }
    start_sequence()
}

//this is called every time that the player moves
//it will make the boxes around the player transpannt in the mask
//this simulates a keyhole view
function move_mask(){
    //gen_mask() //need to genearte a new mask if player wants a real challange
    //this will allow only the boxes around the player to be visible (not remember where he's been)
    
    console.log(player)
    for(let i = player.x-vision;i< player.x+(vision+1); i++){
        for(let j = player.y-vision; j< player.y+(vision+1); j++){
            $("#Mask_"+i+"_"+j).css("background-color", "transparent")
        }
    }
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
    start_sequence()
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
