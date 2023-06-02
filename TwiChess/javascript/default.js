function exitPage(link, ask = false) {
  if (ask === true) {
    if (confirm("Quit current match?")) {
      window.location.href = link; // Redirect if user confirms
    }
  } else {
    window.location.href = link; // Redirect directly without asking
  }
}
function toggleSettings() {

}
function toggleNav(display) {
  let blackout = document.getElementById("blackout");
  let sidebarNav = document.getElementsByClassName("sidebar-nav").item(0);

  blackout.style.display = display;
  if(matchMedia("(max-width: 575px)").matches){
    sidebarNav.style.width = display == "none"? 0 : "100%"
  }
  else{
    sidebarNav.style.width = display == "none"? 0 : "40%"
  }

}
