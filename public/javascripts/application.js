// Initial Setup: App.setupLines(linesJson)
// where linesJson is an array of objects with the attributes:
//   id: Integer
//   body: String
//   status: 'incomplete'|'complete'
//   parent_id: Integer - parent must be 
//   line_type: String - each line will have its line type added as a class
// example:
//   [{"status":"incomplete","body":"note 1","line_type":"note","id":1764,"parent_id":null},
//   {"status":"incomplete","body":"note 2","line_type":"note","id":1765,"parent_id":null},
//   {"status":"incomplete","body":"note 3","line_type":"note","id":1766,"parent_id":null},
//   {"status":"incomplete","body":"note 4 - child","line_type":"note","id":1767,"parent_id":1766},
//   {"status":"complete","body":"note 5","line_type":"note","id":1771,"parent_id":null}]
// 
// "REST" api:
// POST   /lines              - create; return line JSON
// PUT    /lines/:id          - update; return line JSON
// PUT    /lines/:id/reparent - change parent of line; returnn nothing
// PUT    /lines/:id/move?direction=[up|down] - move the line up or down; return nothing
// DELETE /lines/:id          - delete
//
// If you don't want to use "/lines", change App.url
// Needs container div with id #appl; change App.appId

var App = {
  // Config
  appId: "#app",
  url: "/lines",
  
  //Not config
  backbone: {},
  initializationMap: {},
  
  selection: function(line) {
    if (line) {
      this.selected = line
    } else if (!this.selected) {
      this.selected = App.root.children.first();
    }
    return this.selected
  },
  
  projectId: /[^\/]+$/.exec(location.href)[0]
}

