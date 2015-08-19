	
	/* 
	 * Ready? Set. Go!
	 */
			
	$(document).ready(function() {
		
		enableSocialShare();
		enableAutoCompleteSearch();
		siteRating.init();
		//realtimeNews.init();
		//pollInsights.init();
		
		if ($('.products').length) {
			mediaTable();
		}
		
		$('.products tbody tr').click(function(e) {
			href = $(this).find('a:first').attr('href');
			document.location = href;
			e.preventDefault();
		});

	});
	
	/* 
	 * Window load
	 */
	
	$(window).load(function() {
	
		if (!$.support.placeholder) activatePlaceholders();
		homeGrid.init();
	
		// only use resize event for browser other than <ie9
		// resize event is fired when any element's size changes in <ie9
		if (!$('html').hasClass('lt-ie9')) {
			var didResize = false;
			var timer;
	
		    $(window).resize(function() {
		        if (!didResize) {
		            timer = setInterval(function() {
		                if (didResize) {
		                    didResize = false;
		                    clearTimeout(timer);
		                    homeGrid.init();
		                }
		            }, 500);
		        }
		        didResize = true;
		    });
		}

	});

	
	/*
	 * Poll the Insights database for new news
	 */
	
	var pollInsights = {};
	
	(function(context) {
	
		var pollDelay = 60000;
	
		context.init = function() {
		
			context.poll();
			
			$('#new-notification').on('click', function(e) {
				location.reload();
				e.preventDefault();
			});
			
		};
	
		context.poll = function() {
	
			$.ajax({
				type: 'GET',
				url: 'http://ingmarketsde/services/insights', 
				data: { 'filtertime' : context.getFilterTime },
				dataType: 'json',
				async: false,
				success: function(data) {
					$('#new-notification').addClass('show').find(' .day').html(data);
				}
			}).complete(function() {
				setTimeout(context.poll, pollDelay);
			});
		
		};
		
		context.getFilterTime = function() {
			
			var today = new Date();
			var YY = today.getFullYear();
			var MM = context.makeTwoDigit(today.getMonth()+1);
			var DD = context.makeTwoDigit(today.getDate());
			var hh = context.makeTwoDigit(today.getHours());
			var mm = context.makeTwoDigit(today.getMinutes());
			var ss = context.makeTwoDigit(today.getSeconds());
			
			return (YY+MM+DD+hh+mm+ss);
			
		};
		
		context.makeTwoDigit = function(n) {
			return ("0" + n).slice(-2);
		};
	
	})(pollInsights);
	
	/*
	 * Make the homepage grid pretty!
	 */
	
	var homeGrid = {};
	(function(context) {
	
		context.init = function() {
		
			if (matchMedia('only screen and (min-width: 30em)').matches) {
				$('html').removeClass('mobile');
				context.createRows();
			} else {
				$('html').addClass('mobile');
				context.reset();
			}
		
		};
		
		context.reset = function() {
		
			// reset height of stretched element
			$('.insights .item').find('.wrapper, header, p').css({ height: 'auto' });
		
		};
		
		/*
		 * Calculate which children belong to a row
		 */
		
		context.calculateRows = function(container, children) {
		
			var arr = [];
	
			$(container).each(function() {

				var $container = $(this);
				var $children = $container.find(children);
				var containerWidth = $container.outerWidth();
				var remainingWidth = containerWidth;
				var counter = 0;
				var lastItem = 0;
				
				// Loop through all children
				$children.each(function(i) {
				
					$child = $(this);
					
					// subtract width of current child from  total available width
					remainingWidth = remainingWidth - $child.outerWidth();
	
					// new row found
					// Remaining width will not always be 0 when using a % based grid
					// That's why we use 5 as a buffer
					if (remainingWidth <= 5) {
					
						// group all row chilren when there is more than 1
						group = $children.slice(i-counter, i+1);
						// add this group to the return value
						if (group.length > 1) { arr.push(group); }
						
						// reset remaining width and counters
						remainingWidth = containerWidth;
						lastItem = i+1;
						counter = 0;
						
					} else {
					
						// proceed until the remaining width is reached
						counter++;
						
					}
				});
				
				// Not every row is fully filled with items
				// Add remaining items to the array
				if ($children.length > lastItem) {
					arr.push($children.slice(lastItem, $children.length));
				}
				
			});
			
			return arr;
		
		};
		
		/*
		 * Create the rows
		 */
		
		context.createRows = function() {
			
			// hide the realtime ticker so the <ul> height does not influence the row height
			$('.insights .item.realtime ul').hide();
	
			// calculate which items belong to a row
			var items = context.calculateRows('.insights .day', '.item');
			
			$.each(items, function() {
				// keep in this order!
				// because p and header are children of .wrapper
				$(this).find('p').equalHeights();
				$(this).find('header').equalHeights();
				// the .wrapper should be the last item to be calculated
				$(this).find('.wrapper').equalHeights();
			});
			
			// TO DO: Make up someting clever for these sections
			// Removed it from this function
			$('.day.before .item .wrapper').equalHeights();
			
			// show the realtime ticker
			$('.insights .item.realtime ul').show();
		
		};
	
	})(homeGrid);
	
    /*
     * Poll the news
     */
     
	var realtimeNews = {};
	
	(function(context) {
	
		var pollDelay = 2000;
	
		context.init = function() {
		
			context.poll();
			
		};
	
		context.getFilterTime = function() {
			
			var today = new Date();
			var YY = today.getFullYear();
			var MM = context.makeTwoDigit(today.getMonth()+1);
			var DD = context.makeTwoDigit(today.getDate());
			var hh = context.makeTwoDigit(today.getHours());
			var mm = context.makeTwoDigit(today.getMinutes());
			var ss = context.makeTwoDigit(today.getSeconds());
			
			return (YY+MM+DD+hh+mm+ss);
			
		};
	
		context.makeTwoDigit = function(n) {
			return ("0" + n).slice(-2);
		};
		
		context.poll = function() {

			$.ajax({
				type: 'GET',
				url: 'http://ingmarketsde/services/realtime', 
				data: { 'filtertime' : context.getFilterTime },
				dataType: 'json',
				async: false,
				success: function(data) {
					var li;
					$.each(data, function(index, value) {
						li = tpl;
						li = li.replace('{dt}', value.NewsDateDisplay);
						li = li.replace('{href}', value.Url);
						li = li.replace('{title}', value.Title);
					});
					
					$('#realtime ul').prepend(li);
				}
			}).complete(function() {
				setTimeout(context.poll, pollDelay);
			});
		
		};
	
	})(realtimeNews);
	
    /*
     * Enable social share
     */
	
	function enableSocialShare() {
		$('.social-share').show().find('.button').hover(function() {
			$(this).addClass('hover');
		}, function() {
			$(this).removeClass('hover');
		});
	}
	
	/*
	 * Autocomplete search input
	 */
	
	function enableAutoCompleteSearch() {
	
		var $autoCompleteInput = $('#searchQuery');
		
		$autoCompleteInput.autocomplete({
			source: '/ajax/search.json',
	        position: {
	            my: 'right top',
	            at: 'right bottom',
	            offset: '0 5'
	        },
	        open: function() {
	        	$list = $('ul.ui-autocomplete li');
	        
	            $list.find('a').each(function () {
	                suggestItemLowercase = $(this).text().toLowerCase();
	                suggestItem = $(this).text();
	                searchboxInput = $autoCompleteInput.val().toLowerCase();
	
					// replace text when no results are found
	                if (suggestItemLowercase == 'geen resultaten') {
	                    $(this).parent().prepend('<a href="#"><em>Keine Resultate</em></a>');
	                    $(this).remove();
	                }
					
					// highlight the search query in the search results
	                if (suggestItemLowercase.indexOf(searchboxInput) != -1) {
	                    matchBegin = suggestItemLowercase.indexOf(searchboxInput);
	                    searchLength = searchboxInput.length;
	                    highlight = suggestItem.substring(matchBegin, matchBegin + searchLength);
	                    searchResultHtml = $(this).html();
	                    searchResultHtml = searchResultHtml.replace(highlight, '<strong>' + highlight + '</strong>');
	                    $(this).html(searchResultHtml);
	                }
	            });
	            
	            if ($list.length >= 6) {
	                $list.filter(':last-child').removeClass('ui-menu-item').addClass('view-all');
	            }
	            
	            // append custom html at the bottom of the search results
	        	$('ul.ui-autocomplete').append('<li class="more-info"><a href="http://INGMarkets.com">' + txtTranslations.SearchIngMarketsCom + ' <span>INGMarkets.com</span></a></li>');
	        },
	        select: function(e, ui) {
	            window.location = ui.item.url;
	            return false;
	        }
		}).data('autocomplete')._renderItem = function (ul, item) {
	        var tempItem = '<em>' + item.label + '</em>';
	        if (item.wkn != null && item.wkn != '') {
	            tempItem += '<span class="wkn">' + item.wkn + '</span>';
	        }
	        if (item.isin != null && item.isin != '') {
	            tempItem += '<span class="isin' + (item.wkn == null || item.wkn == '' ? ' no-wkn' : '') + '">' + item.isin + '</span>';
	        }
	        return $('<li></li>')
				.data('item.autocomplete', item)
				.append('<a href="' + item.url + '"' + (item.type === 1 ? 'class="insights"' : '') + '>' + tempItem + '</a>')
				.appendTo(ul);
		};
	}
	
    /*
     * Show/hide mobile navigation menu
     */
    
	(function(win){
		var doc = win.document;
		if (doc.querySelectorAll && doc.querySelectorAll && doc.addEventListener) {
			var toggler = doc.querySelectorAll('.toggle-menu, .toggle-search');
			var menu = doc.querySelector('.nav-top');
			menu.style.height = '0px';
			for(var i = 0; i < toggler.length; i++) {
				toggler[i].addEventListener('click', function(e) {
					if (menu.style.height == '0px') {
						menu.style.height = 'auto';
						if (menu.clientHeight != 0) {
							menu.style.height = menu.clientHeight+'px';
							if (this.className == 'toggle-search') {
								doc.querySelector('input[type="search"]').focus();
							}
						}
					} else {
						menu.style.height = '0px';
					}
					e.preventDefault();
				});
			}
		}
	})(this);
	
	/*
	 * Site rating
	 */
	
	var siteRating = {};
	
	(function(context) {
	
		context.init = function() {

			$(document).on('click', '.site-rating-list a', function(e) {		
				var index = $(this).parent().index();
	
				$('.site-rating-list').each(function() {
					$(this).find('li a.active').removeClass('active');
					$(this).find('li:eq('+index+') a').addClass('active');
				});
				
		        e.preventDefault();
			});
			
			$('.site-rating .site-rating-list a').on('click', function(e) {
			
				$.colorbox({
		            html: $('.site-rating-popup').html(),
		            opacity: 0.5,
		            onLoad: function () {
		                $("#cboxClose").hide();
		            },
		            onComplete: function () {
		                $("#cboxClose").fadeIn(100);
		            }
		        });
		        
		        e.preventDefault();
			});
			
			$(document).on('click', '.site-rating-popup-holder .submit', function(e) {
				context.validate();
				e.preventDefault();
			});

		};
		
		context.validate = function() {
		
			var error = [];
		
			$rateEmail = $("#cboxLoadedContent").find('#rating-email');
			
			if (!context.validateEmail( $rateEmail.val() )) {
				$rateEmail.addClass('error');
				error.push($rateEmail);
			} else {
				$rateEmail.removeClass('error');	
			}
			
			if (error.length) {
				return false;
			} else {
				context.submit();
			}

		};
		
		context.submit = function() {

		    $("#cboxLoadedContent").find('input[type=submit]').attr('disabled', true);
		    var rateDescription = $("#cboxLoadedContent").find('#rating-description').val();
		    var rateEmail = $("#cboxLoadedContent").find('#rating-email').val();
		    var rating = $("#cboxLoadedContent").find('.site-rating-list').find('a.active').data('rate');
		    var screenWidth = screen.width;
		    var screenHeight = screen.height;
		    
		    $.ajax({
		        url: '/ajax/rate.html',
		        data: 'rating=' + rating + '&email=' + rateEmail + '&description=' + rateDescription+ '&screenWidth=' + screenWidth + '&screenHeight=' + screenHeight,
		        type: 'GET',
		        success: function () {
		            tempData = '<h4>Danke</h4><p>Vielen dank f&uuml;r Ihre Bewertung.</p>';
		            $("#cboxLoadedContent").find('.site-rating-popup-holder').html(tempData);
		            $.colorbox.resize();
		            $('.site-rating-list a.active').removeClass('active');
		        }
		    });

		};
		
		context.validateEmail = function(email) {
		
			var re = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
			return re.test(email);
		
		};
	
	})(siteRating);
	
	/*
	 * Responsive tables
	 */
	 
	function mediaTable() {
		 
		$('.products').each(function() {
			var $table = $(this);
			$table.addClass('enhanced');
			
			$table.find('thead th').each(function(i) {
				var th = $(this),
				id = th.attr('id'), 
				classes = th.attr('class');  // essential, optional (or other content identifiers)
			
				// assign an ID to each header, if none is in the markup
				if (!id) {
					id = ('col-') + i;
					th.attr('id', id);
				};      
			
				// loop through each row to assign a "headers" attribute and any classes (essential, optional) to the matching cell
				// the "headers" attribute value = the header's ID
				$table.find('tbody tr').each(function() {
					var cell = $(this).find('th, td').eq(i);                        
					cell.attr('headers', id);
					if (classes) { cell.addClass(classes); }
				});
			});
		});
			
	}
	
	/*
	 * jQuery plugins/methods
	 */
		
    $.fn.equalHeights = function() {
    
        var currentTallest = 0;
        var $elem = $(this);
		var $singleElem;

        $elem.each(function() {
            $singleElem = $(this);
            if ($singleElem.outerHeight() > currentTallest) {
            	currentTallest = $singleElem.outerHeight();
            }
        });

        $elem.css({'height': currentTallest});
        
        return this;
        
    };
    
	/*
	 * Detect placeholder attribute support
	 */
	
	$.support.placeholder = (function(){
	    var i = document.createElement('input');
	    return 'placeholder' in i;
	})();
	
	function activatePlaceholders() {

		var inputs = $('input').filter('[type=text],[type=search],[type=url],[type=email]');

		inputs
			.each(function(i) {
				var $t = $(this);
				$t.val($t.attr("placeholder"));
			})
			.focus(function() {
				var $t = $(this);
				if($t.val() === $t.attr("placeholder")) $t.val('');
			})
			.blur(function() {
				var $t = $(this);
				if($t.val() === '') {
					$t.val($t.attr("placeholder"));
				} 
			});

	}