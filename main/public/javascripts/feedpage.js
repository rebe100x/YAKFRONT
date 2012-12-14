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

			var lnglat = $.parseJSON($("#locationInput").attr("value"));
			
			var lngslatstr = "";

			if(lnglat != null)
				lngslatstr = lnglat.lat + "," + lnglat.lng;

			loadData(skip, limit, next , "", $("#SearchWhat").attr("value"), lngslatstr, yaktype, dateInterval, "");

		});
		
		function loadData(askip, alimit, next, _id, what, where, yaktype, dateInterval, cattype)
		{
			
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
						postedby.html("Posté par " + val.origin + " le " + date);
					else
						postedby.html("Posté by ananomys le " + date);
					

					title.append(postedby);
					//title.append(hot);
					
					
					img = $("<img />");
					img.attr("class", "img");
					img.attr("src", conf.backurl + val.thumb.replace("\/", "/"));
					
					outlink = $("<a />");
					outlink.attr("href", val.outGoingLink);
					outlink.attr("target", "_blank");
					outlink.html("read from source");

					content = $("<div />");
					content.attr("class", "content");
					content.html(val.content.substring(0, subSize));
					content.append(outlink);
					content.prepend(img);

					content.append("<br /><br />");
					
					type = $("<div />");
					type.attr("class", "type");
					type.html("Type: " + val.yakType);
					
					cat = $("<div />");
					cat.attr("class", "cat");
					cat.html("YakCats: " + val.yakCatName);
					
					//content.append(type);
					content.append(cat);
										
					address = $("<div />");
					address.attr("class", "address");
					address.html(val.address);


					item.append(title);
					item.append(content);
					item.append(address);
					item.append("<div class='shareMe'>Share or comment <i class='icon-share' title='Share Me'></i><i class='icon-comment'></i></div>");
					
					if(next != 1)
						$("#feedContent").prepend(item);
					else
						$("#feedContent").append(item);

					$("#resultSet").html(currentPage);
					$(".next").show();
					$("#loading").html("");

					
					
				});
				
				setClickableArea();
				setShare();
				$("abbr.timeago").timeago();
			});
		}

		function setShare(){
		   		$('.icon-comment, .icon-share').each(function(){
		   			$(this).sharrre({
						share: {
						googlePlus: true,
						facebook: true,
						twitter: true
						},
						enableTracking: true,
						buttons: {
							googlePlus: {
								url: $(this).parent().parent().find(".title").find(".more").attr("href"),
								size: 'medium'
							},

						facebook: {
							url:  $(this).parent().parent().find(".title").find(".more").attr("href"),
							layout: 'button_count'
						},

						twitter: {
							text: $(this).parent().parent().find(".content").text().substring(0, 100) + "...",
							count: 'horizontal',
							url: 'http://www.yakwala.fr'
						}					
						},
						hover: function(api, options){
							$(api.element).find('.buttons').show();
						},
						hide: function(api, options){
						$(api.element).find('.buttons').hide();
						}
					});
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