App.backbone.Line = Backbone.Model.extend({
  initialize: function(){
    App.initializationMap[this.id] = this
    
    if (this.get("parent_id")) {
      var parent = App.initializationMap[this.get("parent_id")]
      if(typeof(parent) == "undefined") {
        console.log(this.get("id"))
        console.log(this.get("parent_id"))
      }
      this.parent = parent;
      this.parent.addChild(this)
    } else if (this.get("parent")) {
      this.parent = this.get("parent");
      this.parent.addChild(this)
      this.unset('parent', {silent:true})
    } else if (App.root) {
      this.parent = App.root
      this.parent.addChild(this)
    }
    
    if (!this.get("body")) {
      this.set({body:""}, {silent:true})
    }
    
    this.children = new App.backbone.LineChildren;
  },
  
  events: {
    'change': 'change'
  },
  
  change: function() {
    this.view.setClasses();
    this.view.setBody();
  },
  
  
  // children
  addChild: function(child) {
    this.children.add(child)
  },
  
  removeChild: function(child) {
    this.children.remove(child)
  },
  
  // move
  insertBefore: function(ref) {
    ref.parent.children.insertBefore(this, ref)
  },
  
  insertAfter: function(ref) {
    ref.parent.children.insertAfter(this, ref)
  },
  
  moveUp: function() {  
    if (this.previousSibling()) {
      var prev = this.previousSibling();
      $(this.view.el).insertBefore(prev.view.el)
      this.parent.removeChild(this);
      this.insertBefore(prev);
      
      this.saveMove('up');
    }
  },
  
  moveDown: function() {
    if (this.nextSibling()) {
      var next = this.nextSibling();
      $(this.view.el).insertAfter(next.view.el)
      this.parent.removeChild(this);
      this.insertAfter(next);
      
      this.saveMove('down');
    }
  },
  
  saveMove: function(direction) {
    $.ajax({
      url: this.url() + '/move',
      type: "POST",
      data: {
        direction: direction,
        _method: "PUT"
      }
    })
  },
  
  // selecting
  select: function() {
    if (App.selection()) {
      App.selection().deselect()
    }
    App.selection(this);
    this.view.select()
  },
  
  deselect: function() {
    App.selection(null);
    this.view.deselect();
  },
  
  // siblings
  next: function() {
    var flat = App.root.children.flatten();
    var i = flat.indexOf(this);
    return flat[i+1];
  },
  
  previous: function() {
    var flat = App.root.children.flatten();
    var i = flat.indexOf(this);
    return flat[i-1];
  },
  
  previousSibling: function() {
    return this.parent.children.before(this);
  },
  
  nextSibling: function() {
    return this.parent.children.after(this);
  },
    
  // parents
  indent: function(skipSave) {
    if (this.previousSibling()) {
      var oldParent = this.parent
      this.setParent(this.previousSibling());
      oldParent.removeChild(this);
      this.parent.addChild(this)
      $(this.parent.view.childrenView.el).append(this.view.el)
      
      if(!skipSave) this.saveNewParent();
    }
  },
  
  outdent: function(skipSave) {
    if (this.parent != App.root) {
      var oldParent = this.parent;
      this.setParent(this.parent.parent);
      oldParent.removeChild(this);
      this.insertAfter(oldParent);
      $(this.view.el).insertAfter(oldParent.view.el);
      
      if(!skipSave) this.saveNewParent();
    }
  },
  
  setParent: function(parent) {
    this.parent = parent;
    this.set({'parent_id': parent.id})
  },
  
  saveNewParent: function() {
    var referenceId = this.previousSibling() && this.previousSibling().id
    $.ajax({
      url: this.url() + '/reparent',
      type: 'POST',
      data: {
        parent_id : this.parent.id,
        reference_id : referenceId,
        _method : "PUT"
      }
    })
  },
  
  parents: function() {
    var p = []
    var current_parent = this.parent;
    while(current_parent != App.root) {
      p.push(current_parent);
      current_parent = current_parent.parent;
    }
    return p;
  },
  
  // goodbye
  remove: function() {
    var prev = this.previous();
    this.destroy({
      success: function(model, response){
        if (prev) {
          prev.select();
        }
        $(model.view.el).remove();
      }
    })
  },
  
  // status
  toggleStatus: function() {
    if (this.get('status') == 'complete') {
      this.setIncomplete();
    } else {
      this.setComplete();
    }
  },
  
  setIncomplete: function() {
    this.set({'status':'incomplete'})
    _.each(this.parents(), function(parent){
      parent.setIncomplete();
    })
    this.view.status.attr('checked', false)
    this.view.setClasses();
    this.save()
  },
  
  setComplete: function() {
    this.set({'status':'complete'})
    _.each(this.children.flatten(), function(child){
      child.setComplete();
    })
    this.view.status.attr('checked', true)
    this.view.setClasses();
    this.save();
  }
})

App.backbone.LineChildren = Backbone.Collection.extend({
  model: App.backbone.Line,
  url: App.url,
  
  before: function(line) {
    return this.inRelationToLine(line, -1);
  },
  
  after: function(line) {
    return this.inRelationToLine(line, 1);
  },
  
  insertBefore: function(toInsert, ref) {
    toInsert.parent.removeChild(toInsert)
    this.add(toInsert)
    this.models.pop()
    var i = this.indexOf(ref);
    this.models.splice(i, 0, toInsert)
  },
  
  insertAfter: function(toInsert, ref) {
    toInsert.parent.removeChild(toInsert)
    this.add(toInsert)
    this.models.pop()
    var i = this.indexOf(ref);
    this.models.splice(i + 1, 0, toInsert)
  },
  
  //TODO refactor with inRelationToSelection
  inRelationToLine: function(line, relativeIndex) {
    var nextLine = this.at(this.indexOf(line) + relativeIndex) 
    return nextLine;
  },
  
  // returns all lines and their children recursively in a flat array
  flatten: function() {
    var results = [];
    this.each(function(line){
      results.push(line);
      if(line.children.length) {
        _.each(line.children.flatten(), function(child){
          results.push(child)
        })
      }
    })
    return results;
  }
})

