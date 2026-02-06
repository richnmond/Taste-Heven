document.getElementById('bookingForm')?.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const people = document.getElementById('people').value;
  const date = document.getElementById('date').value;
  const message = document.getElementById('message').value;

  const text = `🍽 Booking Request:%0A👤 Name: ${name}%0A📧 Email: ${email}%0A👥 People: ${people}%0A📅 Date: ${date}%0A💬 Message: ${message}`;
  const whatsappUrl = `https://wa.me/2347059831230?text=${text}`; // Replace with your WhatsApp number
  window.open(whatsappUrl, '_blank');
});
