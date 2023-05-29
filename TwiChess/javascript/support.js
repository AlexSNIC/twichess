emailjs.init("A9VXx06qGAoJEFdbK");
const form = document.getElementById("contact-form");
function send() {
    if (form.checkValidity() == false) {
        form.reportValidity();
        return;
    }
    var date = {
        name: document.getElementById("contact-name").value,
        email: document.getElementById("contact-email").value,
        message: document.getElementById("contact-message").value,
        theme: document.getElementById("contact-theme").value
    };
    console.log(date)
    emailjs.send("TwiChess_ID2023", "TwiChess_Support", date)
    .then(
        function (res){ 
            alert("Mesajul a fost transmis cu succes")  
            form.reset();
            console.log(res)
        },
        function (error) {
            alert("Eroare la transmitere. Contactati prin telefon magazinul.")
            console.log(error);
        })
}

