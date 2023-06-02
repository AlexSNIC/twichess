const game = document.getElementById("game");
const canvas = document.getElementById("canvas");

const wTimerHTML = document.getElementById("timer1");
const bTimerHTML = document.getElementById("timer2");

const ls_table = localStorage.getItem("table")// 'default' or table layout [bN11], [wR34], [wQ25]... [(color)(piece)(row-col)]
const ls_time = localStorage.getItem("time");// 10, 15, 20, 30, 60... (in minutes)
const ls_doCastleWhite = JSON.stringify(localStorage.getItem("doCastleWhite")).split(",");// [0,0]
const ls_doCastleBlack = JSON.stringify(localStorage.getItem("doCastleBlack")).split(",");// [0,0]
const ls_enPassant = localStorage.getItem("enPassant");// true / false
const ls_ipm =  localStorage.getItem("ipm");// true / false
const ls_startingColor = localStorage.getItem("startingColor")

const ls_rotate = localStorage.getItem("settings-rotate");

let table = ((ls_table == "default" || ls_table == null)? "default": ls_table);

let gamerules = {
    "doCastlew": [true, true],
    "doCastleb": [true, true],
    "doCastle": true,
    "enPassant": ((ls_enPassant == "true" || ls_enPassant == null)? true : false),
    "secondPawnMovement": ((ls_ipm == "true" || ls_ipm == null)? true : false)
}
 gamerules.doCastlew[0] = (ls_doCastleWhite == "null" || ls_doCastleWhite[0] == "\"true")? true: false;
 gamerules.doCastlew[1] = (ls_doCastleWhite == "null" || ls_doCastleWhite[1] == "true\"")? true: false;
 gamerules.doCastleb[0] = (ls_doCastleBlack == "null" || ls_doCastleBlack[0] == "\"true")? true: false;
 gamerules.doCastleb[1] = (ls_doCastleBlack == "null" || ls_doCastleBlack[1] == "true\"")? true: false;

let time = (ls_time? +ls_time: 20);
let wTimer = time * 60 + 1;
let bTimer = time * 60;
let timerBegun = false;
let timeTick;

let whiteTurn = ((ls_startingColor == "white" || ls_startingColor == null)? true : false);
let presentLocks = false;
let kingCantMove = false;
let wCastle = gamerules.doCastlew;
let bCastle = gamerules.doCastleb;

let pointBalance = 0;
let check = 0;
let lastPawnMove = 0;
let wPiecesRemaining = 0;
let bPiecesRemaining = 0;
let repeat = {
    "wSq1": 0,
    "bSq1": 0,
    "wSq2": 0,
    "bSq2": 0,
    "count": 0
}
let settings = {
    "rotate": (ls_rotate == null? "flip" : ls_rotate),
    "fulscreen": false, // true / false
}

let bPawnPrewMove;
let wPawnPrewMove;
let promotePiece = ["", 0, ""];

function first(){
    boardDraw();
    tableDraw(table);
    classGenerator();
    tableCall();
    tableChange();
    piecesRemaining();
    removeLocalStorage();
    timerChange("initialize");
    checkForLocked(whiteTurn? "w": "b")
}
function piecesRemaining(){
    if(table == "default") return;
    function pointValue(pClass){
        switch(pClass){
            case "PawnSp": return 1;
            case "BishopSp": return 3;
            case "KnightSp": return 3;
            case "RookSp": return 5;
            case "QueenSp": return 9;
            case "KingSp" :return 0;
        }
    }
    for(let i = 1; i <= 64; i++){
        if(eval("sq" + i).classList.contains("bPieceSp")){
            bPiecesRemaining++;
            pointBalance -= pointValue(eval("sq" + i).classList.item(2).substr(1));
        }
        else if(eval("sq" + i).classList.contains("wPieceSp")){
            wPiecesRemaining++;
            pointBalance += pointValue(eval("sq" + i).classList.item(2).substr(1));

        }
    }
    document.getElementById("score1").innerHTML = (pointBalance > 0? "+" + Math.abs(pointBalance):(pointBalance == 0? 0 :"-" + Math.abs(pointBalance)));
    document.getElementById("score2").innerHTML = (pointBalance > 0? "-" + Math.abs(pointBalance):(pointBalance == 0? 0 :"+" + Math.abs(pointBalance)));
}

function tableDraw(_table){
    if(_table == "default"){
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
        _table = _table.split(",")
        let piece = _table.pop();
        while(piece != "!"){
            piece = piece.split(" ")
            let piecePoz = +piece.splice(-1);
            eval("sq" + piecePoz).classList.add(piece);
            piece = _table.pop();
        }
    }
        
        
        
}

function tableCall(){
    function rowCheck(par){
        return Math.round((par+3)/8);
    }
    function colCheck(par){
        return (((par+7)%8)-8)*-1;
    }
        for (let i = 64; i>=1; i--){
        eval(`const sq${i} = document.getElementById("sq${i}")`);
        eval(`sq${i}`).addEventListener("click", (function(i) {
        return function() { selected(rowCheck(i), colCheck(i), i)}})(i));
    }
}

function boardDraw(){
    function rowCheck(par){
        return Math.round((par+3)/8);
    }
    function colCheck(par){
        return (((par+7)%8)-8)*-1;
    }
    for(let i = 64; i>=1; i--){
            if( (Math.floor((i-1)/8) + 1 + i) % 2 == 0){
                game.innerHTML += `<div id="sq${i}", class="row${rowCheck(i)} col${colCheck(i)}",  style="background-color: #EEEEEE"></div>`;
            }
            else {
                game.innerHTML += `<div id="sq${i}", class="row${rowCheck(i)} col${colCheck(i)}", style="background-color: #808080"></div>`;
            }
      }
}

function classGenerator(){
        for(let i = 1; i<=64; i++){
            if(eval(`(sq${i}.classList.contains("wRookSp")
            || sq${i}.classList.contains("wKnightSp")
             || sq${i}.classList.contains("wBishopSp")
              || sq${i}.classList.contains("wQueenSp")
               || sq${i}.classList.contains("wKingSp")
                || sq${i}.classList.contains("wPawnSp"))`))
            {
                eval(`sq${i}.classList.add("wPieceSp")`);

            }else if(eval(`(sq${i}.classList.contains("bRookSp")
            || sq${i}.classList.contains("bKnightSp")
             || sq${i}.classList.contains("bBishopSp")
              || sq${i}.classList.contains("bQueenSp")
               || sq${i}.classList.contains("bKingSp")
                || sq${i}.classList.contains("bPawnSp"))`))
            {
                eval(`sq${i}.classList.add("bPieceSp")`);

            }
            if(eval(`sq${i}.classList.contains("wPieceSp") || sq${i}.classList.contains("bPieceSp")`)){
                eval(`sq${i}.classList.add("pieceSp")`);
            }
        }
}

