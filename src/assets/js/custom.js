(function ($) {
    "use strict";
var getquerypage = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
if(getquerypage.length > 0)
{
    getquerypage = getquerypage[0].split('=');
    if(getquerypage.length > 0)
    {
        var getpage = getquerypage[0];
        var getpagevalue = getquerypage[1];
        if(getpagevalue == 'wc-reports'){
            $("#toplevel_page_admin-page-wc-reports a").addClass('active');
        }
    }
}
// metisMenu 
$("#adminmenu").metisMenu();
$("#admin_profile_active").metisMenu();

$("#adminmenumain").addClass("sidebar");
$("#adminmenu").addClass("metismenu");
$("#wpcontent").addClass("main_content dashboard_part large_header_bg");
$("#wpadminbar").addClass("header_iner");
$("#wp-admin-bar-my-account").addClass("profile_info");
$("#wpadminbar #wp-admin-bar-my-account .ab-sub-wrapper").addClass("profile_info_iner");
$("#wpadminbar #wp-admin-bar-user-actions").addClass("profile_info_details");

new PerfectScrollbar("#adminmenumain");
//new PerfectScrollbar("body");


$("#wp-admin-bar-my-account").hover(
  function () {
    $("#wpadminbar #wp-admin-bar-my-account .ab-sub-wrapper").fadeIn("slow");
  }
);
$("#wp-admin-bar-my-account").hover(
  function () {
    $(this).removeClass("hover");
   // console.log('sdfsdf');
  }
);

$("#adminmenuwrap").css("z-index",'unset');

$('#adminmenuwrap').prepend('<div class="logo d-flex justify-content-between"><a class="large_logo" href="'+ECHECKADMINTHEMEURLS.adminurl+'"><img src="'+ECHECKADMINTHEMEURLS.pluginurl+'/assets/img/logo.svg" alt=""></a><a class="small_logo" href="'+ECHECKADMINTHEMEURLS.adminurl+'"><img src="'+ECHECKADMINTHEMEURLS.pluginurl+'/assets/img/logo.svg" alt=""></a><div class="sidebar_close_icon d-lg-none"><i class="ti-close"></i></div></div>');

$('#adminmenu li:eq(0)').before('<li><div class="nav_title"><label>Main Menu</label></div></li>');
    
$(".open_miniSide").click(function () {
    $(".sidebar").toggleClass("mini_sidebar");
    $("#adminmenuwrap").toggleClass("mini_sidebar");
    $(".main_content ").toggleClass("full_main_content");
    $(".footer_part ").toggleClass("full_footer");
});
$(window).on('scroll', function () {
    var scroll = $(window).scrollTop();
    if (scroll < 400) {
    $('#back-top').fadeOut(500);
    } else {
    $('#back-top').fadeIn(500);
    }
});

// back to top 
$('#back-top a').on("click", function () {
    $('body,html').animate({
      scrollTop: 0
    }, 1000);
    return false;
});


// PAGE ACTIVE 
 $( "#adminmenu" ).find( "a" ).removeClass("active");
$( "#adminmenu" ).find( "li" ).removeClass("mm-active");
$( "#adminmenu" ).find( "li ul" ).removeClass("mm-show");

var current = window.location.pathname;
$("#adminmenu >li a").filter(function() {
    var link = $(this).attr("href");
    if(link){
        var getquerypage = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        if(getquerypage.length > 0)
        {
            getquerypage = getquerypage[0].split('=');
            if(getquerypage.length > 0)
            {
                var getpage = getquerypage[0];
                var getpagevalue = getquerypage[1];
                if(getpagevalue != undefined)
                {
                    if (getpagevalue.indexOf(link) != -1) {
                        $(this).parents().parents().children('ul.mm-collapse').addClass('mm-show').closest('li').addClass('mm-active');
                        $(this).addClass('active');
                        return false;
                    }
                }
                else
                {
                    if (current.indexOf(link) != -1) {
                        $(this).parents().parents().children('ul.mm-collapse').addClass('mm-show').closest('li').addClass('mm-active');
                        $(this).addClass('active');
                        return false;
                    }
                }
            }
        }
        else
        {
            if (current.indexOf(link) != -1) {
                $(this).parents().parents().children('ul.mm-collapse').addClass('mm-show').closest('li').addClass('mm-active');
                $(this).addClass('active');
                return false;
            }
        }
    }
});

    
    $(document).ready(function(){
        if($("#adminmenu >li").hasClass("wp-menu-open")){
            $(".wp-has-current-submenu").addClass("mm-active");
            //$(".wp-menu-open").addClass("mm-active");
            $(".wp-menu-open").parents().children('ul.mm-collapse').addClass('mm-show');
            //alert('hii');
        }   
    }); 
    
// #NOTIFICATION_ 
    // for MENU notification
    $('.bell_notification_clicker').on('click', function () {
        /*var notification_count = $("#notification_count").val();
        if(notification_count > 0)
        {*/
            if($('.Menu_NOtification_Wrap').hasClass('active')){
                $(".echeck_not_popup").hide();
                $('.Menu_NOtification_Wrap').removeClass('active');
            }
            else
            {
                $(".echeck_not_popup").show();
                $('.Menu_NOtification_Wrap').addClass('active');
            }
        /*}*/
        
    });

    $(document).click(function(event){
        if (!$(event.target).closest(".bell_notification_clicker ,.Menu_NOtification_Wrap").length) {
            $(".echeck_not_popup").hide();
            $("body").find(".Menu_NOtification_Wrap").removeClass("active");
        }
    });
        // CHAT_MENU_OPEN 
        $('.CHATBOX_open').on('click', function() {
            $('.CHAT_MESSAGE_POPUPBOX').toggleClass('active');
        });
        $('.MSEESAGE_CHATBOX_CLOSE').on('click', function() {
            $('.CHAT_MESSAGE_POPUPBOX').removeClass('active');
        });
        $(document).click(function(event) {
            if (!$(event.target).closest(".CHAT_MESSAGE_POPUPBOX, .CHATBOX_open").length) {
                $("body").find(".CHAT_MESSAGE_POPUPBOX").removeClass("active");
            }
        });

        // CHAT_MENU_OPEN 
        $('.serach_button').on('click', function() {
            $('.serach_field-area ').addClass('active');
        });
        
        $(document).click(function(event) {
            if (!$(event.target).closest(".serach_button, .serach_field-area").length) {
                $("body").find(".serach_field-area").removeClass("active");
            }
        });
    //progressbar js
    $(document).ready(function(){
        var proBar = $('#bar1');
        if(proBar.length){
            proBar.barfiller({barColor: '#FFBF43', duration: 2000});
        }
        var proBar = $('#bar2');
        if(proBar.length){
            proBar.barfiller({barColor: '#508FF4', duration: 2100});
        }
        var proBar = $('#bar3');
        if(proBar.length){
            proBar.barfiller({barColor: '#4BE69D', duration: 2200});
        }
        var proBar = $('#bar4');
        if(proBar.length){
            proBar.barfiller({barColor: '#FD3C97', duration: 2200});
        }
        var proBar = $('#bar5');
        if(proBar.length){
            proBar.barfiller({barColor: '#6D81F5', duration: 2200});
        }
        var proBar = $('#bar6');
        if(proBar.length){
            proBar.barfiller({barColor: '#0DC8DE', duration: 2200});
        }
        var proBar = $('#bar7');
        if(proBar.length){
            proBar.barfiller({barColor: '#FFB822', duration: 2200});
        }
        
    });
    
    
    //notification section js
    $(".close_icon").click(function () {
      $(this).parents(".hide_content").slideToggle("0");
    });




    //count up js
    var count= $('.counter');
        if(count.length){
        count.counterUp({
            delay: 100,
            time: 5000
        });
    }




    // data table 

    
    //niceselect select jquery
    // $('.nice_Select').niceSelect();
    // //niceselect select jquery
    // $('.nice_Select2').niceSelect();
    // $('.default_sel').niceSelect();

    // niceSelect 
    var niceSelect = $('.nice_Select');
    if (niceSelect.length) {
        niceSelect.niceSelect();
    };

    var niceSelect = $('.nice_Select2');
    if (niceSelect.length) {
        niceSelect.niceSelect();
    };

    var niceSelect = $('.default_sel');
    if (niceSelect.length) {
        niceSelect.niceSelect();
    };


    // datepicker 
    $(document).ready(function() {
        var date_picker = $('#start_datepicker');
        if(date_picker.length){
            date_picker.datepicker();
        }

        var date_picker = $('#end_datepicker');
        if(date_picker.length){
            date_picker.datepicker();
        }
    });



    //progressbar js
    var delay = 500;
    $(".progress-bar").each(function(i){
        $(this).delay( delay*i ).animate( { width: $(this).attr('aria-valuenow') + '%' }, delay );

        $(this).prop('Counter',0).animate({
            Counter: $(this).text()
        }, {
            duration: delay,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now)+'%');
            }
        });
    });

    //active sidebar
    $('.sidebar_icon').on('click', function(){
        $('.sidebar').toggleClass('active_sidebar');
    });
    $('.sidebar_close_icon i').on('click', function(){
        $('.sidebar').removeClass('active_sidebar');
    });
    
    //active menu
    $('.troggle_icon').on('click', function(){
        $('.setting_navbar_bar').toggleClass('active_menu');
    });

    //active courses option
    // $('.courses_option').on('click', function(){
    //     $(this).parent(".custom_select").toggleClass('active');
    // });

    $('.custom_select').click( function(){
        if ( $(this).hasClass('active') ) {
            $(this).removeClass('active');
        } else {
            $('.custom_select.active').removeClass('active');
            $(this).addClass('active');    
        }
    });
