	/*INIT*/
		
		//var geolocalized = 0;
		//var infowindow = null;
		var bounds = new Array();
		var markers = [];
		var infoArray = [];
		var markerLocation = null;
		var yakcatArray = [];
		var placeArray = [];
		var hashtag = [];
		var hashtagTmp = [];
		var mediumImage;
		var thumbImage;
		var dateLastCheck;
		//var markerClustererOptions = {gridSize:30,maxZoom: 17,styles: [{height: 28,width: 28,url: "/images/markers/m1.png"},{height: 38,width: 38,url: "/images/markers/m2.png"},{height: 55,width:55,url: "/images/markers/m3.png"},{height: 85,width: 85,url: "/images/markers/m4.png"},{height: 85,width: 85,url: "/images/markers/m5.png"}]};
		//var markerCluster = null;
		//var pinkParksStyles = [{featureType: "Water",stylers: [{ hue: "#006eff" },{ saturation:1 },{ lightness: -13 }]},{featureType: "Road",stylers: [{ hue: "#ff0000" },{ saturation: -100 },{ lightness: 31 }]},{featureType: "Landscape",stylers: [{ hue: "#ff0008" },{saturation: -90 },{ lightness: 66 }]}];
		//var pinkParksStyles =[{}];
		var skip = 0;
		var zoom = 1;
		var infoContent = '';
		var rule = new RegExp('#([^\\s]*)','g');
		var rule2 = new RegExp('[#]','g');
		var postFlag = 0;
		var listenerHandle = null;
		var filteredInfoArray = [];
		var lastSearchString = null;
		var oldLocation = {lat:0,lng:0};

		var map = new google.maps.Map(document.getElementById('mymap'), {
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				disableDefaultUI: true,
				scrollwheel: true,
				zoom_changed: function(){
					setLocalnessSliderTextMinified(map.getZoom());
				},
				maxZoom: 16,
				minZoom: 11,
				disableDoubleClickZoom: true,
			});
		

		setInterval(function() {
				silentUpdater();			
			}, 10000);

		/*READY FUNCTIONS*/
		$(document).ready(function() {
		//console.log(user);

		//$.post("/api/user/blacklist", {id: '5168263a9a01583001000017', type : 'user'}, function(){});
		//$.post("/api/user/blacklist", {id: '5168263a9a01583001000018', type : 'feed'}, function(){});
		//$.post("/api/user/blacklist", {id: '5168263a9a01583001000019', type : 'info'}, function(){});

		if(gup("post") == 1)
			showPostForm();
			
				
			

		$('#searchBtn').unbind("click").on('click',function(){
					
			filteredInfoArray = [];
			var str = encodeURIComponent($('#searchStr').val());
			//console.log('SEARCH CLICK='+str);
			var placeName = $('#searchPlaceStr').val();
			
			// if(placeName.length >= 2 ){
			// 	console.log('ONSEARCH');
			
			// 	var addressQuery = {"address": placeName ,"region":"fr","language":"fr"};
			// 	var geocoder = new google.maps.Geocoder();
			// 	geocoder.geocode( addressQuery, function(results, status) {						
			// 	if (status == google.maps.GeocoderStatus.OK) {
			// 		var placeGmap = getPlaceFromGmapResult((results[0]));
			// 		var location = JSON.stringify({lat:curPos.x,lng:curPos.y});				
			// 		changeLocation(location);
			
			// 	}else{
			// 		/*var salt = new Date().getTime();
			// 		$('#searchStr').before("<div id='alert"+salt+"' class='control-label'><i class='icon-exclamation-sign'> </i>Adresse invalide</div>");
			// 		setTimeout(function() {
			// 			$("#alert"+salt).fadeOut();
			// 		}, 3000);
			// 		*/
			// 	} 
			// 	});
			// }
			
			var localSearchString = decodeURIComponent(str);
			if(str != 'Quoi ?' && str != ''){
				searchString = str;
				cleanMarkers();
				cleanFeed();
				$.each(infoArray,function(key,val){
					if(val.origin.charAt(0) == "@")
						val.origin = val.origin.substring(1,val.origin.length);
					if(localSearchString.charAt(0) == "@")
						localSearchString = localSearchString.substring(1,str.length);
					if(localSearchString.charAt(0) == "#")
						localSearchString = localSearchString.substring(1,str.length);
					var searchExactStr = new RegExp("(?:^| )(" + localSearchString + ")",'gi');
					
					if(searchExactStr.test(val.title) 
						|| searchExactStr.test(val.content) 
						|| searchExactStr.test(val.yakCatName.join(' ')) 
						|| searchExactStr.test(val.freeTag.join(' ')) 
						|| searchExactStr.test(val.origin) ){
						filteredInfoArray.push(val);
					}
						
				});
				// print Map and Feed from the filtered array
				printMapAndFeed(filteredInfoArray,1);
			}else{ // if the search string is empty
				cleanMarkers();
				cleanFeed();
				searchString = null;
				if(infoArray.length > 0 && str !='') // if the info array is empty we get it from db else we print it.
					printMapAndFeed(infoArray,1);
				else
					getAndPrintInfo();
			}
			
		
			
			if( (lastSearchString == null || lastSearchString != str ) && str.length > 1 ){
				var mapCenter =  map.getCenter();
				var now = new Date();
				var searchDate = now.setTime(now.getTime()+dateFrom*24*60*60*1000);
				
				var trackParams = 	{
					"page":"map",
					"location":{
						"lat": mapCenter.lat().toString(),
						"lng": mapCenter.lng().toString(),
					},
					"dateFrom": searchDate.toString(),
					"type": yakType.toString(),
					"str": searchString
				};

				$.getJSON(conf.trackurl+'/track/user/'+user._id+'/'+'5'+'/'+encodeURIComponent(JSON.stringify(trackParams))); 
			}
			var Cookiedate = new Date();
			var timeRange = 3*60*60*1000;
			Cookiedate.setTime(Cookiedate.getTime() + (timeRange));
			
			$.cookie("searchString",searchString,{ expires: Cookiedate, path : '/' });
			lastSearchString = str;
			$('#searchStr').removeClass('searching');
		});


		if(typeof($(".ui-slider-handle").position()) != 'undefined')
		{
			var currElposition = $(".ui-slider-handle").position();	
			//console.log(currElposition);
			$("#blackBox").css("left", (currElposition.left - 78) + "px");
		}

			zoom = rangeFromZ();
			
			$('#arroundme').unbind("click").on('click',function(){

				if(user.location){
					var latLng = new google.maps.LatLng(user.location['lat'],user.location['lng']);
					curPos.name = user.formatted_address;
					curPos.x =  user.location.lat;
					curPos.y =  user.location.lng;
					curPos.z = user.addressZoom;
					$("#searchPlaceStr").val(curPos.name);
					setLocalnessSliderTextMinified(curPos.z);
					$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000, path : '/' });
					changeRange();
					moveMap();
					//map.setCenter(latLng);
				}else{
					window.location = '/settings/profile';
				}
			});


			/*map tools*/
			$('#zoomplus').unbind("click").on('click',function () {	
				
				if(curPos.z == 120)
					return
				zoom = map.getZoom();
				zoom++;
				map.setZoom(zoom);	
				changeZoom();
				if(curPos.z == 90 || curPos.z == 110)
					$('#zoomplus').trigger('click');

			});

			$('#zoomminus').unbind("click").on('click',function () {
				if(curPos.z == 70)
					return
				zoom = map.getZoom();
				zoom--;
				map.setZoom(zoom);
				changeZoom();
				if(curPos.z == 90 || curPos.z == 110)
					$('#zoomminus').trigger('click');
				
			});

			
			/*control opener*/
			$('#boxOpener').unbind("click").on('click',function(event){
				event.preventDefault();
				if($(this).hasClass('opened')){
					$(this).removeClass('opened').addClass('closed');
					$('#newsfeedMenu').animate({height:'0px',opacity:0},200,function(){drawNewsFeed();});	
				}else{
					$(this).removeClass('closed').addClass('opened');
					//$('#newsfeedMenu').animate({height:'140px',opacity:1},200,function(){drawNewsFeed();});
				}
			});

			/*news nav*/
			$('#newsNav li').unbind("click").on('click',function(event){
				event.preventDefault();
				
				if(!$(this).hasClass('active')){
					$('#newsNav li').removeClass('active');	
					$(this).addClass('active');
					var contentToLoad = $(this).attr('contentToLoad');
					
					$('.tabContent').hide();
					$('#'+contentToLoad).fadeIn();	
					
					if(contentToLoad == "newspostContent"){
						// INIT MARKERLOCATION
						
						listenerHandle = google.maps.event.addListener(map, 'click', function(event) {
							getformattedAddress(event.latLng);
							placeMarker(event.latLng,markerLocation);
							google.maps.event.addListener(markerLocation, 'dragend', function() {
								cleanMarkers();
								var position = markerLocation.getPosition();
								$('#latitude').val(position.lat());	
								$('#longitude').val(position.lng());	
								
								getformattedAddress(position);
								
							});		
						});
					}
					else{
						google.maps.event.removeListener(listenerHandle);
						markerLocation.setVisible(false);
					}
				}
					drawNewsFeed();
			});
				
			
			
			
			
			// init news feed
			drawNewsFeed();

			$('#newsfeedContent').mCustomScrollbar({mouseWheel:true,callbacks:{onTotalScroll:printArrayFeedItem},scrollButtons:{enable:true,scrollType:"continuous",},advanced:{autoExpandHorizontalScroll:true,updateOnContentResize: true,updateOnBrowserResize:true}});
			//$('#newspostContent').mCustomScrollbar({mouseWheel:true,scrollButtons:{enable:true,scrollType:"continuous",},advanced:{autoExpandHorizontalScroll:true,updateOnContentResize: true,updateOnBrowserResize:true}});
			$(window).resize(function(){
				drawNewsFeed();
				bounds = getMyBounds();
				manageSearchBox();
			});
			
			
			$('#newsfeed').unbind("click").on('click',".mapHighlighter", function (e) {	
				if(e.target.className != 'prevent-default'){
					if($(this).find(".myitem").length == 0)
					{
						getItemDetails(this);
					}
					/*else if(!($.contains(this, e.target)) || $(this).find(".myitem").css("display") == "none")
					{
						//getItemDetails(this);
					}*/
					unhighlightInfo($(this),highlightInfo);	
				}
				
			});

			
			
			/*cookies for navigation*/
			google.maps.event.addDomListener(window, 'load', initialize(curPos.x,curPos.y,curPos.z));
			
			
			
			/*POST EFFECTS*/
			// hashtag creation from title field
				$(".hashtagMaker").keyup(function(event) {
					hashtagTmp = [];
					var inputStrArray = ($('#content').val()+' '+$('#title').val()).split(' ');
					for(i = 0; i< inputStrArray.length;i++){
						if(inputStrArray[i].match(rule)){
							hashtagTmp.push(inputStrArray[i]);
							$('#freetag').val(hashtagTmp.toString().replace(rule2,''));
						}
					}
				});
					
					
					
			$('#picture').live('change', function () {

				if ( window.FileReader ) {
					var fileList = this.files;
					var file = fileList[0];
					var r = new FileReader();
					r.onload = function () {
						var binimage = r.result;
						binimage1 = binimage.replace('data:'+file.type+';base64,', '');
						var imag = "<img class='img-rounded' " + "src='" + 
						"data:"+file.type+";base64," + binimage1 + "' style='width:100px'/>";
						$("#picturePreview").html(imag);
					};
					r.readAsDataURL(file);
				
				}
				
				//r.readAsBinaryString(file);

				

			});

					
					
			markerLocation = new google.maps.Marker({
				visible:false,
				map:map,
				draggable:true,
				icon:'/images/beachflag.png',
				//position:center
			});
			
			$('#yakcat').typeahead({
				minLength : 3,
				source: function (typeahead, query) {
					$.ajax({
							url: "/api/cats",				
							success: function( ajax ) {
								typeahead.process(ajax.data.cats);
							}
						})},
				property: "title",
				onselect: function(obj) { 
					$("label[for='category']").after("<div class='pillItem'><i class='icon-remove icon-pointer'  onclick='yakcatArray.cleanArray(\""+obj._id+"\");$(\"#yakcatInput\").val(JSON.stringify(yakcatArray));$(this).parent().remove();'></i> "+obj.title+"</div>");
					$('#yakcat').val('').focus();
					yakcatArray.push(obj);
					$("#yakcatInput").val(JSON.stringify(yakcatArray));
					
					
				}
			});
			

			// autocomplete Place
			$('#place').typeahead({
				minLength : 3,							
				source: function (typeahead, query) {
					if(query.length >= 3){
						encodeURIComponent(query);
						$("#place").addClass('searching');
						var addressQuery = {"address": query ,"region":"fr","language":"fr"};
						var geocoder = new google.maps.Geocoder();
						geocoder.geocode( addressQuery, function(results, status) {						
						if (status == google.maps.GeocoderStatus.OK) {
							typeahead.process(results);
							$("#place").removeClass('searching');
						} 
						});
					}
				},
				property: "formatted_address",
				onselect: function(obj) { 
					var placeGmap = getPlaceFromGmapResult(obj);
					$('#btn-place-adder').parent().before("<div class='pillItem'><i class='icon-remove icon-pointer'  onclick='placeArray.cleanArrayByLocation(\""+placeGmap.location.lat+","+placeGmap.location.lng+"\");$(\"#placeInput\").val(JSON.stringify(placeArray));$(this).parent().remove();'></i> "+placeGmap.title+"</div>");
					$('#place').val('').focus();
					placeArray.push(placeGmap);
					$("#placeInput").val(JSON.stringify(placeArray));
				}
			});

			
			$('#btn-place-adder').unbind("click").on('click',function(){
				var addressString = $('#place').val();
				if(addressString != "Rechercher..." && addressString != "" && addressString.length > 1){
					var addressQuery = {"address": addressString,"latLng":map.getCenter(),"bounds":map.getBounds()};
					var geocoder = new google.maps.Geocoder();
					geocoder.geocode( addressQuery, function(results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							//map.setCenter(results[0].geometry.location);
							map.panTo(results[0].geometry.location);
							markerLocation.setVisible(true);
							markerLocation.setPosition(results[0].geometry.location);
							placeMarker(results[0].geometry.location,markerLocation);
							var placeGmap = getPlaceFromGmapResult(results[0]);
							placeArray.push(placeGmap);
							$("#placeInput").val(JSON.stringify(placeArray));
							$('#btn-place-adder').parent().before("<div class='pillItem'><i class='icon-remove icon-pointer' onclick='placeArray.cleanArrayByLocation("+results[0].geometry.location.Ya+","+results[0].geometry.location.Za+");$(\"#placeInput\").val(JSON.stringify(placeArray));$(this).parent().remove();'></i> "+results[0].formatted_address+"</div>");
							
						} else {
							var salt = new Date().getTime();
							$('#btn-place-adder').parent().before("<div id='alert"+salt+"' class='control-label'><i class='icon-exclamation-sign'> </i>Adresse invalide ("+status+")</div>");
							setTimeout(function() {
								$("#alert"+salt).fadeOut();
							}, 3000);
							$('#place').select();
						}
					});
				}
				
				
			});

				
			

			$("body").unbind("click").on('click','.tagHashLink',function(event){
				//event.preventDefault();
				searchString = $(this).html();
				
				
				$('#searchStr').val(searchString);
				//searchString = encodeURIComponent(searchString);
				//console.log('HASH');
				getAndPrintInfo();
			});
			$("body").unbind("click").on('click','.userHashLink',function(event){
				event.preventDefault();
				searchString = $(this).html();
				
				$('#searchStr').val(searchString);
				//searchString = encodeURIComponent(searchString);
				//console.log('HASHUSER');
				getAndPrintInfo();
			});
			
				
			manageSearchBox();

			

		});/*END READY*/

		function placeMarker(location,mk) {
			$('#latitude').val(location.lat());	
			$('#longitude').val(location.lng());	
			mk.setVisible(true);
			mk.setPosition(location);
		}

		function moveMap(){
			$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000 ,path:'/'});
			var latLng = new google.maps.LatLng(curPos.x,curPos.y);
			$('#locationChooser').modal('hide');
			if($('#mymap').length > 0){ // only for the map page
				map.panTo(latLng);
				//google.maps.event.addDomListener(window, 'load', initialize(curPos.x,curPos.y,10)); 
			}
			
		}

		

		function changeLocation(location){
			var locationObj = JSON.parse(location);
			if(location != '' && oldLocation.lat != locationObj.lat && oldLocation.lng != locationObj.lng){
				var latLng = new google.maps.LatLng(locationObj.lat,locationObj.lng);
				markerHL.setPosition(new google.maps.LatLng(locationObj.lat,locationObj.lng));
				markerHL.setVisible(true);
				markerHL.setMap(map);
				markerHL.setOptions({icon:"/images/markers/target3.png"});
				setTimeout(function() {
					markerHL.setMap(null);
				}, 3000);
				map.panTo(latLng);
				oldLocation = locationObj;
				curPos.x = locationObj.lat;
				curPos.y = locationObj.lng;
				getAndPrintInfo();
			}
		}
		function manageSearchBox(){
			var width = $(window).width();
			if(width<960){
				$('#boxOpener').removeClass('opened').addClass('closed');
				$('#newsfeedMenu').animate({height:'0px',opacity:0},200,function(){drawNewsFeed();});
			}else{
				$('#boxOpener').removeClass('closed').addClass('opened');
				//$('#newsfeedMenu').animate({height:'140px',opacity:1},200,function(){drawNewsFeed();});
			}


		}
		/* getMyBounds
		* calculate bounds according to screen size and feed position.
		*/
		function getMyBounds(){
			thebounds = map.getBounds();
			/*console.log('ca.f:lat max'+thebounds.ca.f);
			console.log('ca.b: lat min'+thebounds.ca.b);
			console.log('ea.f: lng max'+thebounds.ea.f);
			console.log('ea.b:lng min'+thebounds.ea.b);*/
			var width = $(window).width();
			var height = $(window).height();
			var pos = $("#newsfeedContainer").position();
			
			var theboundsArray = thebounds.toUrlValue().split(','); // lat.bottomLeft, Lng.bottomLeft , Lat.topRight, Lng.topRight

			//var scaleW = (parseFloat(thebounds.ea.f) - parseFloat(thebounds.ea.b)) / width ;
			//var scaleH = (parseFloat(thebounds.ca.f) - parseFloat(thebounds.ca.b)) / height ;
			
			//var scaleW = (parseFloat(thebounds.ca.d) - parseFloat(thebounds.ca.b)) / width ;
			//var scaleH = (parseFloat(thebounds.Z.d) - parseFloat(thebounds.Z.b)) / height ;
			
			//var left = parseFloat(thebounds.ca.b); // thebounds.ea.b
			//var right = parseFloat(thebounds.ca.d); // thebounds.ea.f
			//var top = parseFloat(thebounds.Z.d); // thebounds.ca.f
			//var bottom = parseFloat(thebounds.Z.b); // thebounds.ca.b

			var left = parseFloat(theboundsArray[1]); 
			var right = parseFloat(theboundsArray[3]); 
			var top = parseFloat(theboundsArray[2]);
			var bottom = parseFloat(theboundsArray[0]); 


			var scaleW = (right - left) / width ;
			var scaleH = (top - bottom) / height ;
			

			var feedOffsetW = pos.left * scaleW;
			var feedOffsetH = pos.top * scaleH;
			var borderOffsetW = 15 * scaleW;
			var borderOffsetHTop = 40 * scaleH;
			var borderOffsetHBottom = 15 * scaleH;
			var borderOffsetVRight = 10 * scaleH;
			var borderOffsetVLeft = 10 * scaleH;
			
			if(width>768){
				var myBounds = {
					ca:{
						f: top-borderOffsetHTop,
						b: bottom+borderOffsetHBottom,	
					},
					ea:{
						f: left+borderOffsetVLeft,
						b: right-borderOffsetVRight,
					}
				};
			}else{
				var myBounds = {
					ca:{
						f: top-borderOffsetHTop,
						b: top-feedOffsetH+borderOffsetHBottom,	
					},
					ea:{
						f: right-borderOffsetW,
						b: left+borderOffsetW,
					}
				};
			}
			
			
			return myBounds;
		}

		function drawNewsFeed(){	

			var newsfeedContainerHeight = window.innerHeight-$('#newsfeedContainer').offset().top ;
			var headerYakwalaHeight = $('.headerYakwala').height();
			var footerYakwalaHeight = $('#footer').height();
			var mapHeight = window.innerHeight-headerYakwalaHeight-footerYakwalaHeight;
			$('#newsfeedContainer').css('height',newsfeedContainerHeight+'px');
			var width = $(window).width();
			if(width < 767)
				$('#newsfeedContainer').css('top','200px');
			else{
				$('#newsfeedContainer').css('top','0px');
				$('#mymap').css('top',headerYakwalaHeight+'px');
				$('#mymap').css('height',mapHeight+'px');
			}
			var newsfeedContentHeight = window.innerHeight-$('#newsfeedContent').offset().top-25+'px';
			//console.log('newsfeedContentHeight'+newsfeedContentHeight);
			$('#newsfeedContent').css('height',newsfeedContentHeight);
			//$('#newsfeedContent').mCustomScrollbar("update");
			var newspostContentHeight = window.innerHeight-$('#newspostContent').offset().top-25+'px';
			$('#newspostContent').css('height',newspostContentHeight);

			//$('#newspostContent').mCustomScrollbar("update");
		}
		
		function unhighlightInfo(obj,callback){
			markerHL.setAnimation(null);
			markerHL.setVisible(false);
			
			if (callback && typeof(callback) === "function") {  
				callback(obj);  
			} 
		}
		
		function highlightInfo(obj){
			var id = obj.attr('infoId');
			
			$.each(infoArray,function(key,val){
				
				if(val._id == id){
					// hide all markers
					//hideMarkers(7000);
					
					// clean if a marker is already highlighted
						
					var latLng = new google.maps.LatLng(val.location['lat'],val.location['lng']);
					markerHL.setPosition(latLng);
					markerHL.setVisible(true);
					markerHL.setMap(map);
					markerHL.setAnimation(google.maps.Animation.BOUNCE);
					markerHL.setOptions({icon:"/images/markers/new/type"+val.yakType+".png"});
					
					//$("ul#newsfeed li.mapHighlighterDetails").fadeOut().html('');
					//$("ul#newsfeed li.mapHighlighterDetails[infoid="+id+"]").fadeIn();
				
					// center map
					//map.setCenter(latLng);
					//map.panTo(latLng);
					
					// clear marker ( and infowindow )
					setTimeout(function() {
						
						//markerHL.setAnimation(null);
						//markerHL.setVisible(false);
						markerHL.setMap(null);
						
					}, 2000);
				}
			});
		}

		function rangeFromZ(){
			return Math.floor((curPos.z)/10+4);
		}
		function zFromRange(){
			return Math.floor((zoom-4)*10);
		}

		function changeRange(){
			zoom = rangeFromZ();
			map.setZoom(zoom);
			$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000, path : '/' });

		};
		function changeZoom(){
			curPos.z  = zFromRange();
			setLocalnessSliderTextMinified(curPos.z);	
			$("#rangeSelector").val(curPos.z).slider('value',curPos.z);
			$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000, path : '/' });
		};

		function initialize(x,y,z){
			// set user cookies
			var center = new google.maps.LatLng(x,y);
			//infowindow = new google.maps.InfoWindow({content: ".",maxWidth : 300});
			map.setZoom(zoom);
			map.setCenter(center);
			
			//map.setOptions({styles: pinkParksStyles});
			//var markerClustererOptions = {gridSize:30,maxZoom: 17,styles: [{height: 28,width: 28,url: "/images/markers/m1.png"},{height: 38,width: 38,url: "/images/markers/m2.png"},{height: 55,width:55,url: "/images/markers/m3.png"},{height: 85,width: 85,url: "/images/markers/m4.png"},{height: 85,width: 85,url: "/images/markers/m5.png"}]};
			//markerCluster = new MarkerClusterer(map, markers,markerClustererOptions);
			
			markerHL = new google.maps.Marker({position: center,map:map,visible:false});

			//getAndPrintInfo();
			
			google.maps.event.addListenerOnce(map, 'idle', function() {
				cleanMarkers();
				bounds = getMyBounds();
				center = this.getCenter();
				curPos.x = center.lat();
				curPos.y = center.lng();
				zoom = this.getZoom();
				curPos.z = zFromRange();
				$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000, path : '/' });
				getAndPrintInfo();

				$('#postFormRange').val(((-1)*0.0096/1*(curPos.z)+1)); // set value for the post form to define tags geo range
			});
			



			google.maps.event.addListener(map, 'dragend', function() {
				cleanMarkers();
				bounds = getMyBounds();
				center = this.getCenter();
				curPos.x = center.lat();
				curPos.y = center.lng();
				zoom = this.getZoom();
				curPos.z = zFromRange();
				$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000, path : '/' });
				getAndPrintInfo();

				$('#postFormRange').val(((-1)*0.0096/1*(curPos.z)+1)); // set value for the post form to define tags geo range
			});
			
			google.maps.event.addListener(map, 'zoom_changed', function() {
				cleanMarkers();
				bounds = getMyBounds();
				center = this.getCenter();
				curPos.x = center.lat();
				curPos.y = center.lng();
				zoom = this.getZoom();
				curPos.z = zFromRange();
				$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000, path : '/' });
				getAndPrintInfo();
				$('#postFormRange').val(((-1)*0.0096/1*(curPos.z)+1)); // set value for the post form to define tags geo range
			});
			
			
		}
		
		function cleanMarkers(){
		// clean existing markers
			$.each(markers,function(key,val){
					val.setMap(null);
			});
			
			markers = [];
			//markerCluster.clearMarkers();
		}

		
		
		function hideMarkers(ms){
		// hide existing markers for ms milisec
			//markerCluster.clearMarkers();
			$.each(markers,function(key,val){
					val.setVisible(false);
			});
			setInterval(function() {
				$.each(markers,function(key,val){
					val.setVisible(true);
				});
				//markerCluster.addMarkers(markers);
			}, ms);
			
		}

		function numAlertsSearch()
		{
			if(!yakType.inArray("5")){
				var alertsNumberUrl = '';
				bounds = getMyBounds();
				dateLastCheck = new Date(user.alertsLastCheck);
				alertsNumberUrl = '/api/geoalertsNumber/'+bounds.ca.b+'/'+bounds.ea.b+'/'+bounds.ca.f+'/'+bounds.ea.f+'/'+dateFrom+'/'+dateLastCheck.getTime()+'/'+yakType.toString()+'/'+searchString;
				//console.log(alertsNumberUrl);
				$.getJSON(alertsNumberUrl,function(ajax) {
					//console.log(ajax.data.info);
					if(ajax.data.info != '-1' && ajax.data.info != "0")
						$("#alertsNumber").html(ajax.data.info);
					else
						$("#alertsNumber").html('');
				});
			}
			
		}



		function silentUpdater(){
			
			numAlertsSearch();

			bounds = getMyBounds();
			var apiUrl = '';
			var nowts = new Date().getTime();
			if(yakType.inArray("5"))
				apiUrl = '/api/geoalerts/'+bounds.ca.b+'/'+bounds.ea.b+'/'+bounds.ca.f+'/'+bounds.ea.f+'/'+dateFrom+'/'+nowts+'/'+yakType.toString()+'/'+searchString+'/500';
			else	
				apiUrl = '/api/geoinfos/'+bounds.ca.b+'/'+bounds.ea.b+'/'+bounds.ca.f+'/'+bounds.ea.f+'/'+dateFrom+'/'+nowts+'/'+yakType.toString()+'/'+searchString+'/500';
			//console.log('CALL DB '+apiUrl);

			$.getJSON(apiUrl,function(ajax) {
				if(typeof ajax.data == 'undefined')
					return;
				$.each(ajax.data.info, function(key,val) {
					

					var flagExists = 0;
					
					$.each(infoArray,function(key2,val2){
						if(val2._id == val._id){
							flagExists = 1;
						}
					});
					
					if(flagExists == 0){

						printMapItem(val,key,1);
						printFeedItem(val,1,0);	
					
						
						infoArray.push(val);	
					}
				});
			});
		}
		
		function getAndPrintInfo(){
			getHotTags(curPos,dateFrom);
			numAlertsSearch();
		

			infoArray = [];
			bounds = getMyBounds();
			//console.log(curPos.z);
			drawNewsFeed();
			
			cleanMarkers();
			cleanFeed();
			//searchString = encodeURIComponent(searchString);
			
			if(typeof(yakType) == 'undefined' || yakType.length == 0){;
				printEmptyFeedItem();
				return;
			}

			var apiUrl = '';
			if(yakType.inArray("5")){	
				apiUrl = '/api/geoalerts/'+bounds.ca.b+'/'+bounds.ea.b+'/'+bounds.ca.f+'/'+bounds.ea.f+'/'+dateFrom+'/0/'+yakType.toString()+'/'+searchString+'/500';
			}
			else{
				apiUrl = '/api/geoinfos/'+bounds.ca.b+'/'+bounds.ea.b+'/'+bounds.ca.f+'/'+bounds.ea.f+'/'+dateFrom+'/0/'+yakType.toString()+'/'+searchString+'/500';
			}	
				
			//console.log('CALL DB '+apiUrl);	
			$.getJSON(apiUrl,function(ajax) {
				// empty the news feed
				cleanFeed();

				if(typeof(ajax.data.info) == 'undefined' || ajax.data.info.length == 0){

					//$('#newsfeed').html('Aucune info !');
					printEmptyFeedItem();
				}else{
					
					printMapAndFeed(ajax.data.info,0);
				
				}
				//$("abbr.timeago").timeago();
				$('#newsfeedContent').mCustomScrollbar("update");


			});

			
			var geocoder = new google.maps.Geocoder();
			var curLatLng = new google.maps.LatLng(curPos.x, curPos.y);
			geocoder.geocode( {'latLng': curLatLng}, function(results, status) {						
				if (status == google.maps.GeocoderStatus.OK) {
					var placeGmap = getPlaceFromGmapResult((results[0]));
					$("#searchPlaceStr").val(placeGmap.address.city + ", " + placeGmap.address.country);
				}
			});	
		
			// log
			var mapCenter =  map.getCenter();
			var now = new Date();
			var searchDate = now.setTime(now.getTime()+dateFrom*24*60*60*1000);
			var trackParams = 	{
									"page":"map",
									"location":{
										"lat": mapCenter.lat().toString(),
										"lng": mapCenter.lng().toString(),
									},
									"dateFrom": searchDate.toString(),
									"type": yakType.toString(),
									"str": searchString
								};

			$.getJSON(conf.trackurl+'/track/user/'+user._id+'/'+'5'+'/'+encodeURIComponent(JSON.stringify(trackParams)));  

		}

		function printMapAndFeed(data,flagFilter){
			cleanFeed();
			cleanMarkers();



			

			$.each(data, function(key,val) {

				var isUserBL = false;
				var isFeedBL = false;
				var isInfoBL = false;

				if(typeof user.listeNoire.user != 'undefined')
					for (var i = user.listeNoire.user.length - 1; i >= 0; i--) {
						if(val.user == user.listeNoire.user[i]._id)
							isUserBL = true;
					};
				if(typeof user.listeNoire.feed != 'undefined')	
					for (var i = user.listeNoire.feed.length - 1; i >= 0; i--) {
						if(val.feed == user.listeNoire.feed[i]._id)
							isFeedBL = true;
					};

				if(typeof user.listeNoire.info != 'undefined')	
					for (var i = user.listeNoire.info.length - 1; i >= 0; i--) {
						if(val._id == user.listeNoire.info[i]._id)
							isInfoBL = true;
					};


				if(!isUserBL && !isFeedBL && !isInfoBL)
				{
					if(flagFilter!=1)
						infoArray.push(val);						
					printMapItem(val,key,0);
					if(key<10)
						printFeedItem(val,0,0);	
				}
			});
			if(infoArray.length == 0)
				printEmptyFeedItem();
			printLoadingFeedItem();	
			$("abbr.timeago").timeago();
		}

		function printMapItem(item,key,bounce){
			
			var latLng = new google.maps.LatLng(item.location['lat'],item.location['lng']);
			if(item.yakType == "4")
				var icon = new google.maps.MarkerImage("/images/yakwala_sprite.png", new google.maps.Size(40, 50), new google.maps.Point(0, 415));
			else
				var icon = new google.maps.MarkerImage("/images/yakwala_sprite.png", new google.maps.Size(40, 50), new google.maps.Point(28, 415));
			var marker = new google.maps.Marker({position: latLng,icon:icon});
			markers.push(marker);
			marker.setMap(map);	
			google.maps.event.addListener(marker, 'click', function() {
				//cleanMarkers();
				$("#newsfeed li").removeClass('highlighted');
				$("#newsfeed li[infoId=\""+item._id+"\"]").addClass('highlighted');
				if(typeof($(".mapHighlighter[infoId=\""+item._id+"\"]").html()) != 'undefined')
				{

					if($(".mCSB_scrollTools").eq(1).css("display") != "none")
						$('#newsfeedContent').mCustomScrollbar("scrollTo",".mapHighlighter[infoId=\""+item._id+"\"]");
				}
				else{
					printFeedItem(infoArray[key],1,1);
				}
			});	

			if(bounce == 1){
				marker.setAnimation(google.maps.Animation.BOUNCE);
				setTimeout(function() {
					marker.setAnimation(null);
					//markerCluster.addMarker(marker);
				}, 5000);
			}
		}

		function printFeedItem(item,top,scrollTo){

			var dateTmp = new Date(item.pubDate);
			var pubDate = dateTmp.getDate()+'/'+(dateTmp.getMonth()+1)+'/'+dateTmp.getFullYear();
			dateTmp = new Date(item.dateEndPrint);
			var dateTmp2 = new Date(item.dateEndPrint);
			var dateEndPrint = dateTmp2.getDate()+'/'+(dateTmp2.getMonth()+1)+'/'+dateTmp2.getFullYear();

			infoContent = $("<div />");
			infoContent.attr("class", "infowindow mapHighlighter");
			infoContent.attr("infoId", item._id);

			

			if(!(typeof item.thumb === 'undefined') && item.thumb != conf.batchurl && item.thumb != null && item.thumb != '') {
				thumbImage = item.thumb.replace('thumb/','');
				//thumbImage = thumbImage.replace('//','/');
				var thumbImageCode = $("<div />");
				thumbImageCode.attr("class", "thumbImage");
				thumbImageCode.append("<img src=\'"+thumbImage+"\' />");
				//thumbImageCode.append("<img src='http://batch.yakwala.fr/PROD/YAKREP/BACKEND/thumb/d44cf5f99c5ba8c818809a2a19aa390a.jpg' />");
				infoContent.append(thumbImageCode);
			
			}
			var yakTypeImage = $("<div />");
			yakTypeImage.attr("class", "yakTypeImage");
			yakTypeImage.html("<img src='/images/markers/new/type" + item.yakType + ".png' />");
			infoContent.append(yakTypeImage);
			

				

			var itemTitle = $("<div />");
			itemTitle.attr("class", "itemTitle");
			itemTitle.html(item.title.linkify());

			thedate = buildItemDate(item);
			var postedBy = $("<div />");
			postedBy.attr("class", "postedBy");

			var onclickUser = "showUserProfile(this)";
			var inputhidden = "<input type='hidden' value='" + item.user + "' />";
			//console.log(item);
			if(typeof item.feed != 'undefined')
			{
				onclickUser = "showFeedProfile(this);";
				inputhidden = "<input type='hidden' value='" + item.feed + "' />";
			}
				

			if(item.origin.indexOf('@') != 0)
				item.origin ="@"+item.origin;
				
			

			if(item.yakType !=2 )
			{
				postedBy.html("Posté par <a class='prevent-default' onclick='" + onclickUser +"'>"+item.origin+"</a>" + inputhidden + "<span class=\'date\'> - "+thedate+"</span>");
			}
				
			else{
				postedBy.html("Posté par <a class='prevent-default' onclick='" + onclickUser + "'>"+item.origin+"</a>" + inputhidden);
				itemTitle.append(" - <span class=\'dateAgenda\'>"+thedate+"</span>");			
			}
				
			infoContent.append(itemTitle);
			infoContent.append(postedBy);
			
			var thetags = "<div class=\'tags\'>";					

			
			if(item.yakCatName.length > 0)
			{
				for (var i = 0; i < item.yakCatName.length; i++) {
					thetags += '<a class="tagHashLink prevent-default" onclick="setSearchFor(this)">#' + item.yakCatName[i] +'</a> ';	
				}
			}

			

			if (typeof(item.freeTag) != 'undefined') {
					
					for (var i = 0; i < item.freeTag.length; i++) {
						if(item.freeTag[i] != ""){
							thetags += '<a class="tagHashLink prevent-default" onclick="setSearchFor(this)">#' + item.freeTag[i] +'</a> ';	
							if( i < item.freeTag.length -1)
								thetags += ', ';
						}
					}
			}
			thetags += "</div>";

			
			infoContent.append(thetags);


			if(typeof(item.address) != 'undefined' && item.address != 'null' && item.address != ''){
				var theaddress = "<div class=\'infodetail\'>"+item.address+"</div>";
				if(user.login == 'renaud.bessieres' || user.login == 'dany.srour') /// this is debug
					theaddress += "<div class=\'infodetail\'>"+pubDate+" >> "+dateEndPrint+"</div>";
				infoContent.append(theaddress);
			}
				
			/*PRINT ON THE FEED*/
			//$('#newsfeed').append('<li class=\'mapHighlighter\' infoId=\''+item._id+'\'><i class=\'icon-eye-open\' ></i> '+item.title+'</li>')
			if(top==1)
			{
				var li = $("<li />");
				li.attr("class", "mapHighlighterDetails");
				li.attr("infoId", item._id);
				li.append(infoContent);
				$('#newsfeed').prepend(li);
			}
			else
			{
				var li = $("<li />");
				li.attr("class", "mapHighlighterDetails");
				li.attr("infoId", item._id);
				li.append(infoContent);
				$('#newsfeed').append(li);
			}
			
			

			if (scrollTo==1) {  
				//$('#newsfeedContent').mCustomScrollbar("update");
				//$('#newsfeedContent').mCustomScrollbar("scrollTo","ul#newsfeed");

			}  

			//to handle broken images

			
		}

		
		function printLoadingFeedItem(){
			$('.loadingfeeditem').hide();
			if(skip < infoArray.length - 10){
				infoContent = "<div class=\'infowindow loadingfeeditem\'></div>";					
				$('#newsfeed').append('<li class=\'mapHighlighterDetails\'>'+infoContent+'</li>');
			}
		}

		function printEmptyFeedItem(){
			$('.emptyfeeditem').hide();
			if($("#typeContainer .active").length > 0)
				infoContent = "<div class=\'infowindow emptyfeeditem\'>Aucune info !</div>";					
			else
				infoContent = "<div class=\'infowindow emptyfeeditem\'>Il n'y a pas d'info ici !!!</div>";

			$('#newsfeed').append('<li class=\'mapHighlighterDetails\'>'+infoContent+'</li>');
		}

		function printArrayFeedItem(){
			skip = skip + 10;
			var itemArray = infoArray.slice(skip,skip+10);
			$.each(itemArray,function(key,val){
				printFeedItem(val,0,0);
			});
			printLoadingFeedItem();
			//$('#newsfeedContent').mCustomScrollbar("update");
		}
		function closeAllItems()
		{
			$("#newsfeed .icon-remove").trigger('click');
		}
		function getItemDetails(el){
			
			
			closeAllItems();
			var currentItem = $(el);

			var infoid = currentItem.attr("infoid");

			/* PLEASE DO IT LIKE THIS
			$.each(infoArray,function(key,val){
				if(infoid == val._id){
					console.log(val);
				}	
			});*/


			if (currentItem.find(".loadingMore").length > 0 || currentItem.find(".myitem").length > 0)
			{
				currentItem.find(".icon-remove").remove();
				currentItem.prepend("<i class='icon-remove' title='close' onclick='closemyitem(this);'></i>");
				currentItem.find(".myitem").show();
				return;
			}

			currentItem.append('<img src="images/loader_big.gif" class="loadingMore">');
			
			$.each(infoArray,function(key,val){
				if(infoid == val._id){
				
				thumbImage = val.thumb.replace('thumb/','');
				//thumbImage = thumbImage.replace('//','/');
				mediumImage = 	thumbImage.replace('120_90', '512_0');
				

				
				

				var item = createFeedPageItem(val);
				currentItem.find(".loadingMore").remove();
				currentItem.append(item);
				currentItem.prepend("<i class='icon-remove' title='close' rel='" + thumbImage + "' onclick='closemyitem(this);'></i>");
				setshortUrl();
				setLikeSystem('map');

				
				if(val.thumbFlag == 2)
				{
					currentItem.find(".thumbImage").insertAfter(currentItem.find(".tags"));	
					currentItem.find(".thumbImage img").attr("src", mediumImage);
					currentItem.find(".thumbImage img").addClass("mediumSizeThumb");
					//currentItem.addClass("currentDetails");
					//currentItem.removeClass("infowindow");

				}
				else
				{
					//currentItem.find(".thumbImage").remove();
					currentItem.find(".thumbImage img").show();
					//currentItem.find(".thumbImage").insertAfter(currentItem.find(".yakTypeImage"));
					currentItem.find(".infodetail").insertAfter(currentItem.find(".tags"));
					
					$("ul#newsfeed li").removeAttr("style");
					$("ul#newsfeed").removeAttr("style");
				}
				
				
				currentItem.find(".infodetail").insertAfter(currentItem.find(".postedBy"));
				//currentItem.find(".icon-remove").appendTo(currentItem.find(".yakTypeImage"));
				$("ul#newsfeed li").css("width", "100%");
				$("ul#newsfeed").css("width", "100%");
				$("#newsfeed li").removeClass('highlighted');
				currentItem.parent().addClass('highlighted');
				//$('#newsfeedContent').mCustomScrollbar("update");
				$('#newsfeedContent').mCustomScrollbar("scrollTo",".mapHighlighter[infoId=\""+currentItem.parent().attr("infoid")+"\"]");

				var trackParams ={"infoId":infoid,"page": "map"};
				$.getJSON(conf.trackurl+'/track/user/'+user._id+'/'+'6'+'/'+encodeURIComponent(JSON.stringify(trackParams)));  
				}	
			});

			
			
		}

		function closemyitem(el)
		{
			var currentItem = $(el).parent().parent();
			currentItem.find(".thumbImage img").show();
			currentItem.find(".thumbImage img").attr("src", $(el).attr("rel"));
			currentItem.find(".thumbImage").insertBefore(currentItem.find(".yakTypeImage"));
			currentItem.find(".infodetail").insertAfter(currentItem.find(".tags"));
			currentItem.removeClass("currentDetails");
			currentItem.addClass("infowindow");
			$("ul#newsfeed li").removeAttr("style");
			$("ul#newsfeed").removeAttr("style");
			currentItem.find('.myitem').remove();
			currentItem.find(".icon-remove").remove();
			currentItem.attr("class","mapHighlighterDetails");
		}
		function stopScroll()
		{
			return	false;
		}
		function createFeedPageItem(val)
		{
			var infofId = val._id;
			var item = $("<div />");
			item.attr("class", "myitem");

			

			/*create the content element*/
			content = $("<div />");
			content.attr("class", "content");
			content.html("<div class='theContent'>" + val.content + "</div>");
			
			content.append("<br />");
			
			/* create the likes system */ 
			var yakLikes = $("<span />");
			yakLikes.attr("class", "yakLikes");
			yakLikes.attr("rel", val._id);

			var yakComments = $("<span />");
			yakComments.attr("class", "yakComments");
			yakComments.attr("rel", val._id);
			setCommentText(val.yakComments.length,yakComments);
			
			

			yakComments.unbind("click").on('click',function(){
				if ($(this).parent().find(".commentBox").length > 0)
				{
					return;
				}
					
				var currEleComment = $(this);
				var divComment = $("<div />");

				divComment.attr("class", "commentBox");
				$(this).append('<img class="loadingMore" src="images/loader_big.gif">');
				
				$.each(val.yakComments, function(key, val){
					divComment.append(drawAComment(val, infofId, 'map'));
				});
				divComment.append('<textarea maxlength="250" rows="3" style="z-index: 1111111111111; display: block" class="yakTextarea" placeholder="Ajouter un commentaire..." onclick="return stopScroll()"></textarea>');

				divComment.find("textarea").mouseenter(function(){

					divComment.find("textarea").focus();
					divComment.find("textarea").focus(function(){
						return false;
					});

					divComment.find("textarea").unbind("click").on('click',function(){
						return false;
					});
				});

				divComment.find("textarea").mouseleave(function(){
					
				});
				divComment.find("textarea").keypress(function(event){

					if (event.keyCode == 13) {
						var comment = $(this).val();
						if(comment.length > 250)
						{
							alert("Comments only 250...");
							return;
						}
						var theArea = $(this);
						$(this).val("posting...Please wait");
						$(this).attr("disabled", "disabled");
						var newComment = new Array();
						newComment.infoid = currEleComment.attr("rel");
						newComment.username = user.login;
						newComment.userid = user._id;
						newComment.comment = comment;
						newComment.userthumb = user.thumb;
						newComment.date = new Date();

						$.post('/api/setComment', {infoId : currEleComment.attr("rel"), username: user.login, userthumb: user.thumb, comment: comment.substring(0, 249)} , function(res){
							if (res.meta.code == '200')
							{
								//alert("great");
								newComment._id = res.meta.cid;
								theArea.val("");
								theArea.removeAttr("disabled");
								theArea.before(drawAComment(newComment));
							}

						});
					};
				});
				currEleComment.find(".loadingMore").remove();
				currEleComment.after(divComment);
		
			});

			var thumbsUp = "<span class='btn newYaklike'><i></i>Like</span>&nbsp;";
			var thumbsDown = "<i class='icon-thumbs-down'></i>";
			if($.inArray(user._id, val.yaklikeUsersIds) > -1)
			{
				thumbsUp = "Vous avez aimé cette info !";
			}

			if($.inArray(user._id, val.yakunlikeUsersIds) > -1)
			{
				thumbsDown = "Vous n'avez pas aimé cette info.";
			}

			if($.inArray(user._id, val.yaklikeUsersIds) > -1 && $.inArray(user._id, val.yakunlikeUsersIds) == -1)
			{
				//yakLikes.append("<span class='theUps'>" + val.likes + "</span> likes- " + "" + "<span class='theDowns'>" + val.unlikes +"</span> dislikes");			
				yakLikes.append("<span class='theUps'>" + val.likes + "</span> likes");			
				yakLikes.unbind("click").on('click',function(){
					$('.alreadyVoted').hide();	
					$(this).append("<span class='alreadyVoted'> Vous avez déjà donnée votre avis !</span>");
					setTimeout('$(".alreadyVoted").remove()', 3000);
				});

			}
			else if($.inArray(user._id, val.yaklikeUsersIds) == -1 && $.inArray(user._id, val.yakunlikeUsersIds) > -1)
			{
				//yakLikes.append("<span class='theUps'>" + val.likes + "</span> likes- " + "" + "<span class='theDowns'>" + val.unlikes +"</span> dislikes");							
				yakLikes.append("<span class='theUps'>" + val.likes + "</span> likes");							
				yakLikes.unbind("click").on('click',function(){
					$('.alreadyVoted').hide();
					$(this).append("<span class='alreadyVoted'> Vous avez déjà donnée votre avis !</span>");
					setTimeout('$(".alreadyVoted").remove()', 3000);
				});
			}
			else
			{

			//yakLikes.append(thumbsUp + "<span class='theUps'>" + val.likes + "</span> likes- " + thumbsDown + "<span class='theDowns'>" + val.unlikes +"</span> dislikes");			
			yakLikes.append(thumbsUp + "<span class='theUps'>" + val.likes + "</span> likes ");			

			}


			more = $("<a />");
			more.attr("class", "more");
			more.attr("href", val.outGoingLink);
			more.attr("target", "_blank");
			more.attr("rel", val._id);
			more.attr("data-toggle", "data-toggle");
			more.html(" plus de détails...");
			
			
			content.append("<div class='shareMe' userid='"+user._id+"'><i style='background: none' class='icon-share' title=''><div class='ftgIcon'></div></i></div>");
			
			if(typeof(val.outGoingLink) != 'undefined')
				content.find(".theContent").append(more);
			item.append(content);
			item.append(yakLikes);

			item.append(yakComments);

			if(val.origin.indexOf('@') == 0)
			{
			var yakSpam = $("<span />");
			yakSpam.attr("class", "yakSpam");
			yakSpam.attr("rel", val._id);
			setSpamSystem(yakSpam);
			item.append(yakSpam);
			}

			var yakyakBlackList = $("<span />");
			yakyakBlackList.attr("class", "yakBlackList");
			yakyakBlackList.attr("rel", val._id);
			setyakBlackListSystem(yakyakBlackList);
			item.append(yakyakBlackList);

			return item;	
		}

		function getHotTags(curPos,dateFrom){
			bounds = getMyBounds();
			$.getJSON('/api/getHotTags/'+bounds.ca.b+'/'+bounds.ea.b+'/'+bounds.ca.f+'/'+bounds.ea.f+'/'+dateFrom+'/10',function(ajax) {
				$('#dropdownTagSelector').html('');
				if(typeof ajax.data != 'undefined' && ajax.data.tag.length > 0){
					$.each(ajax.data.tag,function(key,val){
						$('#dropdownTagSelector').append('<li>'+val.title+'</li>');
					});
				}else{
					$('#dropdownTagSelector').html("<span style='cursor:default;'>No tag here</span>");
				}
				
			});
		}