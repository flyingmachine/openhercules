class App.backbone.User extends Backbone.Model
  url: ->
    "/users/#{@get("id")}"

  change: -> @save()
