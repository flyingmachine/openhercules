$ ->
  $(".organizer .lists").sortable
    containment: 'parent'
    placeholder: 'drag-drop-placeholder'
    forcePlaceholderSize: true
    tolerance: 'pointer'
    start: (event, ui) ->
      $(ui.helper).addClass("dragging")
    stop: (event, ui) ->
      $(".dragging").removeClass("dragging")