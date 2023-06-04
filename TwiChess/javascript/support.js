const form = document.getElementById("contact-form");
function send() {
    var data = {
        name: document.getElementById("contact-name").value,
        email: document.getElementById("contact-email").value,
        message: document.getElementById("contact-message").value,
        theme: document.getElementById("contact-theme").value
    };
    if(data.name != "" && data.email != "" && data.message != ""){
        document.getElementById("contact-message").value = "Sending...";
        document.getElementById("contact-email").value = "";
        document.getElementById("contact-name").value = "";
        emailjs.send('service_vr8kgka', 'template_q104khs', data)
        .then(function(response) {
        console.log('SUCCESS!', response.status, response.text);
        exitPage("./support-success.html");
        document.getElementById("contact-message").value = "";
        }, function(error) {
        console.log('FAILED...', error);
        });

    }
}

