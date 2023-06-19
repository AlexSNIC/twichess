const game = document.querySelector("#game");
const tools = document.querySelectorAll("tool");
const ls_tableCanvas = localStorage.getItem("tableCanvas");
let tableCanvas = (ls_tableCanvas)?ls_tableCanvas: "default";

let whiteColor = true;
let kingsPlaced = {
    "w" : false, // white
    "b": false, // black
}
let hover = false;

let toolSelected = "eraser";
let toolBox = {
    "pawn": document.getElementById("pawn-tool"),
    "bishop": document.getElementById("bishop-tool"),
    "knight": document.getElementById("knight-tool"),
    "rook": document.getElementById("rook-tool"),
    "queen": document.getElementById("queen-tool"),
    "king": document.getElementById("king-tool"),
    "color": document.getElementById("color-tool"),
    "eraser": document.getElementById("eraser-tool"),
};



function first(){
    setup();
    tableCall();
    tableDraw(tableCanvas);
}
function setup(){
    window.addEventListener("pointerdown", (event) =>{
        hover = true;
    });
    window.addEventListener("pointerup", (event) =>{
        hover = false;
    });
    game.addEventListener("contextmenu", (event) =>{
        event.preventDefault();
    });
    document.addEventListener("keydown", (event) =>{
        if(event.key == "1"){
            toolSelect("pawn");
        }
        if(event.key == "2"){
            toolSelect("bishop");
        }
        if(event.key == "3"){
            toolSelect("knight");
        }
        if(event.key == "4"){
            toolSelect("rook");
        }
        if(event.key == "5"){
            toolSelect("queen");
        }
        if(event.key == "6"){
            toolSelect("king");
        }
        if(event.key == "e"){
            toolSelect("eraser");
        }
        if(event.key == "w"){
            toolSelect("color");
        }
        if(event.key == "c"){
            clearTable();
        }
        if(event.key == "d"){
            tableDraw('default');
        }
        if(event.key == "s"){
            dataSave();
        }
        if(event.key == "l"){
            dataLoad();
        }
        if(event.key == "a"){
            dataLoad();
        }
        
    })
}

function clearTable(){
    for(let i = 1; i <= 64; i++){
        erase(i);
    }
}

function tableDraw(_table){
    clearTable();
    if(_table == "default"){
        kingsPlaced.w = true;
        kingsPlaced.b = true;

        sq1.classList.add("wRookSp");
        sq8.classList.add("wRookSp");
        sq7.classList.add("wKnightSp");
        sq2.classList.add("wKnightSp");
        sq6.classList.add("wBishopSp");
        sq3.classList.add("wBishopSp");
        sq5.classList.add("wQueenSp");
        sq4.classList.add("wKingSp");
        for(let i = 9; i<=16; i++){
            eval(`sq${i}.classList.add("wPawnSp")`);
        }
        sq64.classList.add("bRookSp");
        sq57.classList.add("bRookSp");
        sq63.classList.add("bKnightSp");
        sq58.classList.add("bKnightSp");
        sq62.classList.add("bBishopSp");
        sq59.classList.add("bBishopSp");
        sq61.classList.add("bQueenSp");
        sq60.classList.add("bKingSp");
        for(let i = 49; i<=56; i++){
            eval(`sq${i}.classList.add("bPawnSp")`);
        }
    }
    else{
        if(_table == "!")return;

        kingsPlaced.w = false;
        kingsPlaced.b = false;
        _table = _table.split(",");
        let piece = _table.pop();
        while(piece != "!"){
            piece = piece.split(" ");
            let piecePoz = +piece.splice(-1);
            eval("sq" + piecePoz).classList.add(piece);
            if(piece == "wKingSp")kingsPlaced.w = true;
            if(piece == "bKingSp")kingsPlaced.b = true;
            piece = _table.pop();
        }
    }
    
    
    
}

