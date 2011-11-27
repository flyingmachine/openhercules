App.setup ->
  App.Pages =
    activatePage: (name)->
      @pages[name].activate()
    buttons: $($(".page-selector .btn[data-page-name]").get().reverse())
    pages: {}

  class App.Page
    constructor: (name, index) ->
      App.Pages.pages[name] = @
      @index = index
      @btn   = $($(".page-selector .btn").get().reverse()[index])
      @btn.click =>
        App.sliceManager.activateSlice(name)

    activate: ->
      App.Pages.buttons.removeClass('active')
      @btn.addClass('active')
      $("#pages").css("left", "#{-840 * @index}px")

  App.Pages.buttons.each (i, el) ->
    new App.Page($(el).attr('data-page-name'), i)