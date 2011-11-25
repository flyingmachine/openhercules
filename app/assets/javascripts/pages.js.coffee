App.setup ->
  App.Pages =
    activatePage: (name)->
      @pages[name].activate()
    buttons: $(".page-selector .btn")
    pages: {}

  class App.Page
    constructor: (name, index) ->
      App.Pages.pages[name] = @
      @index = index
      @btn   = $($(".page-selector .btn").get().reverse()[index])
      @btn.twipsy
        placement: 'below'
      @btn.click =>
        App.sliceManager.activateSlice(name)

    activate: ->
      App.Pages.buttons.removeClass('active')
      @btn.addClass('active')
      $("#pages").css("left", "#{-840 * @index}px")

  new App.Page('list', 0)
  new App.Page('settings', 1)