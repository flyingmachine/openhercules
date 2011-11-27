class App.SliceManager
  constructor: ->
    if $("#properties-form").length
      @sliceOrder = ['list', 'settings', 'clone']
    else
      @sliceOrder = ['list', 'clone']
    @slices     = {}
    $(document).bind 'keydown', 'right', @activateNextSlice
    $(document).bind 'keydown', 'left',  @activatePrevSlice
    $(document).on   'keydown keyup keypress', @handleKey

  activateSlice: (sliceName) ->
    @activeSlice?.deactivate()
    @activeSlice = @slices[sliceName]
    @currentSliceName = sliceName
    @activeSlice.activate()

  activateNextSlice: =>
    unless @currentSliceName == _.last @sliceOrder
      currentIndex = @sliceOrder.indexOf(@currentSliceName)
      @activateSlice(@sliceOrder[currentIndex + 1])

  activatePrevSlice: =>
    unless @currentSliceName == _.first @sliceOrder
      currentIndex = @sliceOrder.indexOf(@currentSliceName)
      @activateSlice(@sliceOrder[currentIndex - 1])


  handleKey: (event) =>
    $(@activeSlice).trigger(event)

$ ->
  App.sliceManager = new App.SliceManager