function edit_in_place(){
  default_location = location.href + "/in_place_update"
  
  function opportunity_edit_loadurl(field) {
    return location.href + "/in_place_edit?_method=GET&field=" + field
  }
  
  function edit_options(options){
    default_options = {
      indicator   : "Saving...",
      tooltip     : 'Click to edit...',
      id          : 'field',
      submit      : "OK",
      cancel      : "Cancel",
      onblur      : "ignore",
      event       : "dblclick",
      placeholder : "<em>Double click to edit</em>",
      tooltip     : "Double click to edit",
      width       : "none",
      height      : "none",
      loadtype    : "GET"
    }
    
    if(options){
      $.extend(default_options, options)
    }
    
    return default_options
  }
  
  function text_area_options(field) {
    options = edit_options({
      type    : "textarea",
      height  : "none",
      style   : "display:block",
      loadurl : opportunity_edit_loadurl(field)
    });
    
    return options
  }
  
  $("#listing_url").editable(default_location, edit_options());
  $("#job_title").editable(default_location, edit_options());
  $("#location").editable(default_location, edit_options());
  $("#impression").editable(default_location, edit_options({
    loadurl : opportunity_edit_loadurl("impression"),
    type    : "select"
  }));
  $("#next_action").editable(default_location, edit_options({
    loadurl : opportunity_edit_loadurl("next_action"),
    type    : "select"
  }));
  $("#next_action_datetime").editable(default_location, edit_options({
    calendar : true
  }));
  
  $("#telecommute").editable(default_location, edit_options(
    {
      type : "select",
      data : '{"true" : "yes", "false" : "no"}'
    }
  ));
  $("#organization_url").editable(default_location, edit_options());
  
  // textareas
  $("#organization_address").editable(default_location, text_area_options("organization_address"));
  $("#organization_contact_info").editable(default_location, text_area_options("organization_contact_info"));
  $("#description").editable(default_location, edit_options({
    type    : "textarea",
    height  : "none",
    style   : "display:block",
    loadurl : opportunity_edit_loadurl("description")
  }));
  $("#listing_text").editable(default_location, edit_options({
    type    : "textarea",
    height  : "none",
    style   : "display:block",
    loadurl : opportunity_edit_loadurl("listing_text")
  }));
  
  // Feeds
  function feed_edit_location(id) {
    return location.href + "/" + id + "/in_place_update"
  }
  
  $(".feed").livequery(function(){
    this.record_id = this.id.substring(5) 
    $(".name", this)[0].feed = this
    $(".url", this)[0].feed = this
    $(".delete", this)[0].feed = this
  })
  $("#feed-list .name").livequery(function(){
    var id = $(this).parents(".feed")[0]
    $(this).editable(feed_edit_location(this.feed.record_id), edit_options())
  })
  // $("#feed-list .url").livequery(function(){
  //   var id = $(this).parents(".feed")[0].id.substring(5) 
  //   $(this).editable(feed_edit_location(this.feed.record_id), edit_options())
  // })
}
$(edit_in_place)