# username
# user_id
# id is list_id
# permission

class App.backbone.ListShare extends Backbone.Model
  initialize: ->
    @view = new App.backbone.ListShareView
      model: @
  url: ->
    "/users/#{@get("user_id")}/list_shares/#{@get("id")}"

  change: ->
    @save()

  appendView: ->
    $("#access tbody").append @view.render().el

  hasPermission: ->
    App.data.permissions["modify-properties"]

  save: (attrs, options) ->
    Backbone.Model.prototype.save.call(@, attrs, options) if @hasPermission();

  destroy: (options) ->
    Backbone.Model.prototype.destroy.call(@, options) if @hasPermission();

class App.backbone.ListShares extends Backbone.Collection
  model: App.backbone.ListShare

  initialize: ->
    @.bind "add", (listShare) ->
      listShare.appendView()

  addUnique: (listShare) ->
    exists = @.any (item) ->
      item.get("id") == listShare.id
    unless exists
      listShare.id = App.mainList.get("id")
      listShare.permission = "read"
      model = @.create(listShare)
      model.appendView()

class App.backbone.ListShareView extends Backbone.View
  tagName: "tr"
  className: "list-share"
  template: _.template "<td class='username'></td><td class='option read'></td><td class='option read-write'></td><td class='option none'></td>"
  events:
    "click .read"       : "setRead"
    "click .read-write" : "setReadWrite"
    "click .none"       : "delete"

  setRead: ->
    @model.set permission: "read"
    @render()

  setReadWrite: ->
    @model.set permission: "read-write"
    @render()

  delete: ->
    @model.destroy()
    @remove()

  render: ->
    $(@el).html @template()
    @$(".username").text @model.get("username")
    if @model.get("permission") == "read"
      @$(".read").addClass("selected")
    else
      @$(".read-write").addClass("selected")

    this

App.setupListSharesModal = ->
  $("#properties-form").modal
    backdrop: true
    keyboard: true

  $("#properties-form").bind 'shown', ->
    $("#properties-form .name").focus()

  $(document).bind "keyup", "p", ->
    App.Pages.activatePage('settings')

App.setupListSharesUsernameAutocomplete = ->
  $("#username").autocomplete
    source: "/users.json"
    focus: (event, ui) ->
      $("#username").val(ui.item.username)
      false
    select: (event, ui) ->
      App.listShares.addUnique(ui.item)

  $("#username").data("autocomplete")._renderItem = (ul, item) ->
    $( "<li></li>" ).data( "item.autocomplete", item ).append( "<a>" + item.username + "</a>" ).appendTo( ul );

App.setupListShares = ->
  if App.data.listShares
    App.listShares = new App.backbone.ListShares(App.data.listShares)
    for listShare in App.listShares.models
      $("#access").append(listShare.view.render().el)

    App.setupListSharesUsernameAutocomplete()
    App.setupListSharesModal()


App.setup(App.setupListShares)