//     $( 'ul.nav li' ).on( 'click', function() {
//         $( this ).parent().find( 'li.active' ).removeClass( 'active' );
//         $( this ).addClass( 'active' );
//   });

    $(document).click(function(event){
        if (!$(event.target).closest(".custom_select").length) {
            $("body").find(".custom_select").removeClass("active");
        }
    });
    //remove sidebar
    $(document).click(function(event){
        if (!$(event.target).closest(".sidebar_icon, .sidebar").length) {
            $("body").find(".sidebar").removeClass("active_sidebar");
        }
    });
    
    // check all
    $("#checkAll").click(function () {
        $('input:checkbox').not(this).prop('checked', this.checked);
    });

    // sumer note
    var summerNote = $('#summernote');
    if(summerNote.length){
        summerNote.summernote({
            placeholder: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            tabsize: 2,
            height: 305
        });
    }
    // sumer note
    var summerNote = $('.lms_summernote');
    if(summerNote.length){
        summerNote.summernote({
            placeholder: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            tabsize: 2,
            height: 305
        });
    }
    // sumer note
    var summerNote = $('.lms_summernote');
    if(summerNote.length){
        summerNote.summernote({
            placeholder: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            tabsize: 2,
            height: 305
        });
    }
    
    
    //custom file
    $('.input-file').each(function() {
        var $input = $(this),
            $label = $input.next('.js-labelFile'),
            labelVal = $label.html();
        
       $input.on('change', function(element) {
          var fileName = '';
          if (element.target.value) fileName = element.target.value.split('\\').pop();
          fileName ? $label.addClass('has-file').find('.js-fileName').html(fileName) : $label.removeClass('has-file').html(labelVal);
       });
    });
    
    //custom file
    $('.input-file2').each(function() {
        var $input = $(this),
            $label = $input.next('.js-labelFile1'),
            labelVal = $label.html();
        
       $input.on('change', function(element) {
          var fileName = '';
          if (element.target.value) fileName = element.target.value.split('\\').pop();
          fileName ? $label.addClass('has-file').find('.js-fileName1').html(fileName) : $label.removeClass('has-file').html(labelVal);
       });
    });

    // meta_keywords 
    var bootstrapTag =  $("#meta_keywords");
    if(bootstrapTag.length){
        bootstrapTag.tagsinput();
    }


  if ($('.lms_table_active').length) {
    $('.lms_table_active').DataTable({
        bLengthChange: false,
        "bDestroy": true,
        language: {
            search: "<i class='ti-search'></i>",
            searchPlaceholder: 'Quick Search',
            paginate: {
                next: "<i class='ti-arrow-right'></i>",
                previous: "<i class='ti-arrow-left'></i>"
            }
        },
        columnDefs: [{
            visible: false
        }],
        responsive: true,
        searching: false,
    });
}
  if ($('.lms_table_active2').length) {
    $('.lms_table_active2').DataTable({
        bLengthChange: false,
        "bDestroy": false,
        language: {
            search: "<i class='ti-search'></i>",
            searchPlaceholder: 'Quick Search',
            paginate: {
                next: "<i class='ti-arrow-right'></i>",
                previous: "<i class='ti-arrow-left'></i>"
            }
        },
        columnDefs: [{
            visible: false
        }],
        responsive: true,
        searching: false,
        info: false,
        paging: false
    });
}