App.backbone.LineFormView = Backbone.View.extend({
  tagName: "form",
  template: _.template("<input type='text' value='' />"),
  
  events: {
    'submit': 'submit',
    'keydown': 'handleKey',
    'keydown input': 'handleInputKey'
  },
  
  submit: function() {
    var that = this;
    var prev = this.model.previous() && this.model.previous().id
    var val = this.$("input").val();
    
    this.model.set({body:val}, {silent:true});
    this.model.view.switchToShow();
    
    // TODO why is it necessary to defer?
    // TODO don't like project id handling
    // Actually save back to db
    _.defer(
      function() {
        that.model.save({body:val, id_of_previous:prev, project_id:App.projectId}, {
          success:function(model, response){
            model.set(response);
          }
        })
      }
    )
    return false;
  },
  
  // navigate while editing; remain editing
  handleKey: function(event) {
    if (event.keyCode == '27') {
      this.submit();
    } else if (event.keyCode == '13') {
      this.submit();
      App.mainList.newLine();
    } 
  },
  
  handleInputKey: function(event) {
    if (event.keyCode == '38') { // up
      var prev = App.selection().previous()
      if(prev) {
        this.submit();
        prev.select();
        prev.view.switchToForm()
      }
      return false;
    } else if (event.keyCode == '40') { //down
      var next = App.selection().next()
      if(next) {
        this.submit();
        next.select();
        next.view.switchToForm()
      }
      return false;
    }
  },
  
  render: function() {
    $(this.el).html(this.template());
    this.$("input:first").val(this.model.get("body"))
    return this;
  }
})

App.backbone.LineView = Backbone.View.extend({
  tagName: "li",
  template: _.template("<div class='line'><div class='body'></div></div>"),
  
  initialize: function() {
    this.model.view = this;
  },
  
  events: {
    'change input[type="checkbox"]:first': 'changeStatus',
    'click .line:first': 'click',
    'dblclick .line:first': 'switchToForm'
  },
  
  changeStatus: function() {
    if(this.status.is(':checked')) {
      this.model.setComplete();
    } else {
      this.model.setIncomplete();
    }
  },
  
  click: function() {
    this.model.select();
  },
  
  dblclick: function() {
    this.switchToForm();
  },
  
  setClasses: function() {
    this.line.attr('class', 'line')
    this.line.addClass(this.model.get("status"))
    this.line.addClass(this.model.get("line_type"))
    if (App.selected == this.model) {
      this.line.addClass('selected')
    }
  },
  
  select: function() {
    this.line.addClass('selected')
  },
  
  deselect: function() {
    if (this.$("form").length) {
      this.form.submit();
    }
    this.line.removeClass('selected')
  },
  
  setBody: function() {
    this.body.html(this.model.get('body') + "&nbsp;")
  },
  
  render: function() {
    var that = this;
    $(this.el).html(this.template(this.model.toJSON()));
    
    this.line = $(this.el).children(".line")
    this.body = this.line.children(".body")
    this.setBody();
    
    this.status = $("<input type='checkbox' />")
    if (this.model.get('status') == 'complete') {
      this.status.attr('checked', true);
    } else {
      this.status.attr('checked', false);
    }
    
    $(this.line).prepend(this.status);
    
    this.childrenView = new App.backbone.LineChildrenView({model:this.model});
    $(this.el).append(this.childrenView.render().el)
    
    this.setClasses();
    
    return this;
  },
  
  switchToForm: function() {
    this.form = new App.backbone.LineFormView({model:this.model})
    this.body.replaceWith(this.form.render().el)
    $(this.form.el).find("input").focus()
  },
  
  switchToShow: function() {
    $(this.form.el).replaceWith(this.body)
    this.model.select();
  }
})

App.backbone.LineChildrenView = Backbone.View.extend({
  tagName: "ul",
  className: "children",
  
  render: function() {
    var that = this;
    this.model.children.each(function(child){
      var lv = new App.backbone.LineView({model:child});
      $(that.el).append(lv.render().el)
    })
    return this;
  }
})

