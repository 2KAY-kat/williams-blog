// ------Mobile Menu Functionality
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('header nav');
  const overlay = document.createElement('div');
  const slideInmanue = document.querySelector('.nav-links')

  function toggleMenu() {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
    slideInmanue.classList.toggle('active')
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }

  overlay.addEventListener('click', toggleMenu);

  const navLinks = document.querySelectorAll('header nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) toggleMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      menuToggle.classList.remove('active');
      nav.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
      slideInmanue.classList.remove('acctive')
    }
  });
}

const style = document.createElement('style');
style.textContent = `
  body.no-scroll {
    overflow: hidden;
  }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', initMobileMenu);