if ($('.lms_table_active3').length) {
    $('.lms_table_active3').DataTable({
        bLengthChange: false,
        "bDestroy": false,
        language: {
            search: "<i class='ti-search'></i>",
            searchPlaceholder: 'Quick Search',
            paginate: {
                next: "<i class='ti-arrow-right'></i>",
                previous: "<i class='ti-arrow-left'></i>"
            }
        },
        columnDefs: [{
            visible: false
        }],
        responsive: true,
        searching: false,
        info: true,
        paging: true
    });
}
//   layout select
  $('.layout_style').click( function(){
    if ( $(this).hasClass('layout_style_selected') ) {
        $(this).removeClass('layout_style_selected');
    } else {
        $('.layout_style.layout_style_selected').removeClass('layout_style_selected');
        $(this).addClass('layout_style_selected');    
    }
});



// switcher menu 
// anly for side switcher menu 
$('.switcher_wrap li.Horizontal').click( function(){
    $('.sidebar').addClass('hide_vertical_menu');
    $('.main_content ').addClass('main_content_padding_hide');
    $('.horizontal_menu').addClass('horizontal_menu_active');
    $('.main_content_iner').addClass('main_content_iner_padding');
    $('.footer_part').addClass('pl-0');
});

$('.switcher_wrap li.vertical').click( function(){
    $('.sidebar').removeClass('hide_vertical_menu');
    $('.main_content ').removeClass('main_content_padding_hide');
    $('.horizontal_menu').removeClass('horizontal_menu_active');
    $('.main_content_iner').removeClass('main_content_iner_padding');
    $('.footer_part').removeClass('pl-0');
});