function selected(row,col,order){
    let pos = eval(`sq${order}`);
    

    if(whiteTurn == false){
        if(pos.classList.contains('pieceSp')){
            if(pos.classList.contains('attacked')){
                if(eval(`sq`+(order)).classList.contains('select-promote')){
                    eval(`sq`+(order)).classList.add('promote');
                    showPromote("Black", order);
                    return;
                }
                move(order);
                checkForLocked("w");
            }
            else{
                deselect();

                if(pos.classList.contains("bRookSp"))rookSelect(order,row,col,"bPieceSp");
                if(pos.classList.contains("bBishopSp"))bishopSelect(order,row,col,"bPieceSp");
                if(pos.classList.contains("bQueenSp"))queenSelect(order,row,col,"bPieceSp");
                if(pos.classList.contains("bPawnSp"))pawnSelect(order,row,col,"bPieceSp");
                if(pos.classList.contains("bKnightSp"))knightSelect(order,row,col,"bPieceSp");
                if(pos.classList.contains("bKingSp"))kingSelect(order,row,col,"bPieceSp");
        }}
        else if(pos.classList.contains('selected')){
            if(eval(`sq`+(order)).classList.contains('select-en-passant'))
                eval(`sq`+(order)).classList.add('en-passant');
            if(eval(`sq`+(order)).classList.contains('select-promote')){
                eval(`sq`+(order)).classList.add('promote');
                showPromote("Black", order);
                return;
            }
            move(order);
            checkForLocked("w");
        }
        else deselect();
    }
    if(whiteTurn == true){
        if(pos.classList.contains('pieceSp')){
            if(pos.classList.contains('attacked')){
                if(eval(`sq`+(order)).classList.contains('select-promote')){
                    eval(`sq`+(order)).classList.add('promote');
                    showPromote("White", order);
                    return;
                }
                move(order);
                checkForLocked("b");
            }
            else{
                deselect();

                if(pos.classList.contains("wRookSp"))rookSelect(order,row,col,"wPieceSp");
                if(pos.classList.contains("wBishopSp"))bishopSelect(order,row,col,"wPieceSp");
                if(pos.classList.contains("wQueenSp"))queenSelect(order,row,col,"wPieceSp");
                if(pos.classList.contains("wPawnSp"))pawnSelect(order,row,col,"wPieceSp");
                if(pos.classList.contains("wKnightSp"))knightSelect(order,row,col,"wPieceSp");
                if(pos.classList.contains("wKingSp"))kingSelect(order,row,col,"wPieceSp");
        }}
        else if(pos.classList.contains('selected')){
            if(eval(`sq`+(order)).classList.contains('select-en-passant'))
                eval(`sq`+(order)).classList.add('en-passant');
            move(order);
            checkForLocked("b");
        }
        else deselect();
    }
}

function chosePromote(piece, order = promotePiece[1], color = promotePiece[2]){
    promotePiece[0] = piece;
    document.querySelector(".promote-screen").style.display = "none";
    document.querySelector("#show" + color).style.display = "none";
    move(order);
}

function showPromote(color, order){
    document.querySelector(".promote-screen").style.display = "block";
    document.querySelector("#show" + color).style.display = "flex";
    promotePiece = ["", order, color];
}

