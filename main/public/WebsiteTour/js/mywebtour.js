$(function() {
				/*
				the json config obj.
				name: the class given to the element where you want the tooltip to appear
				bgcolor: the background color of the tooltip
				color: the color of the tooltip text
				text: the text inside the tooltip
				time: if automatic tour, then this is the time in ms for this step
				position: the position of the tip. Possible values are
					TL	top left
					TR  top right
					BL  bottom left
					BR  bottom right
					LT  left top
					LB  left bottom
					RT  right top
					RB  right bottom
					T   top
					R   right
					B   bottom
					L   left
				 */
				var config = [
					{
						"name" 		: "tour_1",
						"bgcolor"	: "black",
						"color"		: "white",
						"position"	: "TL",
						"text"		: "Recherche de fiches d'utilisateurs, des aliments, des catégories, des étiquettes ou par titre ou le contenu",
						"time" 		: 5000
					},
					{
						"name" 		: "tour_2",
						"bgcolor"	: "black",
						"color"		: "white",
						"text"		: "recherche dans différents endroits, tapez pour rechercher votre plac ou faites glisser la carte sur votre position préférée",
						"position"	: "TL",
						"time" 		: 5000
					},
					{
						"name" 		: "tour_3",
						"bgcolor"	: "black",
						"color"		: "white",
						"text"		: "contrôler la date à partir de l'endroit où récupérer votre contenu, faites glisser et basculer vers votre date",
						"position"	: "TL",
						"time" 		: 5000
					},
					{
						"name" 		: "tour_4",
						"bgcolor"	: "black",
						"color"		: "white",
						"text"		: "réglez le zoom carte pour rechercher du local à l'hyper locale",
						"position"	: "TL",
						"time" 		: 5000
					},
					{
						"name" 		: "tour_5",
						"bgcolor"	: "black",
						"color"		: "white",
						"text"		: "You can indicate the direction of the tooltip arrow for each tour point",
						"position"	: "TL",
						"time" 		: 5000
					},
					{
						"name" 		: "tour_6",
						"bgcolor"	: "#111199",
						"color"		: "white",
						"text"		: "Mark important tour points in a different color",
						"position"	: "BL",
						"time" 		: 5000
					},
					{
						"name" 		: "tour_7",
						"bgcolor"	: "black",
						"color"		: "white",
						"text"		: "Automatically scrolls to the right place of the website",
						"position"	: "TL",
						"time" 		: 5000
					}

				],
				//define if steps should change automatically
				autoplay	= false,
				//timeout for the step
				showtime,
				//current step of the tour
				step		= 0,
				//total number of steps
				total_steps	= config.length;
					
				//show the tour controls
				showControls();
				
				/*
				we can restart or stop the tour,
				and also navigate through the steps
				 */
				$('#activatetour').live('click',startTour);
				$('#canceltour').live('click',endTour);
				$('#endtour').live('click',endTour);
				$('#restarttour').live('click',restartTour);
				$('#nextstep').live('click',nextStep);
				$('#prevstep').live('click',prevStep);
				
				function startTour(){
					$('#activatetour').remove();
					$('#endtour,#restarttour').show();
					if(!autoplay && total_steps > 1)
						$('#nextstep').show();
					showOverlay();
					nextStep();
				}
				
				function nextStep(){
					if(!autoplay){
						if(step > 0)
							$('#prevstep').show();
						else
							$('#prevstep').hide();
						if(step == total_steps-1)
							$('#nextstep').hide();
						else
							$('#nextstep').show();	
					}	
					if(step >= total_steps){
						//if last step then end tour
						endTour();
						return false;
					}
					++step;
					showTooltip();
				}
				
				function prevStep(){
					if(!autoplay){
						if(step > 2)
							$('#prevstep').show();
						else
							$('#prevstep').hide();
						if(step == total_steps)
							$('#nextstep').show();
					}		
					if(step <= 1)
						return false;
					--step;
					showTooltip();
				}
				
				function endTour(){
					step = 0;
					if(autoplay) clearTimeout(showtime);
					removeTooltip();
					hideControls();
					hideOverlay();
				}
				
				function restartTour(){
					step = 0;
					if(autoplay) clearTimeout(showtime);
					nextStep();
				}
				
				function showTooltip(){
					//remove current tooltip
					removeTooltip();
					
					var step_config		= config[step-1];
					var $elem			= $('.' + step_config.name);
					
					if(autoplay)
						showtime	= setTimeout(nextStep,step_config.time);
					
					var bgcolor 		= step_config.bgcolor;
					var color	 		= step_config.color;
					
					var $tooltip		= $('<div>',{
						id			: 'tour_tooltip',
						className 	: 'tooltip',
						html		: '<p>'+step_config.text+'</p><span class="tooltip_arrow"></span>'
					}).css({
						'display'			: 'none',
						'background-color'	: bgcolor,
						'color'				: color,
						'position' 			: 'absolute',
						'z-index'			: '11111111',
						'width'				: '280px',
						'text-align'		: 'justify',
						'padding'			: '12px',
						'line-height'		: '24px'
					});
					
					//position the tooltip correctly:
					
					//the css properties the tooltip should have
					var properties		= {};
					
					var tip_position 	= step_config.position;
					
					//append the tooltip but hide it
					$('BODY').prepend($tooltip);
					
					//get some info of the element
					var e_w				= $elem.outerWidth();
					var e_h				= $elem.outerHeight();
					var e_l				= $elem.offset().left;
					var e_t				= $elem.offset().top;
					
					
					switch(tip_position){
						case 'TL'	:
							properties = {
								'left'	: e_l,
								'top'	: e_t + e_h + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_TL');
							break;
						case 'TR'	:
							properties = {
								'left'	: e_l + e_w - $tooltip.width() + 'px',
								'top'	: e_t + e_h + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_TR');
							break;
						case 'BL'	:
							properties = {
								'left'	: e_l + 'px',
								'top'	: e_t - $tooltip.height() + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_BL');
							break;
						case 'BR'	:
							properties = {
								'left'	: e_l + e_w - $tooltip.width() + 'px',
								'top'	: e_t - $tooltip.height() + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_BR');
							break;
						case 'LT'	:
							properties = {
								'left'	: e_l + e_w + 'px',
								'top'	: e_t + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_LT');
							break;
						case 'LB'	:
							properties = {
								'left'	: e_l + e_w + 'px',
								'top'	: e_t + e_h - $tooltip.height() + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_LB');
							break;
						case 'RT'	:
							properties = {
								'left'	: e_l - $tooltip.width() + 'px',
								'top'	: e_t + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_RT');
							break;
						case 'RB'	:
							properties = {
								'left'	: e_l - $tooltip.width() + 'px',
								'top'	: e_t + e_h - $tooltip.height() + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_RB');
							break;
						case 'T'	:
							properties = {
								'left'	: e_l + e_w/2 - $tooltip.width()/2 + 'px',
								'top'	: e_t + e_h + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_T');
							break;
						case 'R'	:
							properties = {
								'left'	: e_l - $tooltip.width() + 'px',
								'top'	: e_t + e_h/2 - $tooltip.height()/2 + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_R');
							break;
						case 'B'	:
							properties = {
								'left'	: e_l + e_w/2 - $tooltip.width()/2 + 'px',
								'top'	: e_t - $tooltip.height() + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_B');
							break;
						case 'L'	:
							properties = {
								'left'	: e_l + e_w  + 'px',
								'top'	: e_t + e_h/2 - $tooltip.height()/2 + 'px'
							};
							$tooltip.find('span.tooltip_arrow').addClass('tooltip_arrow_L');
							break;
					}
					
					
					/*
					if the element is not in the viewport
					we scroll to it before displaying the tooltip
					 */
					var w_t	= $(window).scrollTop();
					var w_b = $(window).scrollTop() + $(window).height();
					//get the boundaries of the element + tooltip
					var b_t = parseFloat(properties.top,10);
					
					if(e_t < b_t)
						b_t = e_t;
					
					var b_b = parseFloat(properties.top,10) + $tooltip.height();
					if((e_t + e_h) > b_b)
						b_b = e_t + e_h;
						
					
					if((b_t < w_t || b_t > w_b) || (b_b < w_t || b_b > w_b)){
						$('html, body').stop()
						.animate({scrollTop: b_t}, 500, 'easeInOutExpo', function(){
							//need to reset the timeout because of the animation delay
							if(autoplay){
								clearTimeout(showtime);
								showtime = setTimeout(nextStep,step_config.time);
							}
							//show the new tooltip
							$tooltip.css(properties).show();
						});
					}
					else
					//show the new tooltip
						$tooltip.css(properties).show();
				}
				
				function removeTooltip(){
					$('#tour_tooltip').remove();
				}
				
				function showControls(){
					/*
					we can restart or stop the tour,
					and also navigate through the steps
					 */
					var $tourcontrols  = '<div id="tourcontrols" class="tourcontrols">';
					$tourcontrols += '<p>Première fois ici?</p>';
					$tourcontrols += '<span class="button" id="activatetour">Commencer la visite</span>';
						if(!autoplay){
							$tourcontrols += '<div class="nav"><span class="button" id="prevstep" style="display:none;">< précédent</span>';
							$tourcontrols += '<span class="button" id="nextstep" style="display:none;">suivant ></span></div>';
						}
						$tourcontrols += '<a id="restarttour" style="display:none;">Redémarrez la tournée</span>';
						$tourcontrols += '<a id="endtour" style="display:none;">Fin de la tournée</a>';
						$tourcontrols += '<span class="close" id="canceltour"></span>';
					$tourcontrols += '</div>';
					
					$('BODY').prepend($tourcontrols);
					$('#tourcontrols').animate({'right':'1px'},500);
				}
				
				function hideControls(){
					$('#tourcontrols').remove();
				}
				
				function showOverlay(){
					var $overlay	= '<div id="tour_overlay" class="overlay"></div>';
					$('BODY').prepend($overlay);
				}
				
				function hideOverlay(){
					$('#tour_overlay').remove();
				}
				
			});