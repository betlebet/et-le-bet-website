function scrollToSection(event, id) {
  event.preventDefault();
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}