function move(order, castle = false){
    if(!timerBegun)timerChange("begin");

    bPawnPrewMove = -1;
    wPawnPrewMove = -1;

    let pieceSelected = document.querySelector('.pieceSelected'); 
    let pieceSelectedPoz;
        for(pieceSelectedPoz = 1; pieceSelectedPoz <= 64; pieceSelectedPoz++)if(eval("sq" + pieceSelectedPoz).classList.contains("pieceSelected"))break;
    let pieceClass = "";
    let pieceColor = "";
    function pieceRemove(){
        pieceSelected.classList.remove("pieceSp","pieceSelected");
        pieceClass = pieceSelected.classList.item(2);
        pieceSelected.classList.remove(pieceClass);
        pieceColor = pieceSelected.classList.item(2);
        pieceSelected.classList.remove(pieceColor);
    }
    pieceRemove();

    function pointValue(pClass){
        switch(pClass){
            case "PawnSp": return 1;
            case "BishopSp": return 3;
            case "KnightSp": return 3;
            case "RookSp": return 5;
            case "QueenSp": return 9;
            case "KingSp":{
                gameOver("unknown", pieceColor == "w"? "White" : "Black", "intended feature (:");
                return 0;
            }
        }
    } 

    //#region Pawn
    if(pieceClass == "wPawnSp" || pieceClass == "bPawnSp"){
        lastPawnMove = 0;
        if(pieceClass == "bPawnSp" && eval(`sq`+order).classList.contains("promote")){
            
            pieceClass = promotePiece[0];
            pointBalance -= (pointValue(promotePiece[0].substr(1)) - 1);
        }
        if(pieceClass == "wPawnSp" && eval(`sq`+order).classList.contains("promote")){
            
            pieceClass = promotePiece[0];
            pointBalance += (pointValue(promotePiece[0].substr(1)) - 1);
        }

        if(pieceSelected.classList.contains("row7") && pieceClass == "bPawnSp" && eval("sq"+order).classList.contains("row5")){
           bPawnPrewMove = order; 
        }
        if(pieceSelected.classList.contains("row2") && pieceClass == "wPawnSp" && eval("sq"+order).classList.contains("row4")){
            wPawnPrewMove = order; 
         }


        if(eval(`sq`+order).classList.contains("en-passant") && pieceClass == "bPawnSp"){ 
            eval(`sq`+(order+8)).classList.remove(eval(`sq`+(order+8)).classList.item(2),eval(`sq`+(order+8)).classList.item(3),eval(`sq`+(order+8)).classList.item(4),eval(`sq`+(order+8)).classList.item(5));
        }
        if(eval(`sq`+order).classList.contains("en-passant") && pieceClass == "wPawnSp"){ 
            eval(`sq`+(order-8)).classList.remove(eval(`sq`+(order-8)).classList.item(2),eval(`sq`+(order-8)).classList.item(3),eval(`sq`+(order-8)).classList.item(4),eval(`sq`+(order-8)).classList.item(5));
        }
    }
    //#endregion Pawn

    if(eval("sq" + order).classList.contains("attacked")){

        if(pieceColor[0] == "w"){
            bPiecesRemaining--;
            pointBalance += pointValue(eval("sq" + order).classList.item(2).substr(1));
        }
        else{
            wPiecesRemaining--;
            pointBalance -= pointValue(eval("sq" + order).classList.item(2).substr(1));

        }
    }
    document.getElementById("score1").innerHTML = (pointBalance > 0? "+" + Math.abs(pointBalance):(pointBalance == 0? 0 :"-" + Math.abs(pointBalance)));
    document.getElementById("score2").innerHTML = (pointBalance > 0? "-" + Math.abs(pointBalance):(pointBalance == 0? 0 :"+" + Math.abs(pointBalance)));

    //#region Castle
    let moveRook = 0;
    if(wCastle[0] && pieceClass == "wRookSp" && pieceSelected.classList.contains("row1") && pieceSelected.classList.contains("col1")){
        wCastle[0] = false;
    }
    if(wCastle[1] && pieceClass == "wRookSp" && pieceSelected.classList.contains("row1") && pieceSelected.classList.contains("col8")){
        wCastle[1] = false;
    }
    if(bCastle[0] && pieceClass == "bRookSp" && pieceSelected.classList.contains("row8") && pieceSelected.classList.contains("col1")){
        bCastle[0] = false;
    }
    if(bCastle[0] && pieceClass == "bRookSp" && pieceSelected.classList.contains("row8") && pieceSelected.classList.contains("col8")){
        bCastle[1] = false;
    }
    //#endregion Castle
    eval(`sq` + order).classList.remove(eval(`sq`+order).classList.item(2),eval(`sq`+order).classList.item(3),eval(`sq`+order).classList.item(4),eval(`sq`+order).classList.item(5));
    eval(`sq` + order).classList.add(pieceClass,pieceColor,"pieceSp");
    deselect();
    deselectAfter();
    if(castle)return;

    whiteTurn = !whiteTurn;
    lastPawnMove++; 
    tableChange();



    if(pieceClass == "wKingSp"){
        if(order == 6 && wCastle[0]){
            sq8.classList.add("pieceSelected");
            move(5, true);
        }
        else if(order == 2 && wCastle[1]){
            sq1.classList.add("pieceSelected");
            move(3, true);
        }
        wCastle = [false, false];
    }
    else if(pieceClass == "bKingSp"){
        if(order == 62 && bCastle[0]){
            sq64.classList.add("pieceSelected");
            move(61, true);
        }
        else if(order == 58 && bCastle[1]){
            sq57.classList.add("pieceSelected");
            move(59, true);
        }
        bCastle = [false, false];
    }

    let drawByPieces = false;
    if(wPiecesRemaining <= 3 && bPiecesRemaining <= 3){

        let wWinAvalable = true;
        let bWinAvalable = true;

        let wPieces = [];
        let bPieces = [];

        for(let i = 1; i <= 64; i++){
            let piece = eval("sq" + i).classList.item(2);
            if(eval("sq" + i).classList.item(4) == "pieceSp"){
                if(piece[0] == "w"){
                    if(piece == "wPawnSp"){
                        if(i >= 57);
                        else if(!eval("sq" + (i + 8)).classList.contains("bPawnSp")){
                            wPieces.push(piece);
                        }
                    }
                    else wPieces.push(piece);
                }
                else if(piece[0] == "b"){
                    if(piece == "bPawnSp"){
                        if(i <= 8);
                        else if(!eval("sq" + (i - 8)).classList.contains("wPawnSp")){
                            bPieces.push(piece);
                        }
                    }
                    else bPieces.push(piece);
                }
            }
        }
        if(wPieces.includes("wQueenSp") || wPieces.includes("wRookSp") || wPieces.includes("wPawnSp"));
        else if(wPieces.includes("wBishopSp") && wPiecesRemaining == 3);
        else wWinAvalable = false;

        if(bPieces.includes("bQueenSp") || bPieces.includes("bRookSp") || bPieces.includes("bPawnSp"));
        else if(bPieces.includes("bBishopSp") && bPiecesRemaining == 3);
        else bWinAvalable = false;

        if(!(wWinAvalable || bWinAvalable)){
            drawByPieces = true;
        };
    }
    
    //#region Repeat Moves
    let color = pieceColor[0];
    let notColor = color == "w"? "b" : "w";

    if(repeat[color + "Sq1"] == order && repeat[color + "Sq2"] == pieceSelectedPoz){
        repeat.count++;
    }
    else if(repeat[color + "Sq2"] == order && repeat[color + "Sq1"] == pieceSelectedPoz){
        repeat.count++;
    }
    else if(repeat[color + "Sq2"] == 0){
        repeat[color + "Sq2"] = order;
        repeat.count++;
    }
    else if(repeat[color + "Sq1"] == 0){
        repeat[color + "Sq1"] = order;
        repeat.count++;
    }
    else{
        repeat[color + "Sq1"] = order;
        repeat[color + "Sq2"] = 0;
        repeat[notColor + "Sq1"] = 0;
        repeat[notColor + "Sq2"] = 0;
        repeat.count = 0;
    }

    if(repeat.count == 6){
        gameOver('draw', "due to repetition");
    }
    if(lastPawnMove == 100){
        gameOver('draw', 'due to absense of pawn movement');
    }
    if(drawByPieces){
        gameOver('draw', 'not enough material');
    }



    //#endregion
}

function deselect(){
    for(let i=1; i<=64; i++){
        eval(`sq`+i).classList.remove('selected');
        eval(`sq`+i).classList.remove('pieceSelected');
        eval(`sq`+i).classList.remove('attacked');
        eval(`sq`+i).classList.remove('select-en-passant');
        eval(`sq`+i).classList.remove('select-promote');
        eval(`sq`+i).classList.remove("doCastle");
    }
}

function deselectAfter(){
    for(let i = 1; i <= 64; i++){
      for(let j = 1; j <= 8; j++){
        eval("sq" + i).classList.remove("line" + j);
      }  
      eval("sq" + i).classList.remove("locked");
      eval("sq" + i).classList.remove("line");
      eval(`sq`+i).classList.remove("attacker");
      eval("sq" + i).classList.remove("checked");
      check = 0;
      presentLocks = false;
    }
}


