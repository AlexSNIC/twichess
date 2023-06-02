setTimeout(() =>{ 
    document.querySelector(".content").style.overflowY = "visible";
}, 2000);

function play(){
    let blackout = document.querySelector("#screen-blackout");
    blackout.style.display = "block";

    let local = document.querySelector(".play-local");
    local.style.transform = "translate(-50%, -50%)";

    document.querySelector(".advanced-local").style.display = "none";
    document.querySelector(".advanced-options-local").style.display = "block";
}

function deselectAll(){
    let blackout = document.querySelector("#screen-blackout");

    let local = document.querySelector(".play-local");
    local.style.transform = "translate(100vw, -50%)";
    blackout.style.display = "none";
}

function toggleAdvanced(){
    document.querySelector(".advanced-local").style.display = "block";
    document.querySelector(".advanced-options-local").style.display = "none";
}

function submitGame(mode){
    if(mode == "local"){
        var time = document.getElementById("time-local").value;
        var doCastle = document.getElementById("castle-local").checked;
        var enPassant = document.getElementById("en-passant-local").checked;
        var ipm = document.getElementById("ipm-local").checked;

        localStorage.setItem("time", time)
        localStorage.setItem("doCastleWhite", [doCastle, doCastle]);
        localStorage.setItem("doCastleBlack", [doCastle, doCastle]);
        localStorage.setItem("enPassant", enPassant);
        localStorage.setItem("ipm", ipm);
        localStorage.setItem("table", "default");
    }
    else if(mode == "classic"){
        localStorage.setItem("time", 30);
    }
    else if(mode == "quick"){
        localStorage.setItem("time", 10);
    }
    else if(mode == "blitz"){
        localStorage.setItem("time", 5);
    }


    window.location.href = "play.html";
}