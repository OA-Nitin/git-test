// Initialize jQuery UI dropdown for header menu
document.addEventListener('DOMContentLoaded', function() {
  // Wait for React to render the components
  setTimeout(() => {
    if (typeof $ !== 'undefined') {
      // Initialize the dropdown menu
      $('.menupop').each(function() {
        const $menuItem = $(this);
        const $trigger = $menuItem.find('.ab-item').first();
        const $dropdown = $menuItem.find('.ab-sub-wrapper').first();

        // Hide dropdown initially
        $dropdown.hide();

        // Toggle dropdown on click
        $trigger.on('click', function(e) {
          e.preventDefault();

          // Close all other open dropdowns
          $('.menupop').not($menuItem).removeClass('hover');
          $('.ab-sub-wrapper').not($dropdown).hide();

          // Toggle current dropdown
          $menuItem.toggleClass('hover');
          $dropdown.toggle();
        });
      });

      // Close dropdown when clicking outside
      $(document).on('click', function(e) {
        if (!$(e.target).closest('.menupop').length) {
          $('.menupop').removeClass('hover');
          $('.ab-sub-wrapper').hide();
        }
      });

      // Make the submenu items work like a menu
      $('.ab-submenu').each(function() {
        const $submenu = $(this);
        $submenu.find('.ab-item').hover(
          function() { $(this).addClass('ui-state-active'); },
          function() { $(this).removeClass('ui-state-active'); }
        );
      });

      console.log('Header dropdown menu initialized');
    } else {
      console.error('jQuery not available');
    }
  }, 1000); // Delay to ensure React has rendered the menu
});
