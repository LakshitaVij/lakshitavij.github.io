document.addEventListener('DOMContentLoaded', function() {
    const brains = document.querySelectorAll('.brain-container');
  
    // Set initial positions
    brains.forEach((brain, index) => {
      brain.style.left = `${Math.random() * window.innerWidth}px`;
      brain.style.top = `${Math.random() * window.innerHeight}px`;
      setTimeout(() => {
        brain.style.opacity = '1';
        brain.style.transition = 'opacity 0.5s ease-in-out';
        // Add more animations or adjustments here
      }, index * 500);
    });
  });
  