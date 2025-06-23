/**
 * Menu Initialization Script
 * This script handles the initialization of menus and dropdowns
 * It's designed to work with both development and production builds
 */

// Function to initialize MetisMenu
function initializeMetisMenu() {
  //console.log('Attempting to initialize MetisMenu...');
  
  if (typeof $ !== 'undefined' && $.fn.metisMenu) {
    try {
      // First, destroy any existing metisMenu instances to prevent conflicts
      if ($('#adminmenu').data('metisMenu')) {
        $('#adminmenu').metisMenu('dispose');
        //console.log('Disposed existing MetisMenu instance');
      }
      
      // Initialize metisMenu with proper configuration
      $('#adminmenu').metisMenu({
        toggle: true,
        preventDefault: false,
        triggerElement: 'a',
        parentTrigger: 'li',
        subMenu: 'ul'
      });
      
      //console.log('MetisMenu successfully initialized');
      
      // Add active class to current menu items
      const currentPath = window.location.pathname;
      $('#adminmenu li a').each(function() {
        const link = $(this).attr('href');
        if (link && currentPath.includes(link) && link !== '/') {
          $(this).addClass('active');
          $(this).parents('li').addClass('mm-active');
          $(this).parents('ul.mm-collapse').addClass('mm-show');
          //console.log('Set active menu item:', link);
        }
      });
    } catch (error) {
      console.error('Error initializing MetisMenu:', error);
    }
  } else {
    console.error('jQuery or metisMenu plugin not available');
  }
}

// Function to initialize dropdown menus
function initializeDropdowns() {
  //console.log('Attempting to initialize dropdowns...');
  
  if (typeof $ !== 'undefined') {
    try {
      // Initially hide the dropdown
      $(".ab-sub-wrapper").hide();

      // Hover effect for dropdown menu
      $("#wp-admin-bar-my-account").hover(
        function () {
          $(this).find(".ab-sub-wrapper").stop().fadeIn("slow");
        },
        function () {
          $(this).find(".ab-sub-wrapper").stop().fadeOut("slow");
        }
      );
      
      //console.log('Dropdowns successfully initialized');
    } catch (error) {
      console.error('Error initializing dropdowns:', error);
    }
  } else {
    console.error('jQuery not available for dropdown initialization');
  }
}

// Main initialization function
function initializeUI() {
  //console.log('UI initialization started');
  
  // Initialize MetisMenu
  initializeMetisMenu();
  
  // Initialize dropdowns
  initializeDropdowns();
  
  //console.log('UI initialization completed');
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  //console.log('DOM loaded, waiting for React to render...');
  
  // Initial delay to ensure React has rendered components
  setTimeout(initializeUI, 1000);
  
  // Additional initialization after navigation (for SPA navigation)
  // This helps with menu initialization after login or route changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        // If adminmenu is added to the DOM, initialize again
        if (document.getElementById('adminmenu')) {
          //console.log('Menu structure changed, reinitializing...');
          setTimeout(initializeUI, 500);
        }
      }
    });
  });
  
  // Start observing the document body for DOM changes
  observer.observe(document.body, { childList: true, subtree: true });
});

// Additional initialization for route changes (for React Router)
window.addEventListener('popstate', function() {
  //console.log('Navigation detected, reinitializing menus...');
  setTimeout(initializeUI, 500);
});
