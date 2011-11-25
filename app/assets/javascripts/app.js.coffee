App =
  # Config
  appId: "#app"
  backbone: {}
  data: {}
  selection: (item) ->
    @selected = $("#app .selected").parents("li")
    unless @selected.length
      @selected = $("#app>ol>li:first-child")
    @selected[0].view

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

  App.user = new App.backbone.User App.data.user
  $(".page-selector li.btn").twipsy
    placement: "below"