//#region Selects:
function pawnSelect(order,row,col,color, ipm = true){
    let pos = eval(`sq`+order);
    pos.classList.add(`pieceSelected`);

    if(!gamerules.secondPawnMovement)ipm = false;

    if(check == 2)return;

    let isLocked = false;
    if(eval('sq' + order).classList.contains("locked")){
        let temp;
        for(temp = 1; temp <= 8; temp++)
        {
            if(!eval("sq" + order).classList.contains("line" + temp))continue;
            else {
                isLocked = temp;
                break;
            }
        }
    }
    



    if(color == "bPieceSp"){
        if(!eval(`sq`+(order - 8)).classList.contains("pieceSp")){
            
            if(eval(`sq` + (order + 8)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order + 8)).classList.contains("bKingSp"))){
                eval(`sq` + (order - 8)).classList.add("selected");
            }else if(!isLocked && check == 1){
                if(eval(`sq` + (order - 8)).classList.contains("line"))
                eval(`sq` + (order - 8)).classList.add("selected");
            }else if(!isLocked)eval(`sq`+(order-8)).classList.add(`selected`);
            if(row == 2){
                eval("sq"+(order-8)).classList.add("select-promote");
            }
        
            if(row == 7 && ipm){
                if(!eval(`sq`+(order-16)).classList.contains("pieceSp")){
                    
                    if(eval(`sq` + (order + 8)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order + 8)).classList.contains("bKingSp"))){
                        eval(`sq` + (order - 16)).classList.add("selected");
                    }else if(!isLocked && check == 1){
                        if(eval(`sq` + (order - 16)).classList.contains("line"))
                        eval(`sq` + (order - 16)).classList.add("selected");
                    }else if(!isLocked)eval(`sq`+(order - 16)).classList.add(`selected`);
                }    
            }
        }
        if(row == 4 && gamerules.enPassant){
            if(wPawnPrewMove == order + 1 && !pos.classList.contains("col1")){
                if(eval(`sq` + (order + 7)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order + 7)).classList.contains("bKingSp"))){
                    eval("sq" + (order - 7)).classList.add("selected");
                    eval("sq" + (order - 7)).classList.add("select-en-passant");
                }
                else if(!isLocked && check == 1){
                    if(eval(`sq` + (order - 7)).classList.contains("line")){
                        eval("sq" + (order - 7)).classList.add("selected");
                        eval("sq" + (order - 7)).classList.add("select-en-passant");
                    }
                }
                else if(!isLocked){
                    eval("sq" + (order - 7)).classList.add("selected");
                    eval("sq" + (order - 7)).classList.add("select-en-passant");
                }
            }
            else if(wPawnPrewMove == order - 1 && !pos.classList.contains("col8")){
                if(eval(`sq` + (order + 9)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order + 9)).classList.contains("bKingSp"))){
                    eval("sq" + (order - 9)).classList.add("selected");
                    eval("sq" + (order - 9)).classList.add("select-en-passant");
                }
                else if(!isLocked && check == 1){
                    if(eval(`sq` + (order - 9)).classList.contains("line"))
                    eval(`sq` + (order - 9)).classList.add("selected");
                    eval("sq" + (order - 9)).classList.add("select-en-passant");
                }
                else if(!isLocked){
                    eval("sq" + (order - 9)).classList.add("selected");
                    eval("sq" + (order - 9)).classList.add("select-en-passant");
                }
            }
        }

        if(eval(`sq`+(order-9)).classList.contains("wPieceSp") && col != 8){
            if((order + 9) != 65 && (eval(`sq` + (order + 9)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order + 9)).classList.contains("bKingSp")))){
                eval(`sq` + (order - 9)).classList.add("attacked");
            }
            else if(!isLocked && check == 1){ 
                if(eval(`sq` + (order - 9)).classList.contains("line") || eval(`sq` + (order - 9)).classList.contains("attacker"))
                eval(`sq` + (order - 9)).classList.add("attacked");
            }
           
            else if(!isLocked) eval(`sq`+(order - 9)).classList.add(`attacked`);
            
            if(row == 2){
                eval("sq"+(order-9)).classList.add("select-promote");
            }
        }
        if(eval(`sq`+(order-7)).classList.contains("wPieceSp") && col != 1){
            
            if(eval(`sq` + (order + 7)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order + 7)).classList.contains("bKingSp"))){
                eval(`sq` + (order - 7)).classList.add("attacked");
            }
            else if(!isLocked && check == 1){
                if(eval(`sq` + (order - 7)).classList.contains("line") || eval(`sq` + (order - 7)).classList.contains("attacker"))
                eval(`sq` + (order - 7)).classList.add("attacked");
            }
            else if(!isLocked) eval(`sq`+(order - 7)).classList.add(`attacked`);

            if(row == 2){
                eval("sq"+(order-7)).classList.add("select-promote");
            }
        }
    }
    else{
        if(!eval(`sq`+(order + 8)).classList.contains("pieceSp")){
            
            if(eval(`sq` + (order - 8)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order -8 )).classList.contains("wKingSp"))){
                eval(`sq` + (order + 8)).classList.add("selected");
            }
            else if(!isLocked && check == 1){
                if(eval(`sq` + (order + 8)).classList.contains("line"))
                eval(`sq` + (order + 8)).classList.add("selected");
            }
            else if(!isLocked)eval(`sq`+(order + 8)).classList.add(`selected`);

            if(row == 7){
                eval("sq"+(order+8)).classList.add("select-promote");
            }
        
            if(row == 2 && ipm){
                if(!eval(`sq`+(order+16)).classList.contains("pieceSp")){
                    
                    if(eval(`sq` + (order - 8)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order - 8)).classList.contains("wKingSp"))){
                        eval(`sq` + (order + 16)).classList.add("selected");
                    }
                    else if(!isLocked && check == 1){
                        if(eval(`sq` + (order + 16)).classList.contains("line"))
                        eval(`sq` + (order + 16)).classList.add("selected");
                    }
                    else if(!isLocked) eval(`sq`+(order + 16)).classList.add(`selected`);
                }
            }
        }
        if(row == 5 && gamerules.enPassant){
            if(bPawnPrewMove == order + 1 && !pos.classList.contains("col1")){
                if (eval(`sq` + (order - 9)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order - 9)).classList.contains("wKingSp"))){
                    eval("sq" + (order + 9)).classList.add("selected");
                    eval("sq" + (order + 9)).classList.add("select-en-passant");
                }
                else if(!isLocked && check == 1){
                    if(eval(`sq` + (order + 9)).classList.contains("line"))
                    eval("sq" + (order + 9)).classList.add("selected");
                    eval("sq" + (order + 9)).classList.add("select-en-passant");
                }
                else if(!isLocked){
                    eval("sq" + (order + 9)).classList.add("selected");
                    eval("sq" + (order + 9)).classList.add("select-en-passant");
                }
            }
            else if(bPawnPrewMove == order - 1 && !pos.classList.contains("col8")){
                if (eval(`sq` + (order - 7)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order - 7)).classList.contains("wKingSp"))){
                    eval("sq" + (order + 7)).classList.add("selected");
                    eval("sq" + (order + 7)).classList.add("select-en-passant");
                }
                else if(!isLocked && check == 1){
                    if(eval(`sq` + (order + 7)).classList.contains("line"))
                    eval("sq" + (order + 7)).classList.add("selected");
                    eval("sq" + (order + 7)).classList.add("select-en-passant");
                }
                else if(!isLocked){
                    eval("sq" + (order + 7)).classList.add("selected");
                    eval("sq" + (order + 7)).classList.add("select-en-passant");
                }
            }
        }
        if(eval(`sq`+(order+9)).classList.contains("bPieceSp") && col != 1){

            if((order - 9) != 0 && (eval(`sq` + (order - 9)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order - 9)).classList.contains("wKingSp")))){
                eval(`sq` + (order + 9)).classList.add("attacked");}
            
            else if(!isLocked && check == 1){
                if(eval(`sq` + (order + 9)).classList.contains("line") || eval(`sq` + (order + 9)).classList.contains("attacker"))
                eval(`sq` + (order + 9)).classList.add("attacked");
            }
                
            else if(!isLocked) eval(`sq`+(order + 9)).classList.add(`attacked`);

            if(row == 7){
                eval("sq"+(order+9)).classList.add("select-promote");
            }
        }
        if(eval(`sq`+(order + 7)).classList.contains("bPieceSp") && col != 8){

            
            if(eval(`sq` + (order - 7)).classList.contains("line" + isLocked) || (isLocked && eval(`sq` + (order - 7)).classList.contains("wKingSp"))){
                eval(`sq` + (order + 7)).classList.add("attacked");
            }
            else if(!isLocked && check == 1){
                console.log("aaa")
                if(eval(`sq` + (order + 7)).classList.contains("line") || eval(`sq` + (order + 7)).classList.contains("attacker"))
                eval(`sq` + (order + 7)).classList.add("attacked");
            }
            else if(!isLocked) eval(`sq`+(order + 7)).classList.add(`attacked`);

            if(row == 7){
                eval("sq"+(order + 7)).classList.add("select-promote");
            }
        }
    }
}

