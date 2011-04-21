// Initial Setup: App.setupItems(itemsJson)
// where itemsJson is an array of objects with the attributes:
//   id: Integer
//   body: String
//   status: 'incomplete'|'complete'
//   parent_id: Integer - parent must be 
//   item_type: String - each item will have its item type added as a class
// example:
//   [{"status":"incomplete","body":"note 1","item_type":"note","id":1764,"parent_id":null},
//   {"status":"incomplete","body":"note 2","item_type":"note","id":1765,"parent_id":null},
//   {"status":"incomplete","body":"note 3","item_type":"note","id":1766,"parent_id":null},
//   {"status":"incomplete","body":"note 4 - child","item_type":"note","id":1767,"parent_id":1766},
//   {"status":"complete","body":"note 5","item_type":"note","id":1771,"parent_id":null}]
// 
// "REST" api:
// POST   /items              - create; return item JSON
// PUT    /items/:id          - update; return item JSON
// PUT    /items/:id/reparent - change parent of item; returnn nothing
// PUT    /items/:id/move?direction=[up|down] - move the item up or down; return nothing
// DELETE /items/:id          - delete
//
// If you don't want to use "/items", change App.url
// Needs container div with id #appl; change App.appId

var App = {
  // Config
  appId: "#app",
  
  //Not config
  backbone: {},
  
  selection: function(item) {
    if (item) {
      this.selected = item
    } else if (!this.selected) {
      this.selected = App.root.children.first();
    }
    return this.selected
  },
  
  projectId: /[^\/]+$/.exec(location.href)[0]
}

App.backbone.List = Backbone.Model.extend({
  change: function() {
    this.save();
  },
  
  updateItems: function() {
    this.set({items: App.root.asJson().children})
  }
})

App.backbone.Lists = Backbone.Collection.extend({
  model: App.backbone.List,
  url:   "/lists"
})

App.backbone.Item = Backbone.Model.extend({
  initialize: function(){
    if (this.get("parent")) {
      this.parent = this.get("parent");
      this.unset('parent', {silent:true})
    } else if (App.root) {
      this.parent = App.root
      this.parent.addChild(this)
    }
    
    if (!this.get("body")) {
      this.set({body:""}, {silent:true})
    }
    
    this.children = new App.backbone.ItemChildren;
    if (this.get("children")) {
      var that = this;
      _.each(this.get("children"), function(childObject) {
        childObject["parent"] = that;
        that.addChild(new App.backbone.Item(childObject))
      })
    }
  },
    
  events: {
    'change': 'change'
  },
  
  asJson: function() {
    var json = this.toJSON();
    json.children = this.children.map(function(child){return child.asJson()});
    return json;
  },
  
  updateList: function() {
    App.mainList.updateItems();
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
    }
  },
  
  moveDown: function() {
    if (this.nextSibling()) {
      var next = this.nextSibling();
      $(this.view.el).insertAfter(next.view.el)
      this.parent.removeChild(this);
      this.insertAfter(next);
    }
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
    }
  },
  
  outdent: function(skipSave) {
    if (this.parent != App.root) {
      var oldParent = this.parent;
      this.setParent(this.parent.parent);
      oldParent.removeChild(this);
      this.insertAfter(oldParent);
      $(this.view.el).insertAfter(oldParent.view.el);
    }
  },
  
  setParent: function(parent) {
    this.parent = parent;
    this.set({'parent_id': parent.id})
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
  },
  
  save: function() {
    this.updateList();
  }
})

