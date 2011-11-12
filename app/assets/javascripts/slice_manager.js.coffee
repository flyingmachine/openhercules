class App.SliceManager
  constructor: ->      
    $(document).on 'keydown keyup keypress', @handleKey
    
  activateSlice: (slice) ->
    @activeSlice?.deactivate()
    @activeSlice = slice
    @activeSlice.activate()
  
  handleKey: (event) =>
    $(@activeSlice).trigger(event)
  
$ ->
  App.sliceManager = new App.SliceManager