function knightSelect(order,row, col, color){
    let isLocked = false;
    if(eval('sq' + order).classList.contains("locked")){
        isLocked = true;
    }

    eval(`sq`+order).classList.add("pieceSelected");
    function spaceSelect(sp){
        if(sp<1 || sp > 64)return;
        else if(isLocked)return;
        else if(eval(`sq` + sp).classList.contains(color))return;
        else if(!eval(`sq` + sp).classList.contains("pieceSp")){
            if(check == 1){
                if(eval('sq' + sp).classList.contains("line"))
                eval(`sq` + sp).classList.add("selected");
            }
            else{
                eval(`sq` + sp).classList.add("selected");
            }
        }else{
                if(check != 1)eval(`sq`+ sp).classList.add("attacked");
                else if(eval("sq" + sp).classList.contains("attacker")) eval(`sq`+ sp).classList.add("attacked");
        }
    }
    if(check < 2){
        switch(col){
            case 1:
                    spaceSelect(order+15);
                    spaceSelect(order+6);
                    spaceSelect(order-17);
                    spaceSelect(order-10);
            break;
            case 2:
                    spaceSelect(order+15);
                    spaceSelect(order+17);
                    spaceSelect(order+6);
                    spaceSelect(order-15);
                    spaceSelect(order-17);
                    spaceSelect(order-10);
            break;
            case 7:
                    spaceSelect(order+15);
                    spaceSelect(order+17);
                    spaceSelect(order+10);
                    spaceSelect(order-15);
                    spaceSelect(order-17);
                    spaceSelect(order-6);
            break;
            case 8:
                    spaceSelect(order+17);
                    spaceSelect(order+10);
                    spaceSelect(order-15);
                    spaceSelect(order-6);
            break;
            default:
                    spaceSelect(order+15);
                    spaceSelect(order+17);
                    spaceSelect(order+10);
                    spaceSelect(order+6);
                    spaceSelect(order-15);
                    spaceSelect(order-17);
                    spaceSelect(order-10);
                    spaceSelect(order-6);

        }
    }
}

function bishopSelect(order,row,col,color){
    eval(`sq`+order).classList.add("pieceSelected");
    
    let isLocked = false;
    if(eval('sq' + order).classList.contains("locked")){
        let temp;
        for(temp = 1; temp <= 8; temp++)
        {
            if(!eval("sq" + order).classList.contains("line" + temp))continue;
            else {
                isLocked = temp;
                break;
            }
        }
    }

    function selectCrt(crt, cond){
        for(let i = 1; i<=cond; i++){  
            let sp = order+(crt*i);
            if(sp<1 || sp > 64)break;
            else if(eval(`sq` + sp).classList.contains(color))break;
            else if(!eval(`sq` + sp).classList.contains("pieceSp")){
                if(isLocked && eval(`sq` + sp).classList.contains("line" + isLocked)){
                    eval(`sq` + sp).classList.add("selected");
                }
                else if(!isLocked && check == 1){
                    if(eval(`sq` + sp).classList.contains("line"))
                    eval(`sq` + sp).classList.add("selected");
                }
                else if(!isLocked)eval(`sq` + sp).classList.add("selected");
            }
            else{
                if(check != 1)eval(`sq`+ sp).classList.add("attacked");
                else if(eval("sq" + sp).classList.contains("attacker")) eval(`sq`+ sp).classList.add("attacked");
                break;
            }
        }
    }
    if(check < 2){
        selectCrt(+7, 8-col);
        selectCrt(+9, col-1);
        selectCrt(-7, col-1);
        selectCrt(-9, 8-col);
    }
}

function rookSelect(order,row,col,color){
    eval(`sq`+order).classList.add(`pieceSelected`);
    
    let isLocked = false;
    if(eval('sq' + order).classList.contains("locked")){
        let temp;
        for(temp = 1; temp <= 8; temp++)
        {
            if(!eval("sq" + order).classList.contains("line" + temp))continue;
            else {
                isLocked = temp;
                break;
            }
        }
    }

    function selectCrt(crt, cond){
        for(let i = 1; i<=cond; i++){  
            sp = order+(crt*i);
            if(sp<1 || sp > 64)break;
            else if(eval(`sq` + sp).classList.contains(color))break;
            else if(!eval(`sq` + sp).classList.contains("pieceSp")){
                if(isLocked && eval(`sq` + sp).classList.contains("line" + isLocked)){
                    eval(`sq` + sp).classList.add("selected");
                }
                else if(!isLocked && check == 1){
                    if(eval(`sq` + sp).classList.contains("line"))
                    eval(`sq` + sp).classList.add("selected");
                }
                else if(!isLocked)eval(`sq` + sp).classList.add("selected");
            }
            else{
                if(check != 1)eval(`sq`+ sp).classList.add("attacked");
                else if(eval("sq" + sp).classList.contains("attacker")) eval(`sq`+ sp).classList.add("attacked");
                break;
            }
        }
    }  
    if(check < 2){
        selectCrt(-1, 8-col);
        selectCrt(+1, col-1);
        selectCrt(-8, row-1);
        selectCrt(+8, 8-row);
    }
}

function queenSelect(order,row,col,color){
    eval(`sq`+order).classList.add(`pieceSelected`);

    let isLocked = false;
    if(eval('sq' + order).classList.contains("locked")){
        let temp;
        for(temp = 1; temp <= 8; temp++)
        {
            if(!eval("sq" + order).classList.contains("line" + temp))continue;
            else {
                isLocked = temp;
                break;
            }
        }
    }

    function selectCrt(crt, cond){
        
        
        for(let i = 1; i <= cond; i++){  
            let sp = order+(crt*i);
            
            if(sp<1 || sp > 64)break;
            else if(eval(`sq` + sp).classList.contains(color))break;
            else if(!eval(`sq` + sp).classList.contains("pieceSp")){
                if(isLocked && eval(`sq` + sp).classList.contains("line" + isLocked)){
                    eval(`sq` + sp).classList.add("selected");
                }
                else if(!isLocked && check == 1){
                    if(eval(`sq` + sp).classList.contains("line"))
                    eval(`sq` + sp).classList.add("selected");
                }
                else if(!isLocked)eval(`sq` + sp).classList.add("selected");
            }
            else{
                if(check != 1)eval(`sq`+ sp).classList.add("attacked");
                else if(eval("sq" + sp).classList.contains("attacker")) eval(`sq`+ sp).classList.add("attacked");
                break;
            }
        }
    }
    if(check < 2){    
        selectCrt(+7, 8-col);
        selectCrt(+9, col-1);
        selectCrt(-7, col-1);
        selectCrt(-9, 8-col);

        selectCrt(-1, 8-col);
        selectCrt(+1, col-1);
        selectCrt(-8, row-1);
        selectCrt(+8, 8-row);
    }
}

