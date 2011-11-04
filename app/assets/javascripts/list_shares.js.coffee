# username
# user_id
# id is list_id
# permission

class App.backbone.ListShare extends Backbone.Model   
  change: -> @save()
  
class App.backbone.ListShares extends Backbone.Model
  model: App.backbone.ListShare
  url:   "/users/#{App.data.current_user_id}/list_shares"
    
class App.backbone.ListShareView extends Backbone.View
  tagName: "tr"
  className: "list-share"
  template: _.template "<td class='username'></td><td class='option read'></td><td class='option read-write'></td><td class='option none'></td>"
    
  render: ->
    $(@el).html @template()
    @$(".username").val @model.get("username")
    if @model.get("permission") == "read"
      @$(".read").addClass("selected")
    else
      @$(".read-write").addClass("selected")
      
    this

App.setupListShares = ->
  App.listShares = new App.backbone.ListShares(App.data.listShares)
  
  for listShare in App.listShares.model
    $("#access").append(model.view.render().el)

App.setup(App.setupListShares)
  