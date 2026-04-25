// Smooth scroll enhancement (optional)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Form submit alert
document.querySelector(".form").addEventListener("submit", function(e){
  e.preventDefault();
  alert("🎉 Registration Submitted Successfully!");
});
