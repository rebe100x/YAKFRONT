var bounds=new Array();var markers=[];var infoArray=[];var markerLocation=null;var yakcatArray=[];var placeArray=[];var hashtag=[];var hashtagTmp=[];var mediumImage;var thumbImage;var dateLastCheck;var skip=0;var zoom=1;var infoContent="";var rule=new RegExp("#([^\\s]*)","g");var rule2=new RegExp("[#]","g");var postFlag=0;var listenerHandle=null;var filteredInfoArray=[];var lastSearchString=null;var oldLocation={lat:0,lng:0};var map=new google.maps.Map(document.getElementById("mymap"),{mapTypeId:google.maps.MapTypeId.ROADMAP,disableDefaultUI:true,scrollwheel:true,zoom_changed:function(){setLocalnessSliderTextMinified(map.getZoom())},maxZoom:16,minZoom:11,disableDoubleClickZoom:true,});setInterval(function(){silentUpdater()},10000);$(document).ready(function(){console.log(user);$.post("/api/user/blacklist",{id:"5168263a9a01583001000017",type:"user"},function(){});if(gup("post")==1){showPostForm()}$("#searchBtn").unbind("click").on("click",function(){filteredInfoArray=[];var k=encodeURIComponent($("#searchStr").val());var j=$("#searchPlaceStr").val();if(j.length>=2){var d={address:j,region:"fr",language:"fr"};var g=new google.maps.Geocoder();g.geocode(d,function(p,o){if(o==google.maps.GeocoderStatus.OK){var q=getPlaceFromGmapResult((p[0]));var n=JSON.stringify({lat:curPos.x,lng:curPos.y});changeLocation(n)}else{}})}var e=decodeURIComponent(k);if(k!="Quoi ?"&&k!=""){searchString=k;cleanMarkers();cleanFeed();$.each(infoArray,function(o,p){if(p.origin.charAt(0)=="@"){p.origin=p.origin.substring(1,p.origin.length)}if(e.charAt(0)=="@"){e=e.substring(1,k.length)}if(e.charAt(0)=="#"){e=e.substring(1,k.length)}var n=new RegExp("(?:^| )("+e+")","gi");if(n.test(p.title)||n.test(p.content)||n.test(p.yakCatName.join(" "))||n.test(p.freeTag.join(" "))||n.test(p.origin)){filteredInfoArray.push(p)}});printMapAndFeed(filteredInfoArray,1)}else{cleanMarkers();cleanFeed();searchString=null;if(infoArray.length>0&&k!=""){printMapAndFeed(infoArray,1)}else{getAndPrintInfo()}}if((lastSearchString==null||lastSearchString!=k)&&k.length>1){var l=map.getCenter();var b=new Date();var f=b.setTime(b.getTime()+dateFrom*24*60*60*1000);var c={page:"map",location:{lat:l.lat().toString(),lng:l.lng().toString(),},dateFrom:f.toString(),type:yakType.toString(),str:searchString};$.getJSON(conf.trackurl+"/track/user/"+user._id+"/5/"+encodeURIComponent(JSON.stringify(c)))}var h=new Date();var m=3*60*60*1000;h.setTime(h.getTime()+(m));$.cookie("searchString",searchString,{expires:h,path:"/"});lastSearchString=k;$("#searchStr").removeClass("searching")});if(typeof($(".ui-slider-handle").position())!="undefined"){var a=$(".ui-slider-handle").position();$("#blackBox").css("left",(a.left-87)+"px")}zoom=rangeFromZ();$("#arroundme").unbind("click").on("click",function(){if(user.location){var b=new google.maps.LatLng(user.location.lat,user.location.lng);curPos.name=user.formatted_address;curPos.x=user.location.lat;curPos.y=user.location.lng;curPos.z=user.addressZoom;$("#searchPlaceStr").val(curPos.name);setLocalnessSliderText(curPos.z);$.cookie("geoloc",JSON.stringify(curPos),{expires:10000,path:"/"});changeRange();moveMap()}else{window.location="/settings/profile"}});$("#zoomplus").unbind("click").on("click",function(){if(curPos.z==120){return}zoom=map.getZoom();zoom++;map.setZoom(zoom);changeZoom();if(curPos.z==90||curPos.z==110){$("#zoomplus").trigger("click")}});$("#zoomminus").unbind("click").on("click",function(){if(curPos.z==70){return}zoom=map.getZoom();zoom--;map.setZoom(zoom);changeZoom();if(curPos.z==90||curPos.z==110){$("#zoomminus").trigger("click")}});$("#boxOpener").unbind("click").on("click",function(b){b.preventDefault();if($(this).hasClass("opened")){$(this).removeClass("opened").addClass("closed");$("#newsfeedMenu").animate({height:"0px",opacity:0},200,function(){drawNewsFeed()})}else{$(this).removeClass("closed").addClass("opened")}});$("#newsNav li").unbind("click").on("click",function(c){c.preventDefault();if(!$(this).hasClass("active")){$("#newsNav li").removeClass("active");$(this).addClass("active");var b=$(this).attr("contentToLoad");$(".tabContent").hide();$("#"+b).fadeIn();if(b=="newspostContent"){listenerHandle=google.maps.event.addListener(map,"click",function(d){getformattedAddress(d.latLng);placeMarker(d.latLng,markerLocation);google.maps.event.addListener(markerLocation,"dragend",function(){cleanMarkers();var e=markerLocation.getPosition();$("#latitude").val(e.lat());$("#longitude").val(e.lng());getformattedAddress(e)})})}else{google.maps.event.removeListener(listenerHandle);markerLocation.setVisible(false)}}drawNewsFeed()});drawNewsFeed();$("#newsfeedContent").mCustomScrollbar({mouseWheel:true,callbacks:{onTotalScroll:printArrayFeedItem},scrollButtons:{enable:true,scrollType:"continuous",},advanced:{autoExpandHorizontalScroll:true,updateOnContentResize:true,updateOnBrowserResize:true}});$(window).resize(function(){drawNewsFeed();bounds=getMyBounds();manageSearchBox()});$("#newsfeed").unbind("click").on("click",".mapHighlighter",function(b){if(b.target.className!="prevent-default"){if($(this).find(".myitem").length==0){getItemDetails(this)}unhighlightInfo($(this),highlightInfo)}});google.maps.event.addDomListener(window,"load",initialize(curPos.x,curPos.y,curPos.z));$(".hashtagMaker").keyup(function(c){hashtagTmp=[];var b=($("#content").val()+" "+$("#title").val()).split(" ");for(i=0;i<b.length;i++){if(b[i].match(rule)){hashtagTmp.push(b[i]);$("#freetag").val(hashtagTmp.toString().replace(rule2,""))}}});$("#picture").live("change",function(){if(window.FileReader){var b=this.files;var c=b[0];var d=new FileReader();d.onload=function(){var e=d.result;binimage1=e.replace("data:"+c.type+";base64,","");var f="<img class='img-rounded' src='data:"+c.type+";base64,"+binimage1+"' style='width:100px'/>";$("#picturePreview").html(f)};d.readAsDataURL(c)}});markerLocation=new google.maps.Marker({visible:false,map:map,draggable:true,icon:"/images/beachflag.png",});$("#yakcat").typeahead({minLength:3,source:function(c,b){$.ajax({url:"/api/cats",success:function(d){c.process(d.data.cats)}})},property:"title",onselect:function(b){$("label[for='category']").after("<div class='pillItem'><i class='icon-remove icon-pointer'  onclick='yakcatArray.cleanArray(\""+b._id+'");$("#yakcatInput").val(JSON.stringify(yakcatArray));$(this).parent().remove();\'></i> '+b.title+"</div>");$("#yakcat").val("").focus();yakcatArray.push(b);$("#yakcatInput").val(JSON.stringify(yakcatArray))}});$("#place").typeahead({minLength:3,source:function(e,c){if(c.length>=3){encodeURIComponent(c);$("#place").addClass("searching");var b={address:c,region:"fr",language:"fr"};var d=new google.maps.Geocoder();d.geocode(b,function(g,f){if(f==google.maps.GeocoderStatus.OK){e.process(g);$("#place").removeClass("searching")}})}},property:"formatted_address",onselect:function(b){var c=getPlaceFromGmapResult(b);$("#btn-place-adder").parent().before("<div class='pillItem'><i class='icon-remove icon-pointer'  onclick='placeArray.cleanArrayByLocation(\""+c.location.lat+","+c.location.lng+'");$("#placeInput").val(JSON.stringify(placeArray));$(this).parent().remove();\'></i> '+c.title+"</div>");$("#place").val("").focus();placeArray.push(c);$("#placeInput").val(JSON.stringify(placeArray))}});$("#btn-place-adder").unbind("click").on("click",function(){var d=$("#place").val();if(d!="Rechercher..."&&d!=""&&d.length>1){var b={address:d,latLng:map.getCenter(),bounds:map.getBounds()};var c=new google.maps.Geocoder();c.geocode(b,function(g,e){if(e==google.maps.GeocoderStatus.OK){map.panTo(g[0].geometry.location);markerLocation.setVisible(true);markerLocation.setPosition(g[0].geometry.location);placeMarker(g[0].geometry.location,markerLocation);var h=getPlaceFromGmapResult(g[0]);placeArray.push(h);$("#placeInput").val(JSON.stringify(placeArray));$("#btn-place-adder").parent().before("<div class='pillItem'><i class='icon-remove icon-pointer' onclick='placeArray.cleanArrayByLocation("+g[0].geometry.location.Ya+","+g[0].geometry.location.Za+');$("#placeInput").val(JSON.stringify(placeArray));$(this).parent().remove();\'></i> '+g[0].formatted_address+"</div>")}else{var f=new Date().getTime();$("#btn-place-adder").parent().before("<div id='alert"+f+"' class='control-label'><i class='icon-exclamation-sign'> </i>Adresse invalide ("+e+")</div>");setTimeout(function(){$("#alert"+f).fadeOut()},3000);$("#place").select()}})}});$("body").unbind("click").on("click",".tagHashLink",function(b){searchString=$(this).html();$("#searchStr").val(searchString);getAndPrintInfo()});$("body").unbind("click").on("click",".userHashLink",function(b){b.preventDefault();searchString=$(this).html();$("#searchStr").val(searchString);getAndPrintInfo()});manageSearchBox()});function placeMarker(b,a){$("#latitude").val(b.lat());$("#longitude").val(b.lng());a.setVisible(true);a.setPosition(b)}function moveMap(){$.cookie("geoloc",JSON.stringify(curPos),{expires:10000,path:"/"});var a=new google.maps.LatLng(curPos.x,curPos.y);$("#locationChooser").modal("hide");if($("#mymap").length>0){map.panTo(a)}}function changeLocation(a){var c=JSON.parse(a);if(a!=""&&oldLocation.lat!=c.lat&&oldLocation.lng!=c.lng){var b=new google.maps.LatLng(c.lat,c.lng);markerHL.setPosition(new google.maps.LatLng(c.lat,c.lng));markerHL.setVisible(true);markerHL.setMap(map);markerHL.setOptions({icon:"/images/markers/target3.png"});setTimeout(function(){markerHL.setMap(null)},3000);map.panTo(b);oldLocation=c;curPos.x=c.lat;curPos.y=c.lng;getAndPrintInfo()}}function manageSearchBox(){var a=$(window).width();if(a<960){$("#boxOpener").removeClass("opened").addClass("closed");$("#newsfeedMenu").animate({height:"0px",opacity:0},200,function(){drawNewsFeed()})}else{$("#boxOpener").removeClass("closed").addClass("opened")}}function getMyBounds(){thebounds=map.getBounds();var b=$(window).width();var n=$(window).height();var j=$("#newsfeedContainer").position();var f=parseFloat(thebounds.ca.b);var l=parseFloat(thebounds.ca.d);var k=parseFloat(thebounds.Z.d);var a=parseFloat(thebounds.Z.b);var m=(l-f)/b;var g=(k-a)/n;feedOffsetW=j.left*m;var e=j.top*g;var d=15*m;var o=140*g;var h=10*g;if(b>768){var c={ca:{f:k-o,b:a+h,},ea:{f:f+feedOffsetW-d,b:f+d,}}}else{var c={ca:{f:k-o,b:k-e+h,},ea:{f:l-d,b:f+d,}}}return c}function drawNewsFeed(){var d=window.innerHeight-$("#newsfeedContainer").offset().top+"px";$("#newsfeedContainer").css("height",d);var c=$(window).width();if(c<767){$("#newsfeedContainer").css("top","200px")}else{$("#newsfeedContainer").css("top","-15px")}var b=window.innerHeight-$("#newsfeedContent").offset().top-25+"px";$("#newsfeedContent").css("height",b);var a=window.innerHeight-$("#newspostContent").offset().top-25+"px";$("#newspostContent").css("height",a)}function unhighlightInfo(a,b){markerHL.setAnimation(null);markerHL.setVisible(false);if(b&&typeof(b)==="function"){b(a)}}function highlightInfo(a){var b=a.attr("infoId");$.each(infoArray,function(c,e){if(e._id==b){var d=new google.maps.LatLng(e.location.lat,e.location.lng);markerHL.setPosition(d);markerHL.setVisible(true);markerHL.setMap(map);markerHL.setAnimation(google.maps.Animation.BOUNCE);markerHL.setOptions({icon:"/images/markers/new/type"+e.yakType+".png"});setTimeout(function(){markerHL.setMap(null)},2000)}})}function rangeFromZ(){return Math.floor((curPos.z)/10+4)}function zFromRange(){return Math.floor((zoom-4)*10)}function changeRange(){zoom=rangeFromZ();map.setZoom(zoom);$.cookie("geoloc",JSON.stringify(curPos),{expires:10000,path:"/"})}function changeZoom(){curPos.z=zFromRange();setLocalnessSliderText(curPos.z);$("#rangeSelector").val(curPos.z).slider("value",curPos.z);$.cookie("geoloc",JSON.stringify(curPos),{expires:10000,path:"/"})}function initialize(b,d,c){var a=new google.maps.LatLng(b,d);map.setZoom(zoom);map.setCenter(a);markerHL=new google.maps.Marker({position:a,map:map,visible:false});google.maps.event.addListenerOnce(map,"idle",function(){cleanMarkers();bounds=getMyBounds();a=this.getCenter();curPos.x=a.lat();curPos.y=a.lng();zoom=this.getZoom();curPos.z=zFromRange();$.cookie("geoloc",JSON.stringify(curPos),{expires:10000,path:"/"});getAndPrintInfo();$("#postFormRange").val(((-1)*0.0096/1*(curPos.z)+1))});google.maps.event.addListener(map,"dragend",function(){cleanMarkers();bounds=getMyBounds();a=this.getCenter();curPos.x=a.lat();curPos.y=a.lng();zoom=this.getZoom();curPos.z=zFromRange();$.cookie("geoloc",JSON.stringify(curPos),{expires:10000,path:"/"});getAndPrintInfo();$("#postFormRange").val(((-1)*0.0096/1*(curPos.z)+1))});google.maps.event.addListener(map,"zoom_changed",function(){cleanMarkers();bounds=getMyBounds();a=this.getCenter();curPos.x=a.lat();curPos.y=a.lng();zoom=this.getZoom();curPos.z=zFromRange();$.cookie("geoloc",JSON.stringify(curPos),{expires:10000,path:"/"});getAndPrintInfo();$("#postFormRange").val(((-1)*0.0096/1*(curPos.z)+1))})}function cleanMarkers(){$.each(markers,function(a,b){b.setMap(null)});markers=[]}function hideMarkers(a){$.each(markers,function(b,c){c.setVisible(false)});setInterval(function(){$.each(markers,function(b,c){c.setVisible(true)})},a)}function numAlertsSearch(){if(!yakType.inArray("5")){var a="";bounds=getMyBounds();dateLastCheck=new Date(user.alertsLastCheck);a="/api/geoalertsNumber/"+bounds.ca.b+"/"+bounds.ea.b+"/"+bounds.ca.f+"/"+bounds.ea.f+"/"+dateFrom+"/"+dateLastCheck.getTime();$.getJSON(a,function(b){if(b.data.info!="-1"&&b.data.info!="0"){$("#alertsNumber").html(b.data.info)}})}}function silentUpdater(){bounds=getMyBounds();var b="";var a=new Date().getTime();if(yakType.inArray("5")){b="/api/geoalerts/"+bounds.ca.b+"/"+bounds.ea.b+"/"+bounds.ca.f+"/"+bounds.ea.f+"/"+dateFrom+"/"+a+"/"+yakType.toString()+"/"+searchString+"/500"}else{b="/api/geoinfos/"+bounds.ca.b+"/"+bounds.ea.b+"/"+bounds.ca.f+"/"+bounds.ea.f+"/"+dateFrom+"/"+a+"/"+yakType.toString()+"/"+searchString+"/500"}$.getJSON(b,function(c){if(typeof c.data=="undefined"){return}$.each(c.data.info,function(d,f){var e=0;$.each(infoArray,function(g,h){if(h._id==f._id){e=1}});if(e==0){printMapItem(f,d,1);printFeedItem(f,1,0);infoArray.push(f)}})})}function getAndPrintInfo(){getHotTags(curPos,dateFrom);infoArray=[];bounds=getMyBounds();drawNewsFeed();cleanMarkers();cleanFeed();if(typeof(yakType)=="undefined"||yakType.length==0){printEmptyFeedItem();return}var g="";if(yakType.inArray("5")){g="/api/geoalerts/"+bounds.ca.b+"/"+bounds.ea.b+"/"+bounds.ca.f+"/"+bounds.ea.f+"/"+dateFrom+"/0/"+yakType.toString()+"/"+searchString+"/500"}else{g="/api/geoinfos/"+bounds.ca.b+"/"+bounds.ea.b+"/"+bounds.ca.f+"/"+bounds.ea.f+"/"+dateFrom+"/0/"+yakType.toString()+"/"+searchString+"/500"}$.getJSON(g,function(h){cleanFeed();if(typeof(h.data.info)=="undefined"||h.data.info.length==0){printEmptyFeedItem()}else{printMapAndFeed(h.data.info,0)}$("#newsfeedContent").mCustomScrollbar("update")});var f=new google.maps.Geocoder();var d=new google.maps.LatLng(curPos.x,curPos.y);f.geocode({latLng:d},function(j,h){if(h==google.maps.GeocoderStatus.OK){var k=getPlaceFromGmapResult((j[0]));$("#searchPlaceStr").val(k.address.city+", "+k.address.country)}});var e=map.getCenter();var c=new Date();var a=c.setTime(c.getTime()+dateFrom*24*60*60*1000);var b={page:"map",location:{lat:e.lat().toString(),lng:e.lng().toString(),},dateFrom:a.toString(),type:yakType.toString(),str:searchString};$.getJSON(conf.trackurl+"/track/user/"+user._id+"/5/"+encodeURIComponent(JSON.stringify(b)))}function printMapAndFeed(b,a){cleanFeed();cleanMarkers();$.each(b,function(c,d){if(a!=1){infoArray.push(d)}printMapItem(d,c,0);if(c<10){printFeedItem(d,0,0)}});printLoadingFeedItem()}function printMapItem(d,b,e){var c=new google.maps.LatLng(d.location.lat,d.location.lng);var a=new google.maps.Marker({position:c,icon:"/images/markers/new/type"+d.yakType+".png"});markers.push(a);a.setMap(map);google.maps.event.addListener(a,"click",function(){$("#newsfeed li").removeClass("highlighted");$('#newsfeed li[infoId="'+d._id+'"]').addClass("highlighted");if(typeof($('.mapHighlighter[infoId="'+d._id+'"]').html())!="undefined"){if($(".mCSB_scrollTools").eq(1).css("display")!="none"){$("#newsfeedContent").mCustomScrollbar("scrollTo",'.mapHighlighter[infoId="'+d._id+'"]')}}else{printFeedItem(infoArray[b],1,1)}});if(e==1){a.setAnimation(google.maps.Animation.BOUNCE);setTimeout(function(){a.setAnimation(null)},5000)}}function printFeedItem(p,m,k){var q=new Date(p.pubDate);var l=q.getDate()+"/"+(q.getMonth()+1)+"/"+q.getFullYear();q=new Date(p.dateEndPrint);var a=new Date(p.dateEndPrint);var f=a.getDate()+"/"+(a.getMonth()+1)+"/"+a.getFullYear();infoContent=$("<div />");infoContent.attr("class","infowindow mapHighlighter");infoContent.attr("infoId",p._id);if(!(typeof p.thumb==="undefined")&&p.thumb!=conf.batchurl&&p.thumb!=null&&p.thumb!=""){thumbImage=p.thumb.replace("thumb/","");var n=$("<div />");n.attr("class","thumbImage");n.append("<img src='"+thumbImage+"' />");infoContent.append(n)}var c=$("<div />");c.attr("class","yakTypeImage");c.html("<img src='/images/markers/new/type"+p.yakType+".png' />");infoContent.append(c);var d=$("<div />");d.attr("class","itemTitle");d.html(p.title.linkify());thedate=buildItemDate(p);var j=$("<div />");j.attr("class","postedBy");var h="showUserProfile(this)";if(typeof p.feed!="undefined"){h="setSearchFor(this);"}if(p.origin.indexOf("@")!=0){p.origin="@"+p.origin}if(p.yakType!=2){j.html("Posté par <a class='prevent-default' onclick='"+h+"'>"+p.origin+"</a><input type='hidden' value='"+p.user+"' /><span class='date'> - "+thedate+"</span>")}else{j.html("Posté par <a class='prevent-default' onclick='"+h+"'>"+p.origin+"</a><input type='hidden' value='"+p.user+"' />");d.append(" - <span class='dateAgenda'>"+thedate+"</span>")}infoContent.append(d);infoContent.append(j);var b="<div class='tags'>";if(p.yakCatName.length>0){for(var g=0;g<p.yakCatName.length;g++){b+='<a class="tagHashLink prevent-default" onclick="setSearchFor(this)">#'+p.yakCatName[g]+"</a> "}}if(typeof(p.freeTag)!="undefined"){for(var g=0;g<p.freeTag.length;g++){if(p.freeTag[g]!=""){b+='<a class="tagHashLink prevent-default" onclick="setSearchFor(this)">#'+p.freeTag[g]+"</a> ";if(g<p.freeTag.length-1){b+=", "}}}}b+="</div>";infoContent.append(b);if(typeof(p.address)!="undefined"&&p.address!="null"&&p.address!=""){var e="<div class='infodetail'>"+p.address+"</div>";if(user.login=="renaud.bessieres"||user.login=="dany.srour"){e+="<div class='infodetail'>"+l+" >> "+f+"</div>"}infoContent.append(e)}if(m==1){var o=$("<li />");o.attr("class","mapHighlighterDetails");o.attr("infoId",p._id);o.append(infoContent);$("#newsfeed").prepend(o)}else{var o=$("<li />");o.attr("class","mapHighlighterDetails");o.attr("infoId",p._id);o.append(infoContent);$("#newsfeed").append(o)}if(k==1){}}function printFeedItemold(g,f,d){if(g.yakCatName.length>0){var j=g.yakCatName.map(function(k){if(k.substr(0,1)!="#"){k="#"+k}return k.linkify()});j=j.slice(0,3)}else{var j=new Array()}if(typeof(g.freeTag[0])!="undefined"&&g.freeTag[0].length>0){var b=g.freeTag.map(function(k){if(k.substr(0,1)!="#"){k="#"+k}return k.linkify()});b=b.slice(0,3)}else{var b=new Array()}var h=new Date(g.pubDate);var e=h.getDate()+"/"+(h.getMonth()+1)+"/"+h.getFullYear();h=new Date(g.dateEndPrint);var a=new Date(g.dateEndPrint);var c=a.getDate()+"/"+(a.getMonth()+1)+"/"+a.getFullYear();infoContent="<div class='infowindow mapHighlighter' infoId='"+g._id+"'>";if(!(typeof g.thumb==="undefined")&&g.thumb!=""&&g.thumb!=null){infoContent+="<img src='"+g.thumb+"' />"}infoContent+="<div class='title'> <img class='yakTypeImg' src='/images/markers/type"+g.yakType+".png' />";thedate=buildItemDate(g);infoContent+="<span class='date'>"+thedate+"</span>";infoContent+=g.title.linkify()+"</div>";infoContent+="<div class='tags'>";if(g.yakCatName.length>0){infoContent+=j.join(", ")}if(b.length>0){if(g.yakCatName.length>0){infoContent+=", "}infoContent+=b.join(", ")}infoContent+="</div>";infoContent+="<div class='links'>";if(g.origin&&g.origin!="undefined"){if(g.origin.substring(0,1)=="@"){infoContent+="<div class=''>Posté par <a href='/news/map/search/"+encodeURIComponent(g.origin)+"'>"+g.origin+"</a></div>"}else{infoContent+="<div class=''>Posté par <a target='_blank' href='"+g.outGoingLink+"'>"+g.origin+"</a></div>"}}if(typeof(g.address)!="undefined"&&g.address!="null"&&g.address!=""){infoContent+="<div class='infodetail'>"+g.address+"</div>"}if(user.login=="renaud.bessieres"||user.login=="dany.srour"){infoContent+="<div class='infodetail'>"+e+" >> "+c+"</div>"}infoContent+="</div>";infoContent+="</div>";if(f==1){$("#newsfeed").prepend("<li class='mapHighlighterDetails' infoId='"+g._id+"' >"+infoContent+"</li>")}else{$("#newsfeed").append("<li class='mapHighlighterDetails' infoId='"+g._id+"' >"+infoContent+"</li>")}if(d==1){}}function printLoadingFeedItem(){$(".loadingfeeditem").hide();if(skip<infoArray.length-10){infoContent="<div class='infowindow loadingfeeditem'></div>";$("#newsfeed").append("<li class='mapHighlighterDetails'>"+infoContent+"</li>")}}function printEmptyFeedItem(){$(".emptyfeeditem").hide();if($("#typeContainer .active").length>0){infoContent="<div class='infowindow emptyfeeditem'>Aucune info !</div>"}else{infoContent="<div class='infowindow emptyfeeditem'>Il n'y a pas d'info ici !!!</div>"}$("#newsfeed").append("<li class='mapHighlighterDetails'>"+infoContent+"</li>")}function printArrayFeedItem(){skip=skip+10;var a=infoArray.slice(skip,skip+10);$.each(a,function(b,c){printFeedItem(c,0,0)});printLoadingFeedItem()}function closeAllItems(){$("#newsfeed .icon-remove").trigger("click")}function getItemDetails(c){closeAllItems();var b=$(c);var a=b.attr("infoid");if(b.find(".loadingMore").length>0||b.find(".myitem").length>0){b.find(".icon-remove").remove();b.prepend("<i class='icon-remove' title='close' onclick='closemyitem(this);'></i>");b.find(".myitem").show();return}b.append('<img src="images/loader_big.gif" class="loadingMore">');$.each(infoArray,function(e,g){if(a==g._id){thumbImage=g.thumb.replace("thumb/","");mediumImage=thumbImage.replace("120_90","512_0");var f=createFeedPageItem(g);b.find(".loadingMore").remove();b.append(f);b.prepend("<i class='icon-remove' title='close' rel='"+thumbImage+"' onclick='closemyitem(this);'></i>");setshortUrl();setLikeSystem("map");if(g.thumbFlag==2){b.find(".thumbImage").insertAfter(b.find(".tags"));b.find(".thumbImage img").attr("src",mediumImage);b.find(".thumbImage img").addClass("mediumSizeThumb")}else{b.find(".thumbImage img").show();b.find(".infodetail").insertAfter(b.find(".tags"));$("ul#newsfeed li").removeAttr("style");$("ul#newsfeed").removeAttr("style")}b.find(".infodetail").insertAfter(b.find(".postedBy"));$("ul#newsfeed li").css("width","100%");$("ul#newsfeed").css("width","100%");$("#newsfeed li").removeClass("highlighted");b.parent().addClass("highlighted");$("#newsfeedContent").mCustomScrollbar("scrollTo",'.mapHighlighter[infoId="'+b.parent().attr("infoid")+'"]');var d={infoId:a,page:"map"};$.getJSON(conf.trackurl+"/track/user/"+user._id+"/6/"+encodeURIComponent(JSON.stringify(d)))}})}function closemyitem(b){var a=$(b).parent().parent();a.find(".thumbImage img").show();a.find(".thumbImage img").attr("src",$(b).attr("rel"));a.find(".thumbImage").insertBefore(a.find(".yakTypeImage"));a.find(".infodetail").insertAfter(a.find(".tags"));a.removeClass("currentDetails");a.addClass("infowindow");$("ul#newsfeed li").removeAttr("style");$("ul#newsfeed").removeAttr("style");a.find(".myitem").remove();a.find(".icon-remove").remove();a.attr("class","mapHighlighterDetails")}function stopScroll(){return false}function createFeedPageItem(f){var d=$("<div />");d.attr("class","myitem");content=$("<div />");content.attr("class","content");content.html("<div class='theContent'>"+f.content+"</div>");content.append("<br />");var g=$("<span />");g.attr("class","yakLikes");g.attr("rel",f._id);var b=$("<span />");b.attr("class","yakComments");b.attr("rel",f._id);setCommentText(f.yakComments.length,b);b.unbind("click").on("click",function(){if($(this).parent().find(".commentBox").length>0){return}var h=$(this);var j=$("<div />");j.attr("class","commentBox");$(this).append('<img class="loadingMore" src="images/loader_big.gif">');$.each(f.yakComments,function(k,l){j.append(drawAComment(l,h.attr("rel"),"map"))});j.append('<textarea maxlength="250" rows="3" style="z-index: 1111111111111; display: block" class="yakTextarea" placeholder="Ajouter un commentaire..." onclick="return stopScroll()"></textarea>');j.find("textarea").mouseenter(function(){j.find("textarea").focus();j.find("textarea").focus(function(){return false});j.find("textarea").unbind("click").on("click",function(){return false})});j.find("textarea").mouseleave(function(){});j.find("textarea").keypress(function(l){if(l.keyCode==13){var n=$(this).val();if(n.length>250){alert("Comments only 250...");return}var m=$(this);$(this).val("posting...Please wait");$(this).attr("disabled","disabled");var k=new Array();k.infoid=h.attr("rel");k.username=user.login;k.userid=user._id;k.comment=n;k.userthumb=user.thumb;k.date=new Date();$.post("/api/setComment",{infoId:h.attr("rel"),username:user.login,userthumb:user.thumb,comment:n.substring(0,249)},function(o){if(o.meta.code=="200"){k._id=o.meta.cid;m.val("");m.removeAttr("disabled");m.before(drawAComment(k))}})}});h.find(".loadingMore").remove();h.after(j)});var c="<i class='icon-thumbs-up'></i>&nbsp;";var e="<i class='icon-thumbs-down'></i>";if($.inArray(user._id,f.yaklikeUsersIds)>-1){c="Vous avez aimé cette info !"}if($.inArray(user._id,f.yakunlikeUsersIds)>-1){e="Vous n'avez pas aimé cette info."}if($.inArray(user._id,f.yaklikeUsersIds)>-1&&$.inArray(user._id,f.yakunlikeUsersIds)==-1){g.append("<span class='theUps'>"+f.likes+"</span> likes");g.unbind("click").on("click",function(){$(".alreadyVoted").hide();$(this).append("<span class='alreadyVoted'> Vous avez déjà donnée votre avis !</span>");setTimeout('$(".alreadyVoted").remove()',3000)})}else{if($.inArray(user._id,f.yaklikeUsersIds)==-1&&$.inArray(user._id,f.yakunlikeUsersIds)>-1){g.append("<span class='theUps'>"+f.likes+"</span> likes");g.unbind("click").on("click",function(){$(".alreadyVoted").hide();$(this).append("<span class='alreadyVoted'> Vous avez déjà donnée votre avis !</span>");setTimeout('$(".alreadyVoted").remove()',3000)})}else{g.append(c+"<span class='theUps'>"+f.likes+"</span> likes ")}}more=$("<a />");more.attr("class","more");more.attr("href",f.outGoingLink);more.attr("target","_blank");more.attr("rel",f._id);more.attr("data-toggle","data-toggle");more.html(" plus de détails...");content.append("<div class='shareMe' userid='"+user._id+"'><i style='background: none' class='icon-share' title=''><img src='/images/ftg.png' class='ftgIcon' /> </i></div>");if(typeof(f.outGoingLink)!="undefined"){content.find(".theContent").append(more)}d.append(content);d.append(g);d.append(b);if(f.origin.indexOf("@")==0){var a=$("<span />");a.attr("class","yakSpam");a.attr("rel",f._id);setSpamSystem(a);d.append(a)}return d};