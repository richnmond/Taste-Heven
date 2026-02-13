document.getElementById('bookingForm')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const byId = (id) => document.getElementById(id);

  const name = byId('name')?.value || '';
  const email = byId('email')?.value || '';
  const people = byId('people')?.value || byId('guests')?.value || '';
  const dateValue = byId('date')?.value || '';
  const timeValue = byId('time')?.value || '';
  const message = byId('message')?.value || '';
  const contactMethod = byId('contactMethod')?.value || '';

  const dateTime = timeValue ? `${dateValue} ${timeValue}`.trim() : dateValue;
  const extra = [message, contactMethod && `Preferred Contact: ${contactMethod}`]
    .filter(Boolean)
    .join(' | ');

  const text = `ðŸ½ Booking Request:%0AðŸ‘¤ Name: ${name}%0AðŸ“§ Email: ${email}%0AðŸ‘¥ People: ${people}%0AðŸ“… Date: ${dateTime}%0AðŸ’¬ Notes: ${extra}`;
  const whatsappUrl = `https://wa.me/2347059831230?text=${text}`; // Replace with your WhatsApp number
  window.open(whatsappUrl, '_blank');
});