App.backbone.ItemChildren = Backbone.Collection.extend({
  model: App.backbone.Item,
  
  before: function(item) {
    return this.inRelationToItem(item, -1);
  },
  
  after: function(item) {
    return this.inRelationToItem(item, 1);
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
  inRelationToItem: function(item, relativeIndex) {
    var nextItem = this.at(this.indexOf(item) + relativeIndex) 
    return nextItem;
  },
  
  // returns all items and their children recursively in a flat array
  flatten: function() {
    var results = [];
    this.each(function(item){
      results.push(item);
      if(item.children.length) {
        _.each(item.children.flatten(), function(child){
          results.push(child)
        })
      }
    })
    return results;
  }
})

App.backbone.ItemFormView = Backbone.View.extend({
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
    
    this.model.set({body:val});
    this.model.save();
    this.model.view.switchToShow();
    
    // TODO why is it necessary to defer?
    // TODO don't like project id handling
    // Actually save back to db
    return false;
  },
  
  // navigate while editing; remain editing
  handleKey: function(event) {
    if (event.keyCode == '27') {
      this.submit();
    } else if (event.keyCode == '13') {
      this.submit();
      App.mainList.view.newItem();
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

App.backbone.ItemView = Backbone.View.extend({
  tagName: "li",
  template: _.template("<div class='item'><div class='body'></div></div>"),
  
  initialize: function() {
    this.model.view = this;
  },
  
  events: {
    'change input[type="checkbox"]:first': 'changeStatus',
    'click .item:first': 'click',
    'dblclick .item:first': 'switchToForm'
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
    this.item.attr('class', 'item')
    this.item.addClass(this.model.get("status"))
    this.item.addClass(this.model.get("item_type"))
    if (App.selected == this.model) {
      this.item.addClass('selected')
    }
  },
  
  select: function() {
    this.item.addClass('selected')
  },
  
  deselect: function() {
    if (this.$("form").length) {
      this.form.submit();
    }
    this.item.removeClass('selected')
  },
  
  setBody: function() {
    this.body.html(this.model.get('body') + "&nbsp;")
  },
  
  render: function() {
    var that = this;
    $(this.el).html(this.template(this.model.toJSON()));
    
    this.item = $(this.el).children(".item")
    this.body = this.item.children(".body")
    this.setBody();
    
    this.status = $("<input type='checkbox' />")
    if (this.model.get('status') == 'complete') {
      this.status.attr('checked', true);
    } else {
      this.status.attr('checked', false);
    }
    
    $(this.item).prepend(this.status);
    
    this.childrenView = new App.backbone.ItemChildrenView({model:this.model});
    $(this.el).append(this.childrenView.render().el)
    
    this.setClasses();
    
    return this;
  },
  
  switchToForm: function() {
    this.form = new App.backbone.ItemFormView({model:this.model})
    this.body.replaceWith(this.form.render().el)
    $(this.form.el).find("input").focus()
  },
  
  switchToShow: function() {
    this.setBody();
    $(this.form.el).replaceWith(this.body)
    this.model.select();
  }
})

App.backbone.ItemChildrenView = Backbone.View.extend({
  tagName: "ul",
  className: "children",
  
  render: function() {
    var that = this;
    this.model.children.each(function(child){
      var lv = new App.backbone.ItemView({model:child});
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
// delete item
App.backbone.ListView = Backbone.View.extend({
  tagName: "ul",
  className: "item-list",
  
  initialize: function() {
    _.bindAll(this, 'selectPrevious', 'selectNext', 'switchItem', 'toggleStatus', 'moveSelectionUp', 'moveSelectionDown', 'indentItem', 'outdentItem', 'newItem', 'deleteItem')
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
  
  // edit item
  switchItem: function() {
    App.selection().view.switchToForm();
  },
  
  toggleStatus: function() {
    App.selection().toggleStatus();
    return false;
  },
  
  
  // move item
  moveSelectionUp: function(event) {
    App.selection().moveUp();
    return false;
  },
  
  moveSelectionDown: function(event) {
    App.selection().moveDown();
    return false;
  },
  
  indentItem: function() {
    App.selection().indent();
  },
  
  outdentItem: function() {
    App.selection().outdent();
  },
    
  // create
  newItem: function(placement) {
    var parent;
    var selection = App.selection()
    
    if (selection) {
      parent = selection.parent;
    } else {
      parent = App.root
    }
    
    var item = new App.backbone.Item({parent:parent});
    var itemView = new App.backbone.ItemView({model:item})
    itemView.render();
        
    if (selection) {
      if (placement == 'indent') {
        item.insertAfter(selection)
        item.indent(true);
      } else if (placement == 'previous') {
        item.insertBefore(selection)
        $(item.view.el).insertBefore(selection.view.el)
      } else {
        item.insertAfter(selection)
        $(item.view.el).insertAfter(selection.view.el)
      }
    } else {
      $(this.el).append(itemView.el)
    }
    
    item.select()
    _.defer(function(){App.selection().view.switchToForm()})
  },
  
  //
  deleteItem: function() {
    App.selection().remove();
    return false;
  },
  
  render: function() {
    var that = this;
    this.collection.each(function(item){
      if (!item.get("parent_id")) {
        var lv = new App.backbone.ItemView({model:item});
        $(that.el).append(lv.render().el)
      }
    })
    return this;
  }
})

App.keyBindings = function(){
  $(document).bind('keydown', 'up',           App.mainList.view.selectPrevious)
  $(document).bind('keydown', 'down',         App.mainList.view.selectNext)
  $(document).bind('keydown', 'esc',          App.mainList.view.switchItem)
  $(document).bind('keydown', 'ctrl+up',      App.mainList.view.moveSelectionUp)
  $(document).bind('keydown', 'ctrl+down',    App.mainList.view.moveSelectionDown)
  $(document).bind('keydown', 'space',        App.mainList.view.toggleStatus)
  $(document).bind('keydown', 'return',       function(){App.mainList.view.newItem()})
  $(document).bind('keydown', 'ctrl+return',  function(){App.mainList.view.newItem('indent')})
  $(document).bind('keydown', 'shift+return', function(){App.mainList.view.newItem('previous')})
  $(document).bind('keydown', 'backspace',    App.mainList.view.deleteItem)
  $(document).bind('keydown', 'del',          App.mainList.view.deleteItem)
  $(document).bind('keydown', "x",            App.mainList.view.indentItem)
  $(document).bind('keydown', "z",            App.mainList.view.outdentItem)
  $(document).bind('keydown', "p",            function(){$("#project").focus()})
}

App.setup = function(list) {
  $(function(){
    App.setupList(list)
    $(App.appId).append(App.mainList.view.render().el);

    App.keyBindings();
    App.mainList.view.selectNext();
  })
}

App.setupList = function(list) {
  // TODO use extend; only need this to set id
  App.lists = new App.backbone.Lists([{id: list._id.$oid, name: list.name, notes: list.notes, items: list.items}]);
  App.mainList = App.lists.at(0)
  App.setupItems(list.items);
  App.mainList.view = new App.backbone.ListView({
    collection: App.root.children 
  });
}

App.setupItems = function(items) {
  App.root = new App.backbone.Item();
  _.each(items, function(item) {
    new App.backbone.Item(item)
  })
}

$(function(){
  App.setupProjectSwitcher();
  App.selectProjectName();
  
  $(".cookie-user").click(function(){return confirm("Are you sure? You will not be able to recover your data unless you modify your account first.")})
})