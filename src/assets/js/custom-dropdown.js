(function ($) {
  "use strict";

  // Wait for the DOM to be ready
  $(document).ready(function() {
    // Add classes for dropdown menu
    $("#wp-admin-bar-my-account").addClass("profile_info");
    $(".ab-sub-wrapper").addClass("profile_info_iner");
    $(".ab-submenu").addClass("profile_info_details");

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

    console.log("Dropdown menu initialized");
  });

})(jQuery);
