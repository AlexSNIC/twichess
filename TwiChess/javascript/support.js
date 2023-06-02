const form = document.getElementById("contact-form");
function send() {
    var data = {
        name: document.getElementById("contact-name").value,
        email: document.getElementById("contact-email").value,
        message: document.getElementById("contact-message").value,
        theme: document.getElementById("contact-theme").value
    };
    emailjs.send('service_vr8kgka', 'template_q104khs', data)
    .then(function(response) {
       console.log('SUCCESS!', response.status, response.text);
    }, function(error) {
       console.log('FAILED...', error);
    });
}

