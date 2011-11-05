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
