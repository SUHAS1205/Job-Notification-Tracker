document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.querySelector('.nav-bar__toggle');
  const navLinksContainer = document.querySelector('.nav-bar__links');

  // Highlight active link & Prevent reload on active link click
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');

    // Check if this link corresponds to the current page
    // Handle root / -> index.html case
    const isCurrent = linkPath === currentPath.substring(currentPath.lastIndexOf('/') + 1) ||
      (currentPath.endsWith('/') && linkPath === 'index.html') ||
      (currentPath.endsWith('index.html') && linkPath === './') ||
      (currentPath.endsWith('index.html') && linkPath === '/');

    if (isCurrent) {
      link.classList.add('active');

      // Prevent reload / flicker
      link.addEventListener('click', (e) => {
        e.preventDefault();
      });
    }
  });

  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('open');
    });
  }
});
