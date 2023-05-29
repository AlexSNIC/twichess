function play(mode){
    let blackout = document.querySelector("#screen-blackout");
    blackout.style.display = "block";
    if(mode == 'local'){
        let local = document.querySelector(".play-local");
        local.style.transform = "translate(-50%, -50%)";
    }
}

function deselectAll(){
    let blackout = document.querySelector("#screen-blackout");

    let local = document.querySelector(".play-local");
    local.style.transform = "translate(100vw, -50%)";
    blackout.style.display = "none";
}

function toggleAdvanced(mode){
    if(mode == "local"){
        let advanced = document.querySelector(".advanced-local");
        if(advanced.style.display == "none"){
            advanced.style.display = "block";
        }
        else{
            advanced.style.display = "none"; 
        }
    }
}

function submitGame(mode){
    if(mode == "local"){
        var time = document.getElementById("time-local").value;
        var doCastle = document.getElementById("castle-local").checked;
        var enPassant = document.getElementById("en-passant-local").checked;
        var ipm = document.getElementById("ipm-local").checked;

        localStorage.setItem("time", time)
        localStorage.setItem("doCastle", doCastle);
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
        localStorage.setItem("time", 3);
    }


    window.location.href = "play.html";
}