class App.Slice
  constructor: (options) ->
    @activate     = options.activate if options.activate
    @deactivate   = options.deactivate if options.deactivate
    @keyBindings  = options.keyBindings
    @helpSelector = options.helpSelector
    @name         = options.name
    
    $(@).bind("keydown", keyCombination, callback) for own keyCombination, callback of @keyBindings
    App.setup =>
      App.sliceManager.slices[@name] = @
      options.setup?()
  
  activate: ->
    
  deactivate: ->