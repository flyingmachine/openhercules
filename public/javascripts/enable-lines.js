$(function(){
  App.root = new App.backbone.Line();
  
  _.each(App.linesJson, function(line) {
    new App.backbone.Line(line)
  })
  
  App.mainList = new App.backbone.ListView({
    collection: App.root.children 
  });
  $("#app").append(App.mainList.render().el);
  
  App.keyBindings();
})