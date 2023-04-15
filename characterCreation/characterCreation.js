/*==============================================
CHARACTER CREATION 
use function getCharacterURL() to get url source
===============================================*/

// initialize global vars of increments of each character component and background color tone
var increment_eyebrows
var increment_eyes
var increment_glasses
var increment_mouth
var character_tone

// define constants of maximum values
const max_eyebrows = 14
const max_eyes = 25
const max_glasses = 4
const max_mouth = 29

// immediately randomize character
window.onload = function() {
    characterRandomChange()
    characterUpdate()
}

// update the preview using the global vars
function characterUpdate()
{
    var index_eyebrows = (increment_eyebrows+max_eyebrows)%max_eyebrows
    var index_eyes = (increment_eyes+max_eyes)%max_eyes
    var index_glasses = (increment_glasses+max_glasses)%max_glasses
    var index_mouth = (increment_mouth+max_mouth)%max_mouth

    var urlstr = "https://api.dicebear.com/6.x/adventurer-neutral/svg?seed=Shea"
    urlstr += "&eyebrows=variant"+(index_eyebrows+1).toString().padStart(2, "0")
    urlstr += "&eyes=variant"+(index_eyes+1).toString().padStart(2, "0")
    urlstr += "&mouth=variant"+(index_mouth+1).toString().padStart(2, "0")
    urlstr += "&glassesProbability="+(index_glasses==0 ? "0" : "100"+
              "&glasses=variant"+(index_glasses+1).toString().padStart(2, "0"))
    urlstr += "&backgroundColor="+character_tone

    document.getElementById("cc-character-preview").src = urlstr

    increment_eyebrows = index_eyebrows
    increment_eyes = index_eyes
    increment_glasses = index_glasses
    increment_mouth = index_mouth
    document.getElementById("cc-color").value = "#"+character_tone
}

// used by the html event handlers to update the global vars
function characterPreviewChange(type, value)
{
    if (type == "eyebrows") {
        increment_eyebrows += value
    } else if (type == "eyes") {
        increment_eyes += value
    } else if (type == "glasses") {
        increment_glasses += value
    } else if (type == "mouth") {
        increment_mouth += value
    } else if (type == "tone") {
        character_tone = value.slice(1)
    }
    characterUpdate()
}

// randomizes global vars and update the preview
function characterRandomChange()
{
    increment_eyebrows = Math.round(Math.random()*max_eyebrows)
    increment_eyes = Math.round(Math.random()*max_eyes)
    increment_glasses = Math.round(Math.random()*max_glasses)
    increment_mouth = Math.round(Math.random()*max_mouth)
    character_tone = Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
    characterUpdate()
}

// returns avatar URL from the api
function getCharacterURL() {return document.getElementById("cc-character-preview").src}
