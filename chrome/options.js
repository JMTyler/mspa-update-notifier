
$(function() {
	var areNotificationsOn = jmtyler.settings.get('notifications_on');
	if (areNotificationsOn) {
		$('#radToastOn').prop('checked', true);
	} else {
		$('#radToastOff').prop('checked', true);
	}
	$('#radToast').buttonset();
	
	var doShowPageCount = jmtyler.settings.get('show_page_count');
	if (doShowPageCount) {
		$('#radShowCountOn').prop('checked', true);
	} else {
		$('#radShowCountOff').prop('checked', true);
	}
	$('#radShowCount').buttonset();
	
	var checkFrequency = jmtyler.settings.get('check_frequency');
	$('#sldFrequency').slider({
		range: 'min',
		value: checkFrequency,
		min: 1,  // TODO: could hypothetically get first and last elements from Options.map()
		max: 10,
		slide: function(event, ui) {
			$('#lblFrequency').text("every " + jmtyler.settings.map('check_frequency', ui.value).readable);
		}
	});
	$('#lblFrequency').text("every " + jmtyler.settings.map('check_frequency', $('#sldFrequency').slider('value')).readable);
	
	$('#btnSave').button();
	$('#btnSave').on('click', function() {
		var areNotificationsOn = $('#radToast :radio:checked').val() == 'on',
			doShowPageCount    = $('#radShowCount :radio:checked').val() == 'on',
			checkFrequency     = $('#sldFrequency').slider('value');
		
		jmtyler.settings.set('notifications_on', areNotificationsOn)
			.set('show_page_count', doShowPageCount)
			.set('check_frequency', checkFrequency)
			.save();
	});
});