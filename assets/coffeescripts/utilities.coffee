$ ->
	#==== bootstrap function ====
	# bootstrap dropdown -> mega dropdown
	$('.dropdown.mega-dropdown a').on 'click', (event)-> 
	  $(this).parent().toggleClass('open')

	$('body').on 'click', (e)->
		if (!$('.dropdown.mega-dropdown').is(e.target) && $('.dropdown.mega-dropdown').has(e.target).length is 0 && $('.open').has(e.target).length is 0)
			$('.dropdown.mega-dropdown').removeClass('open')


	# Bootstrap Tooltip
	$('[data-toggle="tooltip"]').tooltip()