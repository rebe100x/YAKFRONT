function disableEnterKey(e){
	var key;
	if(window.event)
		key = window.event.keyCode; //IE
	else
		key = e.which; //firefox      

	return (key != 13);
}

$(document).ready(function() {
	
	$("#postForm input").keypress(function(){
		return disableEnterKey(event);
	});

	var now = new Date();
	$('#yakTypeController').live('change', function() { 
		if($("input[name='yakType']:checked").val()==2)
			$('#eventDateController').slideDown();
		else
			$('#eventDateController').slideUp();
	});

	$( "#eventDateFrom" ).datetimepicker({
		timeFormat: 'HH:mm',
		stepHour: 1,
		stepMinute: 10,
		//defaultValue:new Date(),
		hour:now.getHours(),

	});
	$( "#eventDateEnd" ).datetimepicker({
		timeFormat: 'HH:mm',
		stepHour: 1,
		stepMinute: 10,
	});


	
});

