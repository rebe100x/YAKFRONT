/*INIT*/
	var infoArray = [];
	var mediumImage;
	var thumbImage;
	var skip = 0;
	var zoom = 1;
	var infoContent = '';
	var rule = new RegExp('#([^\\s]*)','g');
	var rule2 = new RegExp('[#]','g');
	var postFlag = 0;
	
	var filteredInfoArray = [];
	var lastSearchString = null;
	
	setInterval(function() {silentUpdater();}, 10000);

	/*READY FUNCTIONS*/
	$(document).ready(function() {
		/*control opener*/
		$('#searchBtn').click(function(){

				$.cookie("searchString",searchString,{ expires: 10000, path : '/' });

				var str = encodeURIComponent($('#searchStr').val());
				var placeName = $('#searchPlaceStr').val();
				var location = JSON.stringify({lat:curPos.x,lng:curPos.y});	

				if(location != ''){
					changeLocation(location);
					getAndPrintInfo();
				}else{
					if(placeName != ''){
						
						var addressQuery = {"address": placeName ,"region":"fr","language":"fr"};
						var geocoder = new google.maps.Geocoder();
						geocoder.geocode( addressQuery, function(results, status) {						
						if (status == google.maps.GeocoderStatus.OK) {
						
							var placeGmap = getPlaceFromGmapResult((results[0]));
							
						}else{
							var salt = new Date().getTime();
							$('#searchStr').before("<div id='alert"+salt+"' class='control-label'><i class='icon-exclamation-sign'> </i>Adresse invalide</div>");
							setTimeout(function() {
								$("#alert"+salt).fadeOut();
							}, 3000);
							
						} 
						});
					}
				}

				if(str != 'Quoi ?' && str != ''){
					searchString = str;
					filteredInfoArray = [];
					cleanFeed();
					$.each(infoArray,function(key,val){
						str = decodeURIComponent(str);
						var searchExactStr = new RegExp("(?:^| )(" + str + ")",'gi');
						if(searchExactStr.test(val.title) 
							|| searchExactStr.test(val.content) 
							|| searchExactStr.test(val.yakCatName) 
							|| searchExactStr.test(val.freeTag) 
							|| searchExactStr.test(val.origin)  ){
							filteredInfoArray.push(val);
						}
							
					});
					// print Map and Feed from the filtered array
					printMapAndFeed(filteredInfoArray,1);
				}else{ // if the search string is empty
					cleanFeed();
					searchString = null;
					if(infoArray.length > 0) // if the info array is empty we get it from db else we print it.
						printMapAndFeed(infoArray,1);
					else
						getAndPrintInfo();
				}
				
			
				
				if( (lastSearchString == null || lastSearchString != str ) && str.length > 1 ){
					$.cookie("searchString",searchString,{ expires: 10000, path : '/' });
					var now = new Date();
					var searchDate = now.setTime(now.getTime()+dateFrom*24*60*60*1000);
					
					var trackParams = 	{
						"page":"feed",
						"location":{
							"lat":curPos.x.toString(),
							"lng": curPos.y.toString(),
						},
						"dateFrom": searchDate.toString(),
						"type": yakType.toString(),
						"str": searchString
					};

					$.getJSON(conf.trackurl+'/track/user/'+user._id+'/'+'5'+'/'+encodeURIComponent(JSON.stringify(trackParams))); 
				}	
				lastSearchString = str;
				$('#searchStr').removeClass('searching');
			});

		

		//$('#newsfeedContent').mCustomScrollbar({mouseWheel:true,callbacks:{onTotalScroll:printArrayFeedItem},scrollButtons:{enable:true,scrollType:"continuous",},advanced:{autoExpandHorizontalScroll:true,updateOnContentResize: true,updateOnBrowserResize:true}});
		//$('#newspostContent').mCustomScrollbar({mouseWheel:true,scrollButtons:{enable:true,scrollType:"continuous",},advanced:{autoExpandHorizontalScroll:true,updateOnContentResize: true,updateOnBrowserResize:true}});
		
		
		$('#newsfeed').delegate(".mapHighlighter",'click', function (e) {
			
			if(!$.contains($(this), e.target) && e.target.className != 'prevent-default'){
				getItemDetails(this);
			}
			
		});

		getAndPrintInfo();

	});  // END READY

	function changeLocation(location){
		var locationObj = JSON.parse(location);
		curPos.x = locationObj.lat;
		curPos.y = locationObj.lng;
	}

	function printMapAndFeed(data,flagFilter){
		$.each(data, function(key,val) {
			if(flagFilter!=1)
				infoArray.push(val);					
			if(key<10)
				printFeedItem(val,0,0);	
		});
		printLoadingFeedItem();	
	}
	
	function unhighlightInfo(obj,callback){
		markerHL.setAnimation(null);
		markerHL.setVisible(false);
		
		if (callback && typeof(callback) === "function") {  
			callback(obj);  
		} 
	}
	
	
	
	function silentUpdater(){
		
		var nowts = new Date().getTime();
		var apiUrl = '';
		if(yakType.inArray("5"))
			apiUrl = '/api/geoalerts/'+curPos.x+'/'+curPos.y+'/'+rangeFromZ()+'/'+'null'+'/'+dateFrom+'/'+nowts+'/'+searchString+'/500';
		else	
			apiUrl = '/api/geoinfos/'+curPos.x+'/'+curPos.y+'/'+rangeFromZ()+'/'+'null'+'/'+dateFrom+'/'+nowts+'/'+yakType.toString()+'/'+searchString+'/500';
		

		$.getJSON(apiUrl,function(ajax) {	
			if(typeof ajax.data != 'undefined'){
				$.each(ajax.data.info, function(key,val) {
					var flagExists = 0;
					
					$.each(infoArray,function(key2,val2){
						if(val2._id == val._id){
							flagExists = 1;
						}
					});
					
					if(flagExists == 0){
						printFeedItem(val,1,0);	
						infoArray.push(val);	
					}
				});
			}	
		});
	}
	
	function getAndPrintInfo(){
		//console.log('getAndPrintInfo');
		getHotTags(curPos,dateFrom);
		infoArray = [];
		
		
		
		if(typeof(yakType) == 'undefined' || yakType.length == 0){
			printEmptyFeedItem();
			return;
		}

		var apiUrl = '';
		if(yakType.inArray("5"))
			apiUrl = '/api/geoalerts/'+curPos.x+'/'+curPos.y+'/'+rangeFromZ()+'/'+'null'+'/'+dateFrom+'/0/'+searchString+'/500';
		else	
			apiUrl = '/api/geoinfos/'+curPos.x+'/'+curPos.y+'/'+rangeFromZ()+'/'+'null'+'/'+dateFrom+'/0/'+yakType.toString()+'/'+searchString+'/500';
		
		//console.log(apiUrl);
		$.getJSON(apiUrl,function(ajax) {	
		

			// empty the news feed
			cleanFeed();

			if(typeof(ajax.data) == 'undefined' || typeof(ajax.data.info) == 'undefined' || ajax.data.info.length == 0){
				//$('#newsfeed').html('Aucune info !');
				printEmptyFeedItem();
			}else{
				$.each(ajax.data.info, function(key,val) {
					infoArray.push(val);					
					if(key<10)
						printFeedItem(val,0,0);	
				});
			
			printLoadingFeedItem();

			if(gup("id") != null && gup("id") != ""){
				$.getJSON('/api/afeed', { id: gup("id") } ,function(data) {
					infoArray.push(data.info[0]);
					printFeedItem(data.info[0],1,0);	
					for(i=1; i<$(".mapHighlighterDetails[infoid=" + gup("id") +"]").length; i++)
					{
						$(".mapHighlighterDetails[infoid=" + gup("id") +"]").eq(i).remove();
					}
					if(data.info[0].user != undefined){
						var thumbsource = conf.fronturl+'/pictures/120_90/' + $(".mapHighlighterDetails[infoid=" + gup("id") +"]").eq(0).attr("src");
						$(".mapHighlighterDetails[infoid=" + gup("id") +"]").eq(0).attr("src", thumbsource);

					}else{
						var thumbsource = conf.batchurl + $(".mapHighlighterDetails[infoid=" + gup("id") +"]").eq(0).find(".thumbImage img").attr("src");
						$(".mapHighlighterDetails[infoid=" + gup("id") +"]").eq(0).find(".thumbImage img").attr("src", thumbsource);
						
					}

				});
			}
			//markerCluster.addMarkers(markers);
			}
			$("abbr.timeago").timeago();
			$('#newsfeedContent').mCustomScrollbar("update");
		});
		
		// log
		var now = new Date();
		var searchDate = now.setTime(now.getTime()+dateFrom*24*60*60*1000);
		var trackParams = 	{
								"page":"feed",
								"location":{
									"lat": curPos.x.toString(),
									"lng": curPos.y.toString(),
								},
								"dateFrom": searchDate.toString(),
								"type": yakType.toString(),
								"str": searchString
							};

		$.getJSON(conf.trackurl+'/track/user/'+user._id+'/'+'5'+'/'+encodeURIComponent(JSON.stringify(trackParams)));  
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

		var yakTypeImage = $("<div />");
		yakTypeImage.attr("class", "yakTypeImage");
		yakTypeImage.html("<img src='/images/markers/new/type" + item.yakType + ".png' />");
		infoContent.append(yakTypeImage);

		if(!(typeof item.thumb === 'undefined') && item.thumb != conf.batchurl && item.thumb != null && item.thumb != ''){
			thumbImage = item.thumb.replace('thumb/','');
			thumbImage = thumbImage.replace('//','/');
			var thumbImageCode = $("<div />");
			thumbImageCode.attr("class", "thumbImage");
			thumbImageCode.append("<img src=\'"+thumbImage+"\' />");
			infoContent.append(thumbImageCode);				
		}

		var itemTitle = $("<div />");
		itemTitle.attr("class", "itemTitle");
		itemTitle.html(item.title.linkify());
		thedate = buildItemDate(item);
		var postedBy = $("<div />");
		postedBy.attr("class", "postedBy");
		if(item.origin.indexOf('@') != 0)
			item.origin ="@"+item.origin;

		if(item.yakType !=2 )
			postedBy.html("Posté par <a class='prevent-default' onclick='setSearchFor(this)'>"+item.origin+"</a> " + "<span class=\'date\'> - "+thedate+"</span>");
		else{
			postedBy.html("Posté par <a class='prevent-default' onclick='setSearchFor(this)'>"+item.origin+"</a>");
			itemTitle.append(" - <span class=\'dateAgenda\'>"+thedate+"</span>");			
		}
			
		infoContent.append(itemTitle);
		infoContent.append(postedBy);
		
		var thetags = "<div class=\'tags\'>";					

		/*if(item.yakCatName.length > 0)
			thetags += yakCatNameArray.join(', ');

		if(tagNameArray.length > 0){
			if(item.yakCatName.length > 0)
				thetags += ', ';
			thetags += tagNameArray.join(', ');
		}*/
		//console.log(item.yakCatName);

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

		if(typeof(item.address) != 'undefined' && item.address != 'null' && item.address != '')
			var theaddress = "<div class=\'infodetail\'>"+item.address+"</div>";
				if(user.login == 'renaud.bessieres' || user.login == 'dany.srour') /// this is debug
					theaddress += "<div class=\'infodetail\'>"+pubDate+" >> "+dateEndPrint+"</div>";

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
			$('#newsfeedContent').mCustomScrollbar("update");
			$('#newsfeedContent').mCustomScrollbar("scrollTo","ul#newsfeed");

		}  
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
		{
		infoContent = "<div class=\'infowindow emptyfeeditem\'>Aucune info !</div>";					
		}
		else
		{
		infoContent = "<div class=\'infowindow emptyfeeditem\'>Il n'y a pas d'info ici !!!</div>";					
		}
		$('#newsfeed').append('<li class=\'mapHighlighterDetails\'>'+infoContent+'</li>');
	}

	function printArrayFeedItem(){
		skip = skip + 10;
		var itemArray = infoArray.slice(skip,skip+10);
		$.each(itemArray,function(key,val){
			printFeedItem(val,0,0);
		});
		printLoadingFeedItem();
		$('#newsfeedContent').mCustomScrollbar("update");
	}


	function getItemDetails(el){

		var currentItem = $(el);

		var infoid = currentItem.attr("infoid");

		if (currentItem.find(".loadingMore").length > 0 || currentItem.find(".myitem").length > 0)
		{
			currentItem.find(".myitem").find(".icon-remove").remove();
			currentItem.find(".itemTitle").append("<i class='icon-remove' title='close' onclick='closemyitem(this);'></i>");
			currentItem.find(".myitem").show();
			return;
		}

		currentItem.append('<img src="images/loader_big.gif" class="loadingMore">');
		
		$.getJSON('/api/afeed', { id: infoid } ,function(data) {
			//console.log(data.info[0]);
			
			var val = data.info[0];
			/*
			if(val.user != undefined){
				thumbImage = 	val.thumb;
				mediumImage = 	thumbImage.replace('120_90', '512_0');
			}else{
				thumbImage = 	val.thumb;
				mediumImage = 	thumbImage.replace('thumb', 'medium');
			}*/

			thumbImage = val.thumb.replace('thumb/','');
			thumbImage = thumbImage.replace('//','/');
			mediumImage = 	thumbImage.replace('120_90', '512_0');
		

			var item = createFeedPageItem(val);
			currentItem.find(".loadingMore").remove();
			currentItem.append(item);
			currentItem.find(".myitem").append("<i class='icon-remove' title='close' onclick='closemyitem(this);'></i>");
			setshortUrl();
			setLikeSystem();

			
			if(val.thumbFlag == 2)
			{
				currentItem.find(".thumbImage").insertAfter(currentItem.find(".tags"));	
				currentItem.find(".thumbImage img").attr("src", mediumImage);
				currentItem.addClass("currentDetails");
				currentItem.removeClass("infowindow");

			}
			else
			{
				//currentItem.find(".thumbImage").remove();
				currentItem.find(".thumbImage img").show();
				currentItem.find(".thumbImage").insertAfter(currentItem.find(".yakTypeImage"));
				currentItem.find(".infodetail").insertAfter(currentItem.find(".tags"));
				
				$("ul#newsfeed li").removeAttr("style");
				$("ul#newsfeed").removeAttr("style");
			}
			
			
			currentItem.find(".infodetail").insertAfter(currentItem.find(".postedBy"));
			currentItem.find(".icon-remove").appendTo(currentItem.find(".itemTitle"));
			$("ul#newsfeed li").css("width", "100%");
			$("ul#newsfeed").css("width", "100%");
			$("#newsfeed li").removeClass('highlighted');
			currentItem.parent().addClass('highlighted');
			$("body").animate({ scrollTop: $(".mapHighlighter[infoId=\""+currentItem.parent().attr("infoid")+"\"]").offset().top  }, "slow");
			
		});

		if ($(el).find(".myitem").css("display") == "none") {
			$("#newsfeed").find(".myitem").hide();
			$(el).find(".myitem").show();
		}
		else
		{
			$(el).find(".myitem").hide();
		}


		var trackParams ={"infoId":infoid,"page": "feed"};
		$.getJSON(conf.trackurl+'/track/user/'+user._id+'/'+'6'+'/'+encodeURIComponent(JSON.stringify(trackParams)));  
		
	}

	function closemyitem(el)
	{
		var currentItem = $(el).parent().parent();
		currentItem.find(".thumbImage img").show();
		currentItem.find(".thumbImage img").attr("src", thumbImage);
		currentItem.find(".thumbImage").insertAfter(currentItem.find(".yakTypeImage"));
		currentItem.find(".infodetail").insertAfter(currentItem.find(".tags"));
		currentItem.removeClass("currentDetails");
		currentItem.addClass("infowindow");
		$("ul#newsfeed li").removeAttr("style");
		$("ul#newsfeed").removeAttr("style");
		currentItem.find('.myitem').remove();
		currentItem.find(".icon-remove").remove();
	}




	function createFeedPageItem(val)
	{
		item = $("<div />");
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
		//console.log(val.yakComments);
		setCommentText(val.yakComments.length,yakComments);
		
		yakComments.click(function(){
			if ($(this).parent().find(".commentBox").length > 0)
			{
				return;
			}
				
			var currEleComment = $(this);
			var divComment = $("<div />");
			divComment.attr("class", "commentBox");
			$(this).append('<img class="loadingMore" src="images/loader_big.gif">');
			$.getJSON('/api/afeed', { id: $(this).attr("rel")} ,function(data) {
					$.each(data.info[0].yakComments, function(key, val){
						divComment.append(drawAComment(val, currEleComment.attr("rel"), 'map'));
					});
					divComment.append('<textarea maxlength="250" rows="3" class="yakTextarea" placeholder="Ajouter un commentaire..."></textarea>');

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
								if (res == 'updated')
								{
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
		});

		var thumbsUp = "<i class='icon-thumbs-up'></i>&nbsp;";
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
			yakLikes.click(function(){
				$('.alreadyVoted').hide();	
				$(this).append("<span class='alreadyVoted'> Vous avez déjà donnée votre avis !</span>");
				setTimeout('$(".alreadyVoted").remove()', 3000);
			});

		}
		else if($.inArray(user._id, val.yaklikeUsersIds) == -1 && $.inArray(user._id, val.yakunlikeUsersIds) > -1)
		{
			//yakLikes.append("<span class='theUps'>" + val.likes + "</span> likes- " + "" + "<span class='theDowns'>" + val.unlikes +"</span> dislikes");							
			yakLikes.append("<span class='theUps'>" + val.likes + "</span> likes");							
			yakLikes.click(function(){
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
		
		content.append("<div class='shareMe'><i style='background: none' class='icon-share' title='Share Me'><img src='images/ftg.png' class='ftgIcon' /> </i></div>");
		if(typeof(val.outGoingLink) != 'undefined')
			content.find(".theContent").append(more);
		item.append(content);
		item.append(yakLikes);
		item.append(yakComments);
		item.append()
		return item;	
	}

	function rangeFromZ(){
		return (-1)*0.0096/1*(curPos.z)+1;
	}

	function changeRange(){
		//curPos.z  = zFromRange();
		//$.cookie("geoloc", JSON.stringify(curPos),{ expires: 10000, path : '/' });
		getAndPrintInfo();
	}

	
	function zFromRange(){
		//return (1-)/0.0096;
	}