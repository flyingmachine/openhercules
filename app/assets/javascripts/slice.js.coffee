class App.Slice
  constructor: (options) ->
    @activate     = options.activate
    @deactivate   = options.deactivate
    @keyBindings  = options.keyBindings
    @helpSelector = options.helpSelector
    
    $(@).bind("keydown", keyCombination, callback) for own keyCombination, callback of @keyBindings
    App.setup =>
      options.setup()