function tableCall(){
    for(let i = 64; i>=1; i--){
        if( (Math.floor((i-1)/8) + 1 + i) % 2 == 0){
            game.innerHTML += `<div id="sq${i}" class="row${rowCheck(i)} col${colCheck(i)}" style="background-color: #EEEEEE"></div>`;
        }
        else {
            game.innerHTML += `<div id="sq${i}" class="row${rowCheck(i)} col${colCheck(i)}" style="background-color: #808080"></div>`;
        }
    }
    function rowCheck(par){
        return Math.round((par+3)/8);
    }
    function colCheck(par){
        return (((par+7)%8)-8)*-1;
    }
    for (let i = 64; i>=1; i--){
        eval(`const sq${i} = document.getElementById("sq${i}")`);
        eval(`sq${i}`).addEventListener("pointerup", (function(i) {
        return function() { spaceSelect(i)}})(i));
        eval(`sq${i}`).addEventListener("pointermove", (function(i) {
            return function() { pointerHold(i)}})(i));
    }
}
function pointerHold(sp){
    if(hover) spaceSelect(sp);
}
function toolSelect(tool){
    if(tool == toolSelected)return;
    if(tool == "color"){
        whiteColor = !whiteColor;
        let fromColor = whiteColor? "Black": "White";
        let toColor = whiteColor? "White" : "Black";
        for(let _tool in toolBox){
            if(_tool == "eraser") return;
            toolBox[_tool].src = toolBox[_tool].src.replace(fromColor, toColor);
        } 
        return;
    }
    toolBox[toolSelected].classList.remove("tool-selected");
    toolBox[tool].classList.add("tool-selected")
    toolSelected = tool;

    

}
//#region Selects
function spaceSelect(sp){
    if(toolSelected == "eraser") erase(sp);
    else if(toolSelected == "pawn") pieceSelect(sp, "PawnSp");
    else if(toolSelected == "bishop") pieceSelect(sp, "BishopSp");
    else if(toolSelected == "knight") pieceSelect(sp, "KnightSp");
    else if(toolSelected == "rook") pieceSelect(sp, "RookSp");
    else if(toolSelected == "queen") pieceSelect(sp, "QueenSp");
    else if(toolSelected == "king") pieceSelect(sp, "KingSp");
}
function erase(sp){
    let block = eval("sq" + sp);
    let remover = block.classList.item(2);
    block.classList.remove(remover);
    if(remover == "wKingSp"){
        kingsPlaced.w = false;
    }
    else if(remover == "bKingSp"){
        kingsPlaced.b = false;
    }
    
}
function pieceSelect(sp, piece){
    let block = eval("sq" + sp);
    let color = whiteColor? "w":"b";
    if(piece == "KingSp"){
        if(kingsPlaced[color])return;
        else{
            kingsPlaced[color] = true;
        }
    }
    if(piece == "PawnSp" && (sp <=8 || sp>=57))return
    erase(sp);
    block.classList.add(color + piece)
}

function dataStringify(){
    let data = ["!"];
    for(let i = 1; i <= 64; i++){
        let block = eval("sq" + i);
        let type = block.classList.item(2);
        if(type == null)continue;
        data.push(type + " " + i);
    }
    return data;
}
function dataSave(){
    let data = dataStringify();
    localStorage.setItem("tableCanvas", data);
    tableCanvas = data.toString();
}
function dataLoad(){
    tableDraw(tableCanvas);
}
function submitTable(){
    if(!(kingsPlaced.b && kingsPlaced.w)){
        alert("King not placed");
        return;
    }
    let whiteCastle = [document.getElementById("white-left-castle").checked, document.getElementById("white-right-castle").checked];
    let blackCastle = [document.getElementById("black-left-castle").checked, document.getElementById("black-right-castle").checked];
    let time = document.getElementById("time").value;
    let enPassant = document.getElementById("en-passant").checked;
    let ipm = document.getElementById("ipm").checked;
    let startingColor;
    let table = dataStringify();

    document.getElementsByName("starting-color").forEach((elem) => {
        if(elem.checked){
            startingColor = elem.value;
        }
    })

    localStorage.setItem("time", time)
    localStorage.setItem("enPassant", enPassant)
    localStorage.setItem("ipm", ipm)
    localStorage.setItem("doCastleWhite", whiteCastle);
    localStorage.setItem("doCastleBlack", blackCastle);
    localStorage.setItem("startingColor", startingColor)
    localStorage.setItem("table", table);
    localStorage.setItem("tableCanvas", table);

    exitPage("./play.html");
}

//#endregion
first();