var infoArray=[];var mediumImage;var thumbImage;var skip=0;var zoom=1;var infoContent="";var rule=new RegExp("#([^\\s]*)","g");var rule2=new RegExp("[#]","g");var postFlag=0;var filteredInfoArray=[];var lastSearchString=null;setInterval(function(){silentUpdater()},10000);$(document).ready(function(){$("#searchBtn").click(function(){$.cookie("searchString",searchString,{expires:10000,path:"/"});var h=encodeURIComponent($("#searchStr").val());var f=$("#searchPlaceStr").val();var c=JSON.stringify({lat:curPos.x,lng:curPos.y});if(c!=""){changeLocation(c);getAndPrintInfo()}else{if(f!=""){var a={address:f,region:"fr",language:"fr"};var g=new google.maps.Geocoder();g.geocode(a,function(l,j){if(j==google.maps.GeocoderStatus.OK){var m=getPlaceFromGmapResult((l[0]))}else{var k=new Date().getTime();$("#searchStr").before("<div id='alert"+k+"' class='control-label'><i class='icon-exclamation-sign'> </i>Adresse invalide</div>");setTimeout(function(){$("#alert"+k).fadeOut()},3000)}})}}if(h!="Quoi ?"&&h!=""){searchString=h;filteredInfoArray=[];cleanFeed();$.each(infoArray,function(k,l){h=decodeURIComponent(h);var j=new RegExp("(?:^| )("+h+")","gi");if(j.test(l.title)||j.test(l.content)||j.test(l.yakCatName)||j.test(l.freeTag)||j.test(l.origin)){filteredInfoArray.push(l)}});printMapAndFeed(filteredInfoArray,1)}else{cleanFeed();searchString=null;if(infoArray.length>0){printMapAndFeed(infoArray,1)}else{getAndPrintInfo()}}if((lastSearchString==null||lastSearchString!=h)&&h.length>1){$.cookie("searchString",searchString,{expires:10000,path:"/"});var e=new Date();var b=e.setTime(e.getTime()+dateFrom*24*60*60*1000);var d={page:"feed",location:{lat:curPos.x.toString(),lng:curPos.y.toString(),},dateFrom:b.toString(),type:yakType.toString(),str:searchString};$.getJSON(conf.trackurl+"/track/user/"+user._id+"/5/"+encodeURIComponent(JSON.stringify(d)))}lastSearchString=h;$("#searchStr").removeClass("searching")});$("#newsfeed").delegate(".mapHighlighter","click",function(a){if(!$.contains($(this),a.target)&&a.target.className!="prevent-default"){getItemDetails(this)}});getAndPrintInfo()});function changeLocation(a){var b=JSON.parse(a);curPos.x=b.lat;curPos.y=b.lng}function printMapAndFeed(b,a){$.each(b,function(c,d){if(a!=1){infoArray.push(d)}if(c<10){printFeedItem(d,0,0)}});printLoadingFeedItem()}function unhighlightInfo(a,b){markerHL.setAnimation(null);markerHL.setVisible(false);if(b&&typeof(b)==="function"){b(a)}}function silentUpdater(){var a=new Date().getTime();var b="";if(yakType.inArray("5")){b="/api/geoalerts/"+curPos.x+"/"+curPos.y+"/"+rangeFromZ()+"/null/"+dateFrom+"/"+a+"/"+searchString+"/500"}else{b="/api/geoinfos/"+curPos.x+"/"+curPos.y+"/"+rangeFromZ()+"/null/"+dateFrom+"/"+a+"/"+yakType.toString()+"/"+searchString+"/500"}$.getJSON(b,function(c){if(typeof c.data!="undefined"){$.each(c.data.info,function(d,f){var e=0;$.each(infoArray,function(g,h){if(h._id==f._id){e=1}});if(e==0){printFeedItem(f,1,0);infoArray.push(f)}})}})}function getAndPrintInfo(){getHotTags(curPos,dateFrom);infoArray=[];if(typeof(yakType)=="undefined"||yakType.length==0){printEmptyFeedItem();return}var d="";if(yakType.inArray("5")){d="/api/geoalerts/"+curPos.x+"/"+curPos.y+"/"+rangeFromZ()+"/null/"+dateFrom+"/0/"+searchString+"/500"}else{d="/api/geoinfos/"+curPos.x+"/"+curPos.y+"/"+rangeFromZ()+"/null/"+dateFrom+"/0/"+yakType.toString()+"/"+searchString+"/500"}$.getJSON(d,function(e){cleanFeed();if(typeof(e.data)=="undefined"||typeof(e.data.info)=="undefined"||e.data.info.length==0){printEmptyFeedItem()}else{$.each(e.data.info,function(f,g){infoArray.push(g);if(f<10){printFeedItem(g,0,0)}});printLoadingFeedItem();if(gup("id")!=null&&gup("id")!=""){$.getJSON("/api/afeed",{id:gup("id")},function(g){infoArray.push(g.info[0]);printFeedItem(g.info[0],1,0);for(i=1;i<$(".mapHighlighterDetails[infoid="+gup("id")+"]").length;i++){$(".mapHighlighterDetails[infoid="+gup("id")+"]").eq(i).remove()}if(g.info[0].user!=undefined){var f=conf.fronturl+"/pictures/120_90/"+$(".mapHighlighterDetails[infoid="+gup("id")+"]").eq(0).attr("src");$(".mapHighlighterDetails[infoid="+gup("id")+"]").eq(0).attr("src",f)}else{var f=conf.batchurl+$(".mapHighlighterDetails[infoid="+gup("id")+"]").eq(0).find(".thumbImage img").attr("src");$(".mapHighlighterDetails[infoid="+gup("id")+"]").eq(0).find(".thumbImage img").attr("src",f)}})}}$("abbr.timeago").timeago();$("#newsfeedContent").mCustomScrollbar("update")});var c=new Date();var a=c.setTime(c.getTime()+dateFrom*24*60*60*1000);var b={page:"feed",location:{lat:curPos.x.toString(),lng:curPos.y.toString(),},dateFrom:a.toString(),type:yakType.toString(),str:searchString};$.getJSON(conf.trackurl+"/track/user/"+user._id+"/5/"+encodeURIComponent(JSON.stringify(b)))}function printFeedItem(p,m,k){var q=new Date(p.pubDate);var l=q.getDate()+"/"+(q.getMonth()+1)+"/"+q.getFullYear();q=new Date(p.dateEndPrint);var a=new Date(p.dateEndPrint);var f=a.getDate()+"/"+(a.getMonth()+1)+"/"+a.getFullYear();infoContent=$("<div />");infoContent.attr("class","infowindow mapHighlighter");infoContent.attr("infoId",p._id);if(!(typeof p.thumb==="undefined")&&p.thumb!=conf.batchurl&&p.thumb!=null&&p.thumb!=""){thumbImage=p.thumb.replace("thumb/","");var n=$("<div />");n.attr("class","thumbImage");n.append("<img src='"+thumbImage+"' />");infoContent.append(n)}var c=$("<div />");c.attr("class","yakTypeImage");c.html("<img src='/images/markers/new/type"+p.yakType+".png' />");infoContent.append(c);var d=$("<div />");d.attr("class","itemTitle");d.html(p.title.linkify());thedate=buildItemDate(p);var j=$("<div />");j.attr("class","postedBy");var h="showUserProfile(this)";if(p.origin.indexOf("@")!=0){p.origin="@"+p.origin;h="setSearchFor(this);"}if(p.yakType!=2){j.html("Posté par <a class='prevent-default' onclick='"+h+"'>"+p.origin+"</a><input type='hidden' value='"+p.user+"' /><span class='date'> - "+thedate+"</span>")}else{j.html("Posté par <a class='prevent-default' onclick='"+h+"'>"+p.origin+"</a><input type='hidden' value='"+p.user+"' />");d.append(" - <span class='dateAgenda'>"+thedate+"</span>")}infoContent.append(d);infoContent.append(j);var b="<div class='tags'>";if(p.yakCatName.length>0){for(var g=0;g<p.yakCatName.length;g++){b+='<a class="tagHashLink prevent-default" onclick="setSearchFor(this)">#'+p.yakCatName[g]+"</a> "}}if(typeof(p.freeTag)!="undefined"){for(var g=0;g<p.freeTag.length;g++){if(p.freeTag[g]!=""){b+='<a class="tagHashLink prevent-default" onclick="setSearchFor(this)">#'+p.freeTag[g]+"</a> ";if(g<p.freeTag.length-1){b+=", "}}}}b+="</div>";infoContent.append(b);if(typeof(p.address)!="undefined"&&p.address!="null"&&p.address!=""){var e="<div class='infodetail'>"+p.address+"</div>";if(user.login=="renaud.bessieres"||user.login=="dany.srour"){e+="<div class='infodetail'>"+l+" >> "+f+"</div>"}infoContent.append(e)}if(m==1){var o=$("<li />");o.attr("class","mapHighlighterDetails");o.attr("infoId",p._id);o.append(infoContent);$("#newsfeed").prepend(o)}else{var o=$("<li />");o.attr("class","mapHighlighterDetails");o.attr("infoId",p._id);o.append(infoContent);$("#newsfeed").append(o)}if(k==1){}}function printLoadingFeedItem(){$(".loadingfeeditem").hide();if(skip<infoArray.length-10){infoContent="<div class='infowindow loadingfeeditem'></div>";$("#newsfeed").append("<li class='mapHighlighterDetails'>"+infoContent+"</li>")}}function printEmptyFeedItem(){$(".emptyfeeditem").hide();if($("#typeContainer .active").length>0){infoContent="<div class='infowindow emptyfeeditem'>Aucune info !</div>"}else{infoContent="<div class='infowindow emptyfeeditem'>Il n'y a pas d'info ici !!!</div>"}$("#newsfeed").append("<li class='mapHighlighterDetails'>"+infoContent+"</li>")}function printArrayFeedItem(){skip=skip+10;var a=infoArray.slice(skip,skip+10);$.each(a,function(b,c){printFeedItem(c,0,0)});printLoadingFeedItem();$("#newsfeedContent").mCustomScrollbar("update")}function closeAllItems(){$("#newsfeed .icon-remove").trigger("click")}function getItemDetails(c){closeAllItems();var b=$(c);var a=b.attr("infoid");if(b.find(".loadingMore").length>0||b.find(".myitem").length>0){b.find(".icon-remove").remove();b.prepend("<i class='icon-remove' title='close' onclick='closemyitem(this);'></i>");b.find(".myitem").show();return}b.append('<img src="images/loader_big.gif" class="loadingMore">');$.each(infoArray,function(e,g){if(a==g._id){console.log(g);thumbImage=g.thumb.replace("thumb/","");mediumImage=thumbImage.replace("120_90","512_0");var f=createFeedPageItem(g);b.find(".loadingMore").remove();b.append(f);b.prepend("<i class='icon-remove' title='close' rel='"+thumbImage+"' onclick='closemyitem(this);'></i>");setshortUrl();setLikeSystem("map");if(g.thumbFlag==2){b.find(".thumbImage").insertAfter(b.find(".tags"));b.find(".thumbImage img").attr("src",mediumImage);b.find(".thumbImage img").addClass("mediumSizeThumb")}else{b.find(".thumbImage img").show();b.find(".infodetail").insertAfter(b.find(".tags"));$("ul#newsfeed li").removeAttr("style");$("ul#newsfeed").removeAttr("style")}b.find(".infodetail").insertAfter(b.find(".postedBy"));$("ul#newsfeed li").css("width","100%");$("ul#newsfeed").css("width","100%");$("#newsfeed li").removeClass("highlighted");b.parent().addClass("highlighted");$("#newsfeedContent").mCustomScrollbar("scrollTo",'.mapHighlighter[infoId="'+b.parent().attr("infoid")+'"]');var d={infoId:a,page:"map"};$.getJSON(conf.trackurl+"/track/user/"+user._id+"/6/"+encodeURIComponent(JSON.stringify(d)))}})}function closemyitem(b){var a=$(b).parent().parent();a.find(".thumbImage img").show();a.find(".thumbImage img").attr("src",$(b).attr("rel"));a.find(".thumbImage").insertBefore(a.find(".yakTypeImage"));a.find(".infodetail").insertAfter(a.find(".tags"));a.removeClass("currentDetails");a.addClass("infowindow");$("ul#newsfeed li").removeAttr("style");$("ul#newsfeed").removeAttr("style");a.find(".myitem").remove();a.find(".icon-remove").remove();a.attr("class","mapHighlighterDetails")}function stopScroll(){return false}function createFeedPageItem(f){var d=$("<div />");d.attr("class","myitem");content=$("<div />");content.attr("class","content");content.html("<div class='theContent'>"+f.content+"</div>");content.append("<br />");var g=$("<span />");g.attr("class","yakLikes");g.attr("rel",f._id);var b=$("<span />");b.attr("class","yakComments");b.attr("rel",f._id);setCommentText(f.yakComments.length,b);b.unbind("click").on("click",function(){if($(this).parent().find(".commentBox").length>0){return}var h=$(this);var j=$("<div />");j.attr("class","commentBox");$(this).append('<img class="loadingMore" src="images/loader_big.gif">');$.each(f.yakComments,function(k,l){j.append(drawAComment(l,h.attr("rel"),"map"))});j.append('<textarea maxlength="250" rows="3" style="z-index: 1111111111111; display: block" class="yakTextarea" placeholder="Ajouter un commentaire..." onclick="return stopScroll()"></textarea>');j.find("textarea").mouseenter(function(){j.find("textarea").focus();j.find("textarea").focus(function(){return false});j.find("textarea").unbind("click").on("click",function(){return false})});j.find("textarea").mouseleave(function(){});j.find("textarea").keypress(function(l){if(l.keyCode==13){var n=$(this).val();if(n.length>250){alert("Comments only 250...");return}var m=$(this);$(this).val("posting...Please wait");$(this).attr("disabled","disabled");var k=new Array();k.infoid=h.attr("rel");k.username=user.login;k.userid=user._id;k.comment=n;k.userthumb=user.thumb;k.date=new Date();$.post("/api/setComment",{infoId:h.attr("rel"),username:user.login,userthumb:user.thumb,comment:n.substring(0,249)},function(o){if(o.meta.code=="200"){k._id=o.meta.cid;m.val("");m.removeAttr("disabled");m.before(drawAComment(k))}})}});h.find(".loadingMore").remove();h.after(j)});var c="<i class='icon-thumbs-up'></i>&nbsp;";var e="<i class='icon-thumbs-down'></i>";if($.inArray(user._id,f.yaklikeUsersIds)>-1){c="Vous avez aimé cette info !"}if($.inArray(user._id,f.yakunlikeUsersIds)>-1){e="Vous n'avez pas aimé cette info."}if($.inArray(user._id,f.yaklikeUsersIds)>-1&&$.inArray(user._id,f.yakunlikeUsersIds)==-1){g.append("<span class='theUps'>"+f.likes+"</span> likes");g.unbind("click").on("click",function(){$(".alreadyVoted").hide();$(this).append("<span class='alreadyVoted'> Vous avez déjà donnée votre avis !</span>");setTimeout('$(".alreadyVoted").remove()',3000)})}else{if($.inArray(user._id,f.yaklikeUsersIds)==-1&&$.inArray(user._id,f.yakunlikeUsersIds)>-1){g.append("<span class='theUps'>"+f.likes+"</span> likes");g.unbind("click").on("click",function(){$(".alreadyVoted").hide();$(this).append("<span class='alreadyVoted'> Vous avez déjà donnée votre avis !</span>");setTimeout('$(".alreadyVoted").remove()',3000)})}else{g.append(c+"<span class='theUps'>"+f.likes+"</span> likes ")}}more=$("<a />");more.attr("class","more");more.attr("href",f.outGoingLink);more.attr("target","_blank");more.attr("rel",f._id);more.attr("data-toggle","data-toggle");more.html(" plus de détails...");content.append("<div class='shareMe' userid='"+user._id+"'><i style='background: none' class='icon-share' title=''><img src='/images/ftg.png' class='ftgIcon' /> </i></div>");if(typeof(f.outGoingLink)!="undefined"){content.find(".theContent").append(more)}d.append(content);d.append(g);d.append(b);if(f.origin.indexOf("@")==0){var a=$("<span />");a.attr("class","yakSpam");a.attr("rel",f._id);setSpamSystem(a);d.append(a)}return d}function rangeFromZ(){return(-1)*0.0096/1*(curPos.z)+1}function changeRange(){getAndPrintInfo()}function zFromRange(){};