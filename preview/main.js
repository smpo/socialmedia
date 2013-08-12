$(function() {

  // Settings
  // These settings should be modified to fit the needs of the experimenter, especially the qualtrics id to redirect to
  function set_settings() {
    window.settings = [];

    // number of avatars the user can choose from, default: 82
    settings.numberofavatars = 82;

    // length of the task in milliseconds, default: 180000 (3min) 
    settings.tasklength = 180000; 

    // in condition 1, user will receive likes at the following timepoints (in ms), default: [12000, 9999999]
    settings.condition_1_likes = [12000, 9999999]; 

    // ... in condition 2, user will receive likes at the following timepoints (in ms), default: [10000, 15000,35000,80000,1320000,150000]
    settings.condition_2_likes = [10000, 15000,35000,80000,1320000,150000];  
    
    // in condition 3, user will receive likes at the following timepoints (in ms), default: [10000, 11000,15000,35000,80000,100000,110000,150000,20000]
    settings.condition_3_likes = [10000, 11000,15000,35000,80000,100000,110000,150000,20000]; 

    // usernames by which the likes will be given, drawn in subsequent order
    settings.likes_by = ['John','AncaD','NN','Arjen','Jane','George','Dan','Heather','Dan']; 

    // qualtrics id
    settings.qualtricsid = 'SV_86MZEJccEKhl4qh';
  }

  // The paradigm consists of a number of slides that participants see one after the other.
  // The logic of the slides is described in seperate init_... functions.
  // Usually the slides hide the previous slide, and show the container with the slides content, and define what happens on button clicks, etc.

  // Intro slide with instructions
  function init_intro() {

    // Show the container with the intro text
  	$('#intro').show();
	
    // Make the intro button clickable
  	$('#submit_intro').on('click',function() {

        // Hide the intro slide and show the slide in which participants enter their username
			  $('#intro').hide();
  			init_name();  			

  	});	
  }
  

  // Slide in which participants are asked to enter their username
  function init_name() {

  	$('#name').show();

    // Only alphanumeric usernames without spaces are accepted
  	$('#submit_username').on('click',function() {

  		var error = 0;
  		var uname = $('#username').val();

  		if(uname == "") {
  			error = 1;
  			errormsg = 'Please enter text';
  			uname = "undefined";
  		}
  		if(not_alphanumeric(uname)) {
  			error = 1;
  			errormsg = 'Please only letters (and no spaces)';
  		}  		

  		if(error == 0) {
			$('#name').hide();
			window.username = $('#username').val();
  			init_avatar();  			
  		} else {
  			alertify.log(errormsg,"error");
  		}


  	});
  }


  // Avatar slide in which the participant is asked to select an avatar
  function init_avatar() {
  	$('#avatar').show();

    // Add avatar images to the slide, avatars are stored in the folder avatars are are numbered as avatar_NUMBER.png
    // How many avatars are added depends on the according setting
    var avatars = window.settings.numberofavatars;    
  	for(var i=0; i<avatars; i++) 
  	{ 
  		$('.avatars').append('<img id="avatar_' + i+ '" src="avatars/avatar_' + i + '.png" class="avatar" />');
  	} 

  	$('.avatar').on('click', function() {
  		$('.avatar').removeClass('selected');
  		$(this).addClass('selected');
  	});

    	$('#submit_avatar').on('click',function() {
    		if($('.selected').length == 1) {
  			$('#avatar').hide();
  			window.avatar = $('.selected').attr('id');
  			window.avatarexport = /avatar_([^\s]+)/.exec(window.avatar)[1];
    			init_text();  			
    		} else {
    			alertify.log("Please select an avatar","error");
    		}
    	});

  }


  // Slide for description
  function init_text() {
  	$('#text').show();

  	$("#description").keyup(function(){
  	  $("#count").text("Characters left: " + (400 - $(this).val().length));
  	});

    // To continue to the next slide, a description between 140 and 400 characters is required
  	$('#submit_text').on('click',function() {

  		var error = 0;
  		if($('#description').val() == "") {
  			error = 1;
  			errormsg = 'Please enter text';
  		}
  		if($('#description').val() !== "" && $('#description').val().length < 140) {
		
  			error = 1;
  			errormsg = 'Please write a bit more';
			}
  		if($('#description').val().length > 401) {
  		
  			error = 1;
  			errormsg = 'Please enter less text';
  		}  		
  		if(error == 0) {
  			$('#text').hide();
  			window.description = $('#description').val();
    			init_fb_intro();  			
    		} else {
    			alertify.log(errormsg,"error");
    		}
  	});  	
  }


  // More instructions
  function init_fb_intro() {
  	$('#fb_intro').show();
	
  	$('#submit_fb_intro').on('click',function() {

			$('#fb_intro').hide();
 			init_fb_login();  			

  	});	
  }


  // Login screen  
  function init_fb_login() {
  	$('#fb_login').show();
	
    // Participant can continue after 8000ms = 8s
  	setTimeout(function() {
  		$('#msg_all_done').show();
  		$("#loader").hide();
  	}, 8000);
	
  	$('#submit_fb_login').on('click',function() {
			$('#fb_login').hide();
  			init_task();  			
  	});	
  }
  
  // Task starts
  function init_task() {

    $('#task').show();

    // Unbind backspace key so that the user does not go back to the previous page accidentally
	  shortcut.add("Backspace",function() {});      

    // Init countdown
  	jQuery("#countdown").countDown({
  		startNumber: window.settings.tasklength/1000, // in seconds
  		callBack: function(me) {
  			console.log('over');
        $('#timer').text('00:00');
  		}
  	});
	
    // likes that the user reveive

		users = {
		  "posts" : [
			{
			  "avatar": 'avatars/' + window.avatar + '.png',
			  "username": window.username,
			  "text": window.description,
			  "likes": window.settings.condition_likes,
			  "usernames": window.settings.likes_by
			}
		  ]
		};
		
    // Add user box to slide
	  var tpl = $('#usertmp').html(),html = Mustache.to_html(tpl, users);
	  $("#task").append(html);
	  
    // Add other boxes to slide
	  var tpl = $('#otherstmp').html(),html = Mustache.to_html(tpl, others);
	  $("#task").append(html);

    // Randomize order of other players boxes
    function reorder() {
       var grp = $("#others").children();
       var cnt = grp.length;

       var temp,x;
       for (var i = 0; i < cnt; i++) {
           temp = grp[i];
         x = Math.floor(Math.random() * cnt);
         grp[i] = grp[x];
         grp[x] = temp;
     }
     $(grp).remove();
     $("#others").append($(grp));
    }
    reorder();    

    // When user receives likes
	  $('.userslikes').each(function() {
  		var that = $(this);
  		var usernames = $(this).data('usernames').split(",");
  		var times = $(this).data('likes').split(",");

  		for(var i=0; i<times.length; i++) 
  		{ 
  			times[i] = +times[i]; 
  			
  			themsg = usernames[i] + " liked your post";

  			setTimeout(function(themsg) {
  				that.text(parseInt(that.text()) + 1);
  				alertify.success(themsg)

  			}, times[i], themsg);
  		} 		
	  });
	  
    // When others receive likes
	  $('.otherslikes').each(function() {
  		var that = $(this);
  		var times = $(this).data('likes').split(",");
  		
  		for(var i=0; i<times.length; i++) 
  		{ 
  			times[i] = +times[i]; 
  			
  			setTimeout(function () {
  				that.text(parseInt(that.text()) + 1);
  			}, times[i]);
  			
  		} 
	  });
	 

    // Initialize like buttons
	  $('.btn-like').on('click', function() {
		  $(this).prev().text(parseInt($(this).prev().text()) + 1);
      // Like buttons can only be clicked once
		  $(this).attr("disabled", true);
	  });

    // Initalize Masonry plugin
    // For display of user and other players boxes in columns without gaps
		$('#task').masonry({
		  itemSelector : '.entry',
		  columnWidth : 10
		});


    // Redirect, default after 180000ms = 180s = 3min
    setTimeout(function() {
    
    $(window).unbind('beforeunload');
    
    $('#final-continue').show();

    $('#timer').text('00:00');
    
    $('#final-continue').on('click', function() {

      // Redirect link
      location.href = 'http://fppvu.qualtrics.com/SE/?SID='+settings.qualtricsid+'&p='+window.participant+'&c='+window.condition+'&u='+encodeURI(window.username)+'&av='+window.avatarexport+'&d='+encodeURI(window.description);

    });
    
    },window.settings.tasklength); // timing for task

  }
	

  // Get URL parameters to set condition number and participant number
  function get_params() {
    // condition number must be 1, 2, or 3
    if(window.QueryString.c !== undefined && !isNaN(parseInt(window.QueryString.c)) && parseInt(window.QueryString.c) > 0 && parseInt(window.QueryString.c) < 4) {
      window.condition = parseInt(window.QueryString.c);
    } else {
      window.condition = 1; // condition defaults to 1
    }
    // participant number must be numeric
    if(window.QueryString.p !== undefined && !isNaN(parseInt(window.QueryString.p))) {
      window.participant = parseInt(window.QueryString.p);
    } else {
      window.participant = 0; // participant defaults to 0
    }    

    // switch according to condition, set settings.condition_likes
    window.settings.condition_likes = settings.condition_1_likes;

    // overwrite others according to condition
    // ...
  }

  // The variable QueryString contains the url parameters, i.e. condition no. and participant no.
  // via http://stackoverflow.com/a/979995
  window.QueryString = function () {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
        // If first entry with this name
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = pair[1];
        // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
        var arr = [ query_string[pair[0]], pair[1] ];
        query_string[pair[0]] = arr;
        // If third or later entry with this name
      } else {
        query_string[pair[0]].push(pair[1]);
      }
    } 
      return query_string;
  } ();


  // Function to check letters and numbers
  // via http://www.w3resource.com/javascript/form/letters-numbers-field.php
  function not_alphanumeric(inputtxt) {
    var letterNumber = /^[0-9a-zA-Z]+$/;
    if(inputtxt.match(letterNumber)) {
        return false;
      } else { 
        return true; 
      }
  }


  // Function to add extra zeros infront of numbers (used for the countdown)
  // via http://stackoverflow.com/a/6466243
  function pad (str, max) {
    return str.length < max ? pad("0" + str, max) : str;
  }


  // Simple Countdown
  // via http://davidwalsh.name/jquery-countdown-plugin
  jQuery.fn.countDown = function(settings,to) {
    settings = jQuery.extend({
      startFontSize: "12px",
      endFontSize: "12px",
      duration: 1000,
      startNumber: 10,
      endNumber: 0,
      callBack: function() { }
    }, settings);
    return this.each(function() {
      if(!to && to != settings.endNumber) { to = settings.startNumber; }  
      jQuery(this).children('.secs').text(to);
      jQuery(this).animate({
        fontSize: settings.endFontSize
      }, settings.duration, "", function() {
        if(to > settings.endNumber + 1) {
          jQuery(this).children('.secs').text(to - 1);
          jQuery(this).countDown(settings, to - 1);
          var minutes = Math.floor(to / 60);
          var seconds = to - minutes * 60;
          jQuery(this).children('.cntr').text(pad(minutes.toString(),2) + ':' + pad(seconds.toString(),2));
        }
        else {
          settings.callBack(this);
        }
      });
    });
  };

  // Prevent that participants accidentally exit the experiment by disabling F5 and backspace keys
  shortcut.add("f5",function() {});  
  $(window).bind('beforeunload', function(){
    return 'Are you sure you want to quit the experiment completely?';
  });   

  // Set Settings, get Participant No. and Condition No.
  set_settings();
  get_params();

  // Start with the intro slide
  init_intro();

});