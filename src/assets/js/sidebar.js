// Initialize MetisMenu
document.addEventListener('DOMContentLoaded', function() {
  // Check if MetisMenu is available
  if (typeof window.metisMenu !== 'undefined') {
    new window.metisMenu('#adminmenu', {
      toggle: true,
      activeClass: 'mm-active',
      collapseClass: 'mm-collapse',
      collapseInClass: 'mm-show',
      collapseCloseClass: 'mm-collapse',
    });
  }
});