function kingSelect(kingOrder,kingRow,kingCol,color, doCastle = true){
    eval("sq"+kingOrder).classList.add("pieceSelected");
    let notColor = color == "wPieceSp"?"b":"w";
    //#region King Movement Restrictions
        for(let m = 1; m<=64; m++){
        if(!eval(`sq` + m).classList.contains("pieceSp"))continue;
        let order = m;
        let row = +eval("sq" + m).classList.item(0)[3];
        let col = +eval("sq" + m).classList.item(1)[3];
        let sp;

        function selectCrt(crt, cond){
            for(let i = 1; i <= cond; i++){  
                sp = order+(crt*i);
                if(sp < 1 || sp > 64)break;
                else if(eval(`sq` + sp).classList.contains("pieceSp") && !eval(`sq` + sp).classList.contains(color[0] + "KingSp") ){eval(`sq` + sp).classList.add("unsafe");break;}
                else eval(`sq` + sp).classList.add("unsafe");
            }
        }

        switch(eval(`sq` + m).classList.item(2)){
            //pawn
            case notColor + "PawnSp":
                // eval(`sq`+(order + (notColor == 'w'?+7:-7))).classList.add("unsafe");
                // eval(`sq`+(order + (notColor == 'w'?+9:-9))).classList.add("unsafe");
                if(notColor != "w"){
                    if(col != 8)selectCrt(-9, 1);
                    selectCrt(-7, 1);
                }
                if(notColor != "b"){
                    if(col != 1)selectCrt(+9, 1);
                    selectCrt(+7, 1);
                }
            break;
            //rook
            case notColor + "RookSp":
                selectCrt(-1, 8-col);
                selectCrt(+1, col-1);
                selectCrt(-8, row-1);
                selectCrt(+8, 8-row);
            break;
           //bishop
            case notColor + "BishopSp":
                selectCrt(+7, 8-col);
                selectCrt(+9, col-1);
                selectCrt(-7, col-1);
                selectCrt(-9, 8-col);
            break;
            //knight
            
            case notColor + "KnightSp":
                switch(col){
                    case 1:
                            selectCrt(+15, 1);
                            selectCrt(+6, 1);
                            selectCrt(-17, 1);
                            selectCrt(-10, 1);
                    break;
                    case 2:
                            selectCrt(+15, 1);
                            selectCrt(+17, 1);
                            selectCrt(+6, 1);
                            selectCrt(-15, 1);
                            selectCrt(-17, 1);
                            selectCrt(-10, 1);
                    break;
                    case 7:
                            selectCrt(+15, 1);
                            selectCrt(+17, 1);
                            selectCrt(+10, 1);
                            selectCrt(-15, 1);
                            selectCrt(-17, 1);
                            selectCrt(-6, 1);
                    break;
                    case 8:
                            selectCrt(+17, 1);
                            selectCrt(+10, 1);
                            selectCrt(-15, 1);
                            selectCrt(-6, 1);
                    break;
                    default:
                            selectCrt(+15, 1);
                            selectCrt(+17, 1);
                            selectCrt(+10, 1);
                            selectCrt(+6, 1);
                            selectCrt(-15, 1);
                            selectCrt(-17, 1);
                            selectCrt(-10, 1);
                            selectCrt(-6, 1);
            
                }
            break;
             //queen
            case notColor + "QueenSp":
                selectCrt(-1, 8-col);
                selectCrt(+1, col-1);
                selectCrt(-8, row-1);
                selectCrt(+8, 8-row);
                
                selectCrt(+7, 8-col);
                selectCrt(+9, col-1);
                selectCrt(-7, col-1);
                selectCrt(-9, 8-col);
            break;
            //king
            case notColor + "KingSp":
                function spaceSelect2(sp){
                    if(sp<1 || sp > 64)return;
                    else eval(`sq` + sp).classList.add("unsafe");
                }
                switch(col){
                    case 1:
                        spaceSelect2(order - 9);
                        spaceSelect2(order - 8);
                        spaceSelect2(order - 1);
                        spaceSelect2(order + 7);
                        spaceSelect2(order + 8);
                        
                    break;
                    case 8:
                        spaceSelect2(order - 8);
                        spaceSelect2(order - 7);
                        spaceSelect2(order + 1);
                        spaceSelect2(order + 8);
                        spaceSelect2(order + 9);
                    break;
                    default:
                        spaceSelect2(order - 9);
                        spaceSelect2(order - 8);
                        spaceSelect2(order - 7);
                        spaceSelect2(order - 1);
                        spaceSelect2(order + 1);
                        spaceSelect2(order + 7);
                        spaceSelect2(order + 8);
                        spaceSelect2(order + 9);
                    break;
                }
            break;
        }
    }
    //#endregion King Movement Restrictions
    function spaceSelect(sp){
        if(sp<1 || sp > 64)return;
        else if(eval(`sq` + sp).classList.contains(color[0] + "PieceSp"))return;
        else if(eval(`sq` + sp).classList.contains("unsafe"))return;
        else if(!eval(`sq` + sp).classList.contains("pieceSp")){
            eval(`sq` + sp).classList.add("selected");
        }else{
                eval(`sq`+ sp).classList.add("attacked");
        }
    }
    switch(kingCol){
        case 1:
            spaceSelect(kingOrder - 9);
            spaceSelect(kingOrder - 8);
            spaceSelect(kingOrder - 1);
            spaceSelect(kingOrder + 7);
            spaceSelect(kingOrder + 8);
        break;
        case 8:
            spaceSelect(kingOrder - 8);
            spaceSelect(kingOrder - 7);
            spaceSelect(kingOrder + 1);
            spaceSelect(kingOrder + 8);
            spaceSelect(kingOrder + 9);
        break;
        default:
            spaceSelect(kingOrder - 9);
            spaceSelect(kingOrder - 8);
            spaceSelect(kingOrder - 7);
            spaceSelect(kingOrder - 1);
            spaceSelect(kingOrder + 1);
            spaceSelect(kingOrder + 7);
            spaceSelect(kingOrder + 8);
            spaceSelect(kingOrder + 9);
        break;
    }

    function castle(){
        if(!(kingOrder == 60 || kingOrder == 4) && (!(color[0] == "w" && kingOrder == 4 || color[0] == "b" && kingOrder == 60)))return;
        if(doCastle && gamerules.doCastle){
            
            if(eval(color[0] + "Castle")[1] && check == 0){
                let letCastle = true;
                for(let i = 1; i <= 2; i++){
                    if(eval('sq' + (kingOrder - i)).classList.contains("unsafe") ||
                    eval('sq' + (kingOrder - i)).classList.contains("pieceSp") ||
                    !eval('sq' + (kingOrder - 3)).classList.contains(color[0] + "RookSp")){
                        letCastle = false;
                    }
                }
                if(letCastle){
                    eval("sq" + (kingOrder - 2)).classList.add("selected");
                    eval("sq" + (kingOrder - 2)).classList.add("doCastle");
                }
            }
            if(eval(color[0] + "Castle")[0] && check == 0){
                let letCastle = true;
                for(let i = 1; i <= 3; i++){
                    if(eval('sq' + (kingOrder + i)).classList.contains("unsafe") ||
                    eval('sq' + (kingOrder + i)).classList.contains("pieceSp") ||
                    !eval('sq' + (kingOrder + 4)).classList.contains(color[0] + "RookSp")){
                        letCastle = false;
                    }
                }
                if(letCastle){
                    eval("sq" + (kingOrder + 2)).classList.add("selected");
                    eval("sq" + (kingOrder + 2)).classList.add("doCastle");
                }
            }
            if(!(wCastle[0] || wCastle[1] || bCastle[0] || bCastle[1]))gamerules.doCastle = false;
        }
    }
    castle();


    
    for(let i = 1; i<=64; i++)eval(`sq`+i).classList.remove("unsafe");

    
}
//#endregion

