# username
# user_id
# id is list_id
# permission

class App.backbone.ListShare extends Backbone.Model
  initialize: ->
    @view = new App.backbone.ListShareView
      model: @
    
  change: -> @save()
  
class App.backbone.ListShares extends Backbone.Collection
  model: App.backbone.ListShare
  url:   "/users/#{App.data.current_user_id}/list_shares"
  initialize: ->
    @.bind "add", (listShare) ->
      $("#access tbody").append listShare.view.render().el
    
class App.backbone.ListShareView extends Backbone.View
  tagName: "tr"
  className: "list-share"
  template: _.template "<td class='username'></td><td class='option read'></td><td class='option read-write'></td><td class='option none'></td>"
  
  render: ->
    $(@el).html @template()
    @$(".username").text @model.get("username")
    if @model.get("permission") == "read"
      @$(".read").addClass("selected")
    else
      @$(".read-write").addClass("selected")
      
    this

App.setupListShares = ->
  App.listShares = new App.backbone.ListShares(App.data.listShares)
  
  for listShare in App.listShares.model
    $("#access").append(model.view.render().el)
  
  $("#username").autocomplete
    source: "/users.json"

    focus: (event, ui) ->
      console.log ui
      $("#username").val(ui.item.username)
      false

    select: (event, ui) ->
      console.log ui
      App.listShares.add([ui.item])
      
  $("#username").data("autocomplete")._renderItem = (ul, item) ->
    $( "<li></li>" ).data( "item.autocomplete", item ).append( "<a>" + item.username + "</a>" ).appendTo( ul );

App.setup(App.setupListShares)
  