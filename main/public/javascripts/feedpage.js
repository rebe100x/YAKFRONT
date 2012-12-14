Date.prototype.toLongFrenchFormat = function ()
{
	var months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
	var date = this.getDate();
	if (date < 10)
	{
		date = "0" + date;	
	}
	var output = date + " " + months[this.getMonth()] + " " + this.getFullYear();
	return output;
}


		
		var limit = mainConf.searchParams.limit;
		var yakImages = new Array ( 
				"/images/yakfav.png", 
				"/images/markers/type1.png", 
				"/images/markers/type2.png", 
				"/images/markers/type3.png", 
				"/images/markers/type4.png", 
				"/images/markers/type5.png" 
			);
		var subSize = mainConf.searchParams.subSize;
		var currentPage = 1;

		$(document).ready(function() {

			//setInterval("setRefreshNews()", 30000);

			$('.typeahead').typeahead();

			$('.btn-group1').button();

			triggerSearch(currentPage, 0);
		});

		$(".btn-group1").click(function(){
			setTimeout(function(){ triggerSearch(currentPage, 0) }, 1000);
			
		});

		$(".next").click(function(){

			currentPage = currentPage + 1;

			var skip = (currentPage - 1)*limit;

			triggerSearch(currentPage, 1);
			
			//var height = $('#feedContent')[0].scrollHeight;

			//$("html, body").animate({ scrollTop: $(document).height() }, 1000);
		});
		
		$(".searchButton").click(function(event, currentpage, next){

			if(event.which)
			{
				currentPage = 1;
				$("#feedContent").html("");
			}

			var skip = (currentPage - 1)*limit;

			var yaktype = "";

			var dateInterval = "";

			if($("#daynumber").val() =="" || $("#daynumber2").val() == "")
			{
				dateInterval = "3,3";
			}
			else
			{
				dateInterval = $("#daynumber2").val() + "," + $("#daynumber").val();
			}
			
			$(".searchTypes .active").each(function(){
				yaktype += $(this).attr("type") + ",";
			});

			var geoLocation = "";
			$("#myfavplace li").each(function(){
				var lng = $(this).attr("lng");
				var lat = $(this).attr("lat");	
				geoLocation += lat + "," + lng + "-";
			});
			
			
			var lngslatstr = "";

			

			loadData(skip, limit, next , "", $("#SearchWhat").attr("value"), geoLocation, yaktype, dateInterval, "");

		});
		
		function loadData(askip, alimit, next, _id, what, where, yaktype, dateInterval, cattype)
		{
			//alert(where);
			if (!next) {
				$("#feedContent").html("loading...");
			};
			//console.log(conf);
			if(typeof(what)==='undefined') what = '';
			if(typeof(where)==='undefined') where = '';
			if(typeof(yaktype)==='undefined') yaktype = '';
			if(typeof(cattype)==='undefined') cattype = '';
			if(typeof(next)==='undefined') next = 0;


			var currentPage = parseInt($("#resultSet").html().trim());

			currentPage = currentPage + 1;

			var skip = (currentPage - 1)*limit;

			if (next == 1)
			{
				$(".next").hide();

				$("#loading").html("loading...");

			}

		
			
			$.getJSON('/api/feeds', { skip: askip, limit: alimit,  yaktype: yaktype, _id: _id, what: what, where: where, dateInterval: dateInterval, cattype: cattype, next: next} ,function(data) {
				var len = data.info.length;
				
				if(len == 0)
					$("#newsLoader").css("visibility", "hidden");

				if(next == 1 && data.info.length == 0)
				{
					$("#loading").html("no more results to load");
					return;
				}
				if (!next) {
					$("#feedContent").html("");
				};
				var item, title, content, address, more, postedby, date, type, cat, img, outlink, hot, ago, yakimage;
				
				$.each(data.info, function(key,val) {

					item = $("<div />");
					item.attr("class", "myitem");

					more = $("<a />");
					more.attr("class", "more");
					more.attr("href", "news/afeed?id=" + val._id);
					more.attr("rel", val._id);
					//var shorturl = return(get_short_url("http://www.yakwala.fr/news/afeed/?id=" + val._id));
					//alert(shorturl);
					more.attr("data-toggle", "data-toggle");
					more.html(val.title);



					title = $("<div />");
					title.attr("class", "title");
					title.html("<img class='PersonImg' src='" + "/images/yakfav.png"+ "' />");
					title.append(more);


					
					postedby = $("<div />");
					postedby.attr("class", "postedby");

					hot = $("<div />");
					hot.attr("class", "hot");

					hot.append("<div class='hotLevel' style='width: " + val.heat + "%'></div>");
					
					ago = $("<abbr />");
					ago.attr("class", "timeago");
					ago.css("float", "right");
					ago.attr("title", val.pubDate);

					yakimage = $("<div />");
					yakimage.html("<img class='yakImg' src='" + yakImages[val.yakType] + "' />");

					title.append(ago);
					title.append(yakimage);

					date = new Date(val.pubDate).toLongFrenchFormat();
					if(val.origin != null)
						postedby.html("Posté par @" + val.origin + " le " + date);
					else
						postedby.html("Posté by @ananomys le " + date);
					postedby.html(postedby.html().replace(/@(\S*)/g,'<a href="news/map/search/@$1">@$1</a>'))
					
					title.append(postedby);
					//title.append(hot);
					
					
					img = $("<img />");
					img.attr("class", "img");
					img.attr("src", conf.backurl + val.thumb.replace("\/", "/"));
					
					outlink = $("<div />");
					outlink.html("<a></a>");
					outlink.find("a").attr("href", val.outGoingLink);
					outlink.find("a").attr("target", "_blank");
					outlink.find("a").html("read from source");

					readmore = $("<a />");
					readmore.attr("class", "expand");
					readmore.css("cursor", "pointer");
					readmore.css("marginLeft", "12px");
					readmore.click(function(){
						var loading = $("<span />");
						loading.html("loading...");
						var readmore1 = $(this);
						readmore1.after(loading);
						readmore1.css("visibility", "hidden");
						$.getJSON('/api/afeed', { id: val._id} ,function(data) {
							
							readmore1.parent().html(data.info[0].content);

						});	
					});
					readmore.html("+");
					


					content = $("<div />");
					content.attr("class", "content");
					content.html("<div class='theContent'>" + val.content.substring(0, subSize) + "</div>");
					
					content.prepend(img);
					content.find(".theContent").append(readmore);

					content.append("<br /><br />");
					
					type = $("<div />");
					type.attr("class", "type");
					type.html("Type: " + val.yakType);
					
					cat = $("<div />");
					cat.attr("class", "cat");
					//alert(val.yakCatName);
					var yakCatNames = "";
					$.each(val.yakCatName, function(key, val){
						yakCatNames += "#" + val + " "
					});

					yakCatNames = yakCatNames.replace(/#(\S*)/g,'<a href="news/map/search/%23$1">#$1</a>');

					cat.html("YakCats: <b>" + yakCatNames + "</b>");
					
					//content.append(type);
					content.append(cat);
										
					freetags = $("<div />");
					freetags.attr("class", "freetags");
					//alert(val.yakCatName);
					var freetagNames = "";
					$.each(val.freeTag, function(key, val){
						freetagNames += "#" + val + " "
					});


					freetagNames = freetagNames.replace(/#(\S*)/g,'<a href="news/map/search/%23$1">#$1</a>');

					freetags.html("Tags: <b>" + freetagNames + "</b>");
					
					content.append(freetags)

					content.append(outlink);

					address = $("<div />");
					address.attr("class", "address");
					address.html(val.address);


					item.append(title);
					item.append(content);
					item.append(address);
					item.append("<div class='shareMe'>Share or comment <i class='icon-share' title='Share Me'></i></div>");
					

					if(next != 1)
						$("#feedContent").prepend(item);
					else
						$("#feedContent").append(item);

					$("#resultSet").html(currentPage);
					$(".next").show();
					$("#loading").html("");

					
					
				});
				
				setClickableArea();
				setshortUrl();
				
				$("abbr.timeago").timeago();
			});
		}

		function setShare(el){
		   		
		   			//alert($(this).parent().parent().find(".title").find(".more").attr("title"));
		   			//console.log(el.parent().parent().find(".icon-share"));
		   			el.parent().parent().find(".icon-share").sharrre({
						share: {
						googlePlus: true,
						facebook: true,
						twitter: true
						},
						enableTracking: true,
						buttons: {
							googlePlus: {
								url: el.parent().parent().find(".title").find(".more").attr("href"),
								size: 'medium'
							},

						facebook: {
							url:  el.parent().parent().find(".title").find(".more").attr("href"),
							layout: 'button_count'
						},

						twitter: {
							//text: el.parent().parent().find(".content").text().substring(0, 100) + "...",
							text: "J'ai vu ca dans YAKWALA..." + el.parent().parent().find(".content").find(".cat").find("b").text(),
							count: 'horizontal',
							url: el.parent().parent().find(".title").find(".more").attr("title")
						}					
						},
						hover: function(api, options){
							$(api.element).find('.buttons').show();
						},
						hide: function(api, options){
						$(api.element).find('.buttons').hide();
						}
				
		   		});
		   		
		 
		}

		function triggerSearch(currentPage, ismore)
		{
			$('.searchButton').trigger('click', [currentPage, ismore]);
		}

		function setClickableArea()
		{
			$(".more").click(function(e){

				e.preventDefault();

				var relid = $(this).attr("rel");

				$("#myModal").html("");

				$("#myModal").load("/news/loadingModal", function(){

					$("#myModal").modal();

					$('#myModal').on('shown', function () {
						$.getJSON('/api/afeed', { id: relid} ,function(data) {

							$("#myModalLabel").html(data.info[0].title);

							$(".modal-body").html("<div>" + data.info[0].content + "</div>");

						});	
					})
				});
				
			});
		}
		

		function setRefreshNews()
		{
			
			if($("#newsLoader").css("visibility") == "visible")
				return;
			else
				{
					
					$("#newsLoader").css("visibility", "visible");

					$("#newsLoader").click(function(){

						var _id = $("#feedContent .more").eq(0).attr("rel");
						//alert(_id);

						$(".graybg").attr("class", "myitem");

						$("#newsLoader").html('Downloading please wait <i class="icon-download"></i>');

						var what = $("#locationInput").val();
						var where = $("#SearchWhere").val();
						var yaktype = "";
						$(".searchTypes active").each(function(){
							yaktype += $(this).attr("type") + ",";
						});
			
						loadData(0, 0, limit, 2, what , where, yaktype);

						//loadData(0, 0, limit, 2, _id, 1);

						$("#newsLoader").html('More recent news to load click here to refresh <i class="icon-refresh"></i>');

						$("#newsLoader").css("visibility", "hidden");

					});
				}
		}

		function setshortUrl()
		{

			$(".more").each(function(){
				var more = $(this);
				
				$.getJSON("https://api-ssl.bitly.com/v3/shorten?", 
		        { 
		            "format": "json",
		            "apiKey": "R_99c6f442bb006c1b26237dd9ef91ddda",
		            "login": "o_5ko6l8pajb",
		            "longUrl": "http://www.yakwala.fr/news/feed/?id=" + more.attr("rel")
		        }, function(data){
		        	more.attr("title", data.data.url);
		        	setShare(more);
		        }
		        
    			);
			});
		    
		}