function checkForLocked(color){

    let kingOrder = 0;
    for(let i = 1; i <= 64; i++){
        if(eval('sq' + i).classList.contains(color + "KingSp"))kingOrder = i;
    }
    if(kingOrder == 0){
        return;
    }
    
    let notColor = color == "b"? "w":"b";
    let row = +eval("sq" + kingOrder).classList.item(0)[3]
    let col = +eval("sq" + kingOrder).classList.item(1)[3]

    function selectOne(crt){
        let sp = kingOrder + crt;
        if(sp<1 || sp > 64){
            return;
        }
        else if(eval("sq" + sp).classList.contains(locks)){
            eval("sq" + sp).classList.add("attacker");
            eval("sq" + kingOrder).classList.add("checked");
            check++;
            return;
        }
    }

    function selectCrt(crt, cond){
        let count = 0;
        let piece = 0;
        let piecePoz = 0;

        for(let i = 1; i<=cond; i++){  

            let sp = kingOrder + (crt*i);
            if(sp<1 || sp > 64){
                count = 2;
                break;
            }
            else if(eval(`sq` + sp).classList.contains(color + "PieceSp"))count++;
            else if(!eval(`sq` + sp).classList.contains("pieceSp"));
            else if(eval(`sq`+ sp).classList.contains(notColor + "PieceSp")){
                    piecePoz = sp;
                    piece = eval(`sq` + sp).classList.item(2);
                    break;
            }
            else alert("Eroare la functia CheckForLocked()")
        }
        return [piece, count, piecePoz];
    }

    let lineCount = 1;
    let locks;

    function med(crt, cond){
        let [piece, count, piecePoz] = selectCrt(crt, cond);

        if(piece == 0 || count >= 2);
        else if(count < 2 && locks.includes(piece)){
            let lockedPiece;

            for(let i = 1; i <= cond; i++){
                let sp = kingOrder + (crt*i);
                if(!eval(`sq` + sp).classList.contains(notColor + 'PieceSp')){
                    eval(`sq` + sp).classList.add(count == 1?('line' + lineCount):'line');
                    if(eval(`sq` + sp).classList.contains(color + 'PieceSp'))lockedPiece = sp;
                }
                else break;
            }
            if(count == 0){
                check++;
                eval("sq" + piecePoz).classList.add("attacker");
                eval("sq" + kingOrder).classList.add("checked");
            }
            if(count == 1){
                eval("sq" + lockedPiece).classList.add("locked");
                lineCount++;
                presentLocks = true;
            } 
        }
    }

    locks = [notColor + "QueenSp", notColor + "RookSp"];
    med(-1, 8-col);
    med(+1, col-1);
    med(-8, row-1);
    med(+8, 8-row);

    locks = [notColor + "QueenSp", notColor + "BishopSp"];
    med(+7, 8-col);
    med(+9, col-1);
    med(-7, col-1);
    med(-9, 8-col);
    locks = notColor + "KnightSp";
    switch(col){
        case 1:
                selectOne(+15);
                selectOne(+6);
                selectOne(-17);
                selectOne(-10);
        break;
        case 2:
                selectOne(+15);
                selectOne(+17);
                selectOne(+6);
                selectOne(-15);
                selectOne(-17);
                selectOne(-10);
        break;
        case 7:
                selectOne(+15);
                selectOne(+17);
                selectOne(+10);
                selectOne(-15);
                selectOne(-17);
                selectOne(-6);
        break;
        case 8:
                selectOne(+17);
                selectOne(+10);
                selectOne(-15);
                selectOne(-6);
        break;
        default:
                selectOne(+15);
                selectOne(+17);
                selectOne(+10);
                selectOne(+6);
                selectOne(-15);
                selectOne(-17);
                selectOne(-10);
                selectOne(-6);
    }
    locks = notColor + "PawnSp";

    if(color == 'b'){
        if(col != 8){
            selectOne(-9);
        }
        if(col != 1){
            selectOne(-7);
        }
    }
    if(color == 'w'){
        if(col != 8){
            selectOne(7);
        }
        if(col != 1){
            selectOne(9);
        }
    }

    function winCondition(){
        kingCantMove = true;

        kingSelect(kingOrder, row, col, color + "PieceSp", false);
        for(let i = 1; i <= 64; i++){
            if(eval("sq" + i).classList.contains("selected") || eval("sq" + i).classList.contains("attacked")){
                kingCantMove = false;
                break;
            }
        }
        deselect();

        return winCrt(color + "PieceSp");
    }

    if(winCondition()){
        gameOver('win', (color == "b"? "White" : "Black"), "due to checkmate")           
    }
    if(drawCrt(color + "PieceSp")){
        gameOver('draw', (color == "b"? "White" : "Black"),"no moves avalable")  
    }
    
}

