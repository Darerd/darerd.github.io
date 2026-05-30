(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    var rocket = document.getElementById('rocket');
    if (!rocket) return;

    var isShowing = false;

    window.addEventListener('scroll', function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 500) {
        if (!isShowing) {
          rocket.classList.add('show');
          isShowing = true;
        }
      } else {
        if (isShowing) {
          rocket.classList.remove('show');
          isShowing = false;
        }
      }
    }, { passive: true });

    rocket.addEventListener('click', function(e) {
      e.preventDefault();
      rocket.classList.add('launch');
      
      // Smooth scroll to top using native browser APIs
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      // Match rocket transition delay and remove classes
      setTimeout(function() {
        rocket.classList.remove('show', 'launch');
        isShowing = false;
      }, 600);
    });
  });
})();
