App =
  # Config
  lists: null
  appId: "#app"
  backbone: {}
  data: {}
  selection: (item) ->
    if (item)
      @selected = item
    else if !@selected
      @selected = App.root.children.first()
    @selected

window.App = App

App.setup = (setupFunction) ->
  @setupFunctions ?= []

  if setupFunction
    @setupFunctions.push(setupFunction)
  else
    $ ->
      setup() for setup in App.setupFunctions


App.setup ->
  $(".cookie-user").click ->
    confirm "Are you sure? You will not be able to recover your data unless you modify your account first."
  $("#new").bind "shown", -> $("#new .name").focus()
  $("#new .primary").click -> $("#new form").submit()
  $(".modal .cancel").click -> $(this).parents(".modal").modal("hide")

