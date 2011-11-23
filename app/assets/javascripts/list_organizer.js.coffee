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
      lis = $(".organizer .lists li").toArray()
      listsOrganized = ({list_id: $(li).attr("data-list-id")} for li in lis)
      App.user.set("lists_organized": listsOrganized)