// switcher_wrap 
// anly for side switcher menu 

$('.switcher_wrap li').click(function(){
    $('li').removeClass("active");
    $(this).addClass("active");
});

$('.custom_lms_choose li').click(function(){
    $('li').removeClass("selected_lang");
    $(this).addClass("selected_lang");
});


$('.spin_icon_clicker').on('click', function(e) {
    $('.switcher_slide_wrapper').toggleClass("swith_show"); //you can list several class names 
    e.preventDefault();
  });

//   color skin 
  $(document).ready(function(){
    $("body").on('blur','#add_funds_input',function()
    {
        var fund = $(this).val();
        if(fund > 0){
            var newfund = parseFloat(fund).toFixed(2);
            $("#add_funds_input").val(newfund);
        }else{
            fund = 0.00;
            var newfund = parseFloat(fund).toFixed(2);
            $("#add_funds_input").val(newfund);
        }
    })
    $(function () {
        "use strict";
        $(".pCard_add").click(function () {
          $(".pCard_card").toggleClass("pCard_on");
          $(".pCard_add i").toggleClass("fa-minus");
        });
      });
      
      $("#adminmenu li").each(function(){
        if($(this).find('ul').length > 0){
            $(this).find('a').eq(0).attr('href','javascript:void(0);');
            $(this).find('ul').css({'position':'relative','top':'auto','left':'auto','margin-top':'0'});
        }
        $(".menu-icon-equipayecheckform").click(function(){
            $("#menu-posts a").removeClass('active');
        })
    })
      /*$(".bell_notification_clicker").mouseover(function(){
            var notification_count = $("#notification_count").val();
            if(notification_count > 0)
            {
                $(".echeck_not_popup").show();
            }
        })
        $(".bell_notification_clicker").mouseout(function(){
            $(".echeck_not_popup").hide();
        })*/
    
        new PerfectScrollbar('#adminmenumain'); 
    }); 
    
    
    /*$("body").click(function(){
        $(".adv_main").addClass("display_none");
    })*/
    var input = $("#show_subscdata_search");
    input.focusin(function(){
        $(".adv_main").removeClass("display_none");
        $(".adv_main").addClass("display_block");
    });
    var echeck_input = $("#show_adv_search");
    echeck_input.focusin(function(){
        $(".adv_main").removeClass("display_none");
        $(".adv_main").addClass("display_block");
    });

 

    $(document).on('click', function (event) {
      /*if (!$(event.target).closest('#show_adv_search').length || !$(event.target).closest('#btn_adv').length || !$(event.target).closest('.search_tip_adv').length || !$(event.target).closest('#adv_filter').length || !$(event.target).closest('#show_subscdata_search').length) {*/
        $(".adv_main").removeClass("display_block");
        $(".adv_main").addClass("display_none");
      /*}*/
    });
    $(".search_inner").click(function(e){
      e.stopPropagation();
    });
    $("#btn_adv").click(function () {
        $(".search_tip_adv").addClass("display_block");
        $(".search_tip").addClass("display_none");
    });
     /*$("#multiple").select2({
          placeholder: "Add Filter",
          allowClear: true
      });*/
    $(".echeck_reset").click(function(){
        $(".adv_main").addClass("display_none");
        /*$("#search_address").val('');
        $("#search_phone").val('');
        $("#search_email").val('');
        $("#search_memo").val('');
        $("#search_amount").val('');
        $("#search_id").val('');
        $("input[name=datestart]").val('');
        $("input[name=dateend]").val('');
        $("#echeck_form").submit();*/
    })
    jQuery("#echeck_form").submit(function() {
        if(jQuery("#datestart").val() !="" && jQuery("#dateend").val() !=""){
            var startdate = jQuery("#datestart").val();
            var enddate = jQuery("#dateend").val();
            var date1 = new Date(startdate);
            var date2 = new Date(enddate);
            var Difference_In_Time = date2.getTime() - date1.getTime();
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            if(Difference_In_Days > 31){
                jQuery("#inputDateErr").html("<span>You can search for maximum one month of data at one time.</span>");
                return false;
            }
        }
        else{
            return true;
        }
    });
    
    jQuery("#echeck_batch_report_form").submit(function() {
        if(jQuery("#datestart").val() !="" && jQuery("#dateend").val() !=""){
            var startdate = jQuery("#datestart").val();
            var enddate = jQuery("#dateend").val();
            var date1 = new Date(startdate);
            var date2 = new Date(enddate);
            var Difference_In_Time = date2.getTime() - date1.getTime();
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            if(Difference_In_Days > 7){
                jQuery("#inputDateErr").html("<span>You can search for maximum one week of data at one time.</span>");
                return false;
            }
        }
        else{
            return true;
        }
    });
    jQuery("#datestart").change(function(){
        jQuery("#dateend").val('');
        var startdate = jQuery("#datestart").val();
        var getstartdate = new Date(startdate);

        /* getstartdate.setDate(getstartdate.getDate() + 1);
        var newdate = getstartdate.toISOString().split('T')[0]; */
		
		getstartdate.setDate(getstartdate.getDate());
        var newdate = getstartdate.toISOString().split('T')[0];

        jQuery("#dateend").attr('min',newdate);
    })
}(jQuery));