(function(){
  emailjs.init("5Uhk8RMc3sldHqW2I"); // replace with your EmailJS public key
})();

document.getElementById("contact-form").addEventListener("submit", function(e) {
  e.preventDefault();

  emailjs.sendForm(
    "service_2rl1jgs",   // from EmailJS
    "template_rxwbgoh",  // from EmailJS
    this
  )
  .then(function() {
    alert("Message sent successfully!");
  }, function(error) {
    alert("Failed to send message.");
    console.log(error);
  });
});

