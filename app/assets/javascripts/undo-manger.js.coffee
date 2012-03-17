class App.UndoManager
  constructor: ->
    @states = []
    @position = 0

  addState: (state) ->
    @states[@position] = state
    @states = @states[0..@position]
    # limit to 100 items in undo history
    if @states.length > 100
      @states.shift()
    @position = states.length

  undo: ->
    unless @position == 0
      @position--
      @states[@position - 1]

  redo: ->
    unless @position = @states.length
      @position++
      @states[@position - 1]