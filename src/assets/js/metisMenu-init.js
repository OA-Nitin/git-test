// Initialize MetisMenu
document.addEventListener('DOMContentLoaded', function() {
  // Check if MetisMenu is available
  setTimeout(() => {
    if (typeof window.metisMenu !== 'undefined') {
      const metisMenuInstance = new window.metisMenu('#adminmenu', {
        toggle: true,
        activeClass: 'mm-active',
        collapseClass: 'mm-collapse',
        collapseInClass: 'mm-show',
        collapseCloseClass: 'mm-collapse',
      });
      
      //console.log('MetisMenu initialized');
    } else {
      console.error('MetisMenu not available');
    }
  }, 500); // Small delay to ensure DOM is fully loaded
});
