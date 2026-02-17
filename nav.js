document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.querySelector('.nav-bar__toggle');
  const navLinksContainer = document.querySelector('.nav-bar__links');

  // Highlight active link
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath.substring(currentPath.lastIndexOf('/') + 1) || (currentPath.endsWith('/') && link.getAttribute('href') === 'index.html')) {
     link.classList.add('active');
    }
  });

  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('open');
    });
  }
});
