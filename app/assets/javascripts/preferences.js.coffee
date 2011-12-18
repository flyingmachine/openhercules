App.setup ->
  $("#commands .toggle").click ->
    preferences = App.user.get("preferences")
    preferences ?= {}
    if preferences["show-commands"]
      preferences["show-commands"] = false
      $("#commands table").hide()
      $("#commands .toggle").text("show")
    else
      preferences["show-commands"] = true
      $("#commands table").show()
      $("#commands .toggle").text("hide")
    App.user.set(preferences:preferences)
    App.user.save()
    false