// handle key bindings:
// up
// down
// indent
// outdent
// delete line
App.backbone.ListView = Backbone.View.extend({
  tagName: "ul",
  className: "line-list",
  
  initialize: function() {
    _.bindAll(this, 'selectPrevious', 'selectNext', 'switchLine', 'toggleStatus', 'moveSelectionUp', 'moveSelectionDown', 'indentLine', 'outdentLine', 'newLine', 'deleteLine')
  },
  
  // navigation
  selectPrevious: function() {
    if (!App.selected && App.selection()) {
      App.selection().select();
    } else if (App.selection() && App.selection().previous()) {
      App.selection().previous().select();
    }
    return false;
  },
  
  selectNext: function() {
    if (!App.selected && App.selection()) {
      App.selection().select();
    } else if (App.selection() && App.selection().next()) {
      App.selection().next().select();
    }
    return false;
  },
  
  // edit line
  switchLine: function() {
    App.selection().view.switchToForm();
  },
  
  toggleStatus: function() {
    App.selection().toggleStatus();
    return false;
  },
  
  
  // move line
  moveSelectionUp: function(event) {
    App.selection().moveUp();
    return false;
  },
  
  moveSelectionDown: function(event) {
    App.selection().moveDown();
    return false;
  },
  
  indentLine: function() {
    App.selection().indent();
  },
  
  outdentLine: function() {
    App.selection().outdent();
  },
    
  // create
  newLine: function(placement) {
    var parent;
    var selection = App.selection()
    
    if (selection) {
      parent = selection.parent;
    } else {
      parent = App.root
    }
    
    var line = new App.backbone.Line({parent:parent});
    var lineView = new App.backbone.LineView({model:line})
    lineView.render();
        
    if (selection) {
      if (placement == 'indent') {
        line.insertAfter(selection)
        line.indent(true);
      } else if (placement == 'previous') {
        line.insertBefore(selection)
        $(line.view.el).insertBefore(selection.view.el)
      } else {
        line.insertAfter(selection)
        $(line.view.el).insertAfter(selection.view.el)
      }
    } else {
      $(this.el).append(lineView.el)
    }
    
    line.select()
    _.defer(function(){App.selection().view.switchToForm()})
  },
  
  //
  deleteLine: function() {
    App.selection().remove();
    return false;
  },
  
  render: function() {
    var that = this;
    this.collection.each(function(line){
      if (!line.get("parent_id")) {
        var lv = new App.backbone.LineView({model:line});
        $(that.el).append(lv.render().el)
      }
    })
    return this;
  }
})

App.keyBindings = function(){
  $(document).bind('keydown', 'up',           App.mainList.selectPrevious)
  $(document).bind('keydown', 'down',         App.mainList.selectNext)
  $(document).bind('keydown', 'esc',          App.mainList.switchLine)
  $(document).bind('keydown', 'ctrl+up',      App.mainList.moveSelectionUp)
  $(document).bind('keydown', 'ctrl+down',    App.mainList.moveSelectionDown)
  $(document).bind('keydown', 'space',        App.mainList.toggleStatus)
  $(document).bind('keydown', 'return',       function(){App.mainList.newLine()})
  $(document).bind('keydown', 'ctrl+return',  function(){App.mainList.newLine('indent')})
  $(document).bind('keydown', 'shift+return', function(){App.mainList.newLine('previous')})
  $(document).bind('keydown', 'backspace',    App.mainList.deleteLine)
  $(document).bind('keydown', 'del',          App.mainList.deleteLine)
  $(document).bind('keydown', "x",            App.mainList.indentLine)
  $(document).bind('keydown', "z",            App.mainList.outdentLine)
  $(document).bind('keydown', "p",            function(){$("#project").focus()})
}

App.setupLines = function(linesJson) {
  $(function(){
    App.root = new App.backbone.Line();

    _.each(linesJson, function(line) {
      new App.backbone.Line(line)
    })

    App.mainList = new App.backbone.ListView({
      collection: App.root.children 
    });
    $(App.appId).append(App.mainList.render().el);

    App.keyBindings();
    App.mainList.selectNext();
  })
}

$(function(){
  App.setupProjectSwitcher();
  App.selectProjectName();
  
  $(".cookie-user").click(function(){return confirm("Are you sure? You will not be able to recover your data unless you modify your account first.")})
})