function drawCrt(color){
    if(!kingCantMove) return false;
    if(check != 0) return false;
    let canMove = false;
    for(let i = 1; i <= 64; i++){
        if(eval("sq" + i).classList.contains(color)){
            let row = +eval("sq" + i).classList.item(0)[3];
            let col = +eval("sq" + i).classList.item(1)[3];

            switch (eval("sq" + i).classList.item(2)){
                case color[0] + "PawnSp":
                    pawnSelect(i, row, col, color); break;
                case color[0] + "QueenSp":
                    queenSelect(i, row, col, color); break;
                case color[0] + "RookSp":
                    rookSelect(i, row, col, color); break;
                case color[0] + "BishopSp":
                    bishopSelect(i, row, col, color); break;
                case color[0] + "KnightSp":
                    knightSelect(i, row, col, color); break;
            }
        }
    }
    for(let i = 1; i <= 64; i++){
        if(eval("sq" + i).classList.contains("selected")){
            canMove = true;
        }
    }
    deselect();
    if(canMove) return false;
    else return true;
    
}
function winCrt(color){
    if(check == 0)return false;
    if(!kingCantMove) return false;
    if(check == 2 && kingCantMove)return true;
    let canProtect = false;
    if(check == 1 && kingCantMove){
        for(let i = 1; i <= 64; i++){
            if(eval("sq" + i).classList.contains(color)){
                let row = +eval("sq" + i).classList.item(0)[3];
                let col = +eval("sq" + i).classList.item(1)[3];

                switch (eval("sq" + i).classList.item(2)){
                    case color[0] + "PawnSp":
                        pawnSelect(i, row, col, color); break;
                    case color[0] + "QueenSp":
                        queenSelect(i, row, col, color); break;
                    case color[0] + "RookSp":
                        rookSelect(i, row, col, color); break;
                    case color[0] + "BishopSp":
                        bishopSelect(i, row, col, color); break;
                    case color[0] + "KnightSp":
                        knightSelect(i, row, col, color); break;
                }
            }
        }
        for(let i = 1; i <= 64; i++){
            if(eval("sq" + i).classList.contains("selected")){
                console.log("selected", i);
                canProtect = true;
            }
            if(eval("sq" + i).classList.contains("attacker") && eval("sq" + i).classList.contains("attacked")){
                console.log("attacked", i);
                canProtect = true;
            }
        }
        deselect();
        if(canProtect) return false;
    }
    return true;
}


function gameOver(crt, color, message){
    let winTitle = document.getElementById("win-title");
    let winSubtitle = document.getElementById("win-subtitle");
    let winImage = document.querySelector(".win-image");
    let medal = document.querySelector(".medal");

    let winDisplay = document.querySelector(".win-display");
    let winBlackout = document.querySelector(".win-blackout")

    winDisplay.style.transform = "translate(-50%, -50%)";
    winBlackout.style.display = "block";
    stopTimer();

    if(crt == "draw"){
        winTitle.innerHTML = "It's a draw!";
        winSubtitle.innerHTML = message;
        winImage.src = winImage.src.replace("Black", "WhiteBlack");
        medal.style.display = "none";
    }
    else if(crt == 'win'){
        winTitle.innerHTML = color + " Wins!";
        winSubtitle.innerHTML = message;
        winImage.src = winImage.src.replace("Black", color);
    }
    else{
        winTitle.innerHTML = "unknown";
        winSubtitle.innerHTML = message;
        winImage.src = winImage.src.replace("Black", "WhiteBlack");
    }
}

function removeLocalStorage(){
    localStorage.removeItem("mode");
    localStorage.removeItem("table");
    localStorage.removeItem("time");
    localStorage.removeItem("doCastleBlack");
    localStorage.removeItem("doCastleWhite");
    localStorage.removeItem("enPassant");
    localStorage.removeItem("ipm");
}

//#region Timer

function startTimer() {
    timerChange();
}

function stopTimer() {
    clearTimeout(timeTick);
}

function timerChange(mode = "update") {
    if (mode == "update"){
        if (whiteTurn) {
            wTimer-=0.1;
            wTimerHTML.innerHTML = `
            ${Math.floor(wTimer / 60)}:${Math.floor((wTimer % 60)).toString().padStart(2, "0")}`;
            if (wTimer == 0) {
                gameOver("win", "Black", "due to timeout");
                stopTimer();
                return;
            }
        } 
        else if(!whiteTurn) {
            bTimer-= 0.1;
            bTimerHTML.innerHTML = `
            ${Math.floor(bTimer / 60)}:${Math.floor((bTimer % 60)).toString().padStart(2, "0")}`;
            if (bTimer == 0) {
                gameOver("win", "White", "due to timeout"); 
                stopTimer(); 
                return;
            }
        }
    clearTimeout(timeTick);
    timeTick = setTimeout(timerChange, 100);
    } 
    else if (mode == "initialize") {
            wTimerHTML.innerHTML = `${time}:00`;
            bTimerHTML.innerHTML = `${time}:00`;
    } 
    else if (mode == "begin") {
        timerChange();
    }
}
//#endregion

function tableChange(update = false){
    document.getElementById("score-image-" + (whiteTurn? "black":"white")).classList.remove("color-selected")
    document.getElementById("score-image-" + (whiteTurn? "white":"black")).classList.add("color-selected")
    if(settings.rotate == "none"){
        if(update){
            for(let i = 1; i <= 64; i++){
                if(eval("sq" + i).classList.contains("bPieceSp")){
                    eval("sq" + i).style.transform = `scaleY(1)`;
                }
                else{
                    eval("sq" + i).style.transform = `scaleY(1)`;
                }
            }
            game.style.transform = `scaleY(1)`;
        }
        return;
    };
    if(settings.rotate == "forward"){
         for(let i = 1; i <= 64; i++){
            if(eval("sq" + i).classList.contains("bPieceSp")){
                eval("sq" + i).style.transform = `scaleY(-1)`;
            }
            else{
                eval("sq" + i).style.transform = `scaleY(1)`;
            }
        }
        
        return;
    }

    let scaleModifyer = whiteTurn == true? 1 : -1;
    if(settings.rotate == "flip"){
        game.style.transition = "0.4s";
        setTimeout(()=>{
            game.style.transition = "0s";
        }, 400)
        game.style.transform = `scaleY(${scaleModifyer})`;
        setTimeout(() =>{
            for(let i = 1; i <= 64; i++){
                eval("sq" + i).style.transform = `scaleY(${scaleModifyer})`;
            }
        },200)
    }
    else if(settings.rotate == "disapear"){
        game.style.transition = "0.15s";
        game.style.opacity = 0;
        setTimeout(() => {
            game.style.transition = "0s";
            for(let i = 1; i <= 64; i++){
                eval("sq" + i).style.transform = `scaleY(${scaleModifyer})`;
            }
            game.style.transform = `scaleY(${scaleModifyer})`;
        }, 150)
        setTimeout(() => {
            game.style.transition = "0.3s";
            game.style.opacity = 1;
        }, 350)
        setTimeout(() => {
            game.style.transition = "0s";
        }, 500)
        
    }
    else{
        game.style.transform = `scaleY(${scaleModifyer})`;
        for(let i = 1; i <= 64; i++){
            eval("sq" + i).style.transform = `scaleY(${scaleModifyer})`;
        }
    }
}

function gameSettings(display){
    let sidebar = document.querySelector(".sidebar-game");
  
    if(matchMedia("(max-width: 575px)").matches){
      sidebar.style.width = display == "none"? 0 : "100%"
    }
    else if(matchMedia("(max-width: 1200px)").matches){
        sidebar.style.width = display == "none"? 0 : "40%"
    }
    else{
      sidebar.style.width = display == "none"? 0 : "30%"
    }
  
}
function saveSettings(){
    let rotateElems = document.getElementsByName('board-rotate');
    rotateElems.forEach(element => {
        if(element.checked){
            settings.rotate = element.value;
        }
    });
    tableChange(true);
    gameSettings("none");
    localStorage.setItem("settings-rotate", settings.rotate);
}

first();