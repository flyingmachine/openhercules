(function() {

}).call(this);
(function() {

}).call(this);
(function() {
  var App;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  App = {
    lists: null,
    appId: "#app",
    backbone: {},
    selection: function(item) {
      if (item) {
        this.selected = item;
      } else if (!this.selected) {
        this.selected = App.root.children.first();
      }
      return this.selected;
    }
  };
  App.backbone.List = (function() {
    __extends(List, Backbone.Model);
    function List() {
      List.__super__.constructor.apply(this, arguments);
    }
    List.prototype.change = function() {
      return this.save();
    };
    List.prototype.changeProperties = function(properties) {
      this.set($.extend(properties, {
        items: App.root.asJson().children
      }));
      return this.propertiesView.render();
    };
    List.prototype.updateItems = function() {
      return this.set({
        items: App.root.asJson().children
      });
    };
    return List;
  })();
  App.backbone.Lists = (function() {
    __extends(Lists, Backbone.Collection);
    function Lists() {
      Lists.__super__.constructor.apply(this, arguments);
    }
    Lists.prototype.model = App.backbone.List;
    Lists.prototype.url = "/lists";
    return Lists;
  })();
  App.backbone.Item = (function() {
    __extends(Item, Backbone.Model);
    function Item() {
      Item.__super__.constructor.apply(this, arguments);
    }
    Item.prototype.initialize = function() {
      var child, _i, _len, _ref, _results;
      if (this.get("parent")) {
        this.parent = this.get("parent");
        this.unset('parent', {
          silent: true
        });
      } else if (App.root) {
        this.parent = App.root;
        this.parent.addChild(this);
      }
      if (!this.get("body")) {
        this.set({
          body: ""
        }, {
          silent: true
        });
      }
      this.children = new App.backbone.ItemChildren;
      if (this.get("children")) {
        _ref = this.get("children");
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          child["parent"] = this;
          _results.push(this.addChild(new App.backbone.Item(child)));
        }
        return _results;
      }
    };
    Item.prototype.events = {
      'change': 'change'
    };
    Item.prototype.asJson = function() {
      var json;
      json = this.toJSON();
      json.children = this.children.map(function(child) {
        return child.asJson();
      });
      return json;
    };
    Item.prototype.updateList = function() {
      return App.mainList.updateItems();
    };
    Item.prototype.change = function() {
      this.view.setClasses();
      return this.view.setBody();
    };
    Item.prototype.addChild = function(child) {
      return this.children.add(child);
    };
    Item.prototype.removeChild = function(child) {
      return this.children.remove(child);
    };
    Item.prototype.insertBefore = function(ref) {
      return ref.parent.children.insertBefore(this, ref);
    };
    Item.prototype.insertAfter = function(ref) {
      return ref.parent.children.insertAfter(this, ref);
    };
    Item.prototype.moveUp = function() {
      var prev;
      if (this.previousSibling()) {
        prev = this.previousSibling();
        $(this.view.el).insertBefore(prev.view.el);
        this.parent.removeChild(this);
        return this.insertBefore(prev);
      }
    };
    Item.prototype.moveDown = function() {
      var next;
      if (this.nextSibling()) {
        next = this.nextSibling();
        $(this.view.el).insertAfter(next.view.el);
        this.parent.removeChild(this);
        return this.insertAfter(next);
      }
    };
    Item.prototype.select = function() {
      if (App.selection()) {
        App.selection().deselect();
      }
      App.selection(this);
      return this.view.select();
    };
    Item.prototype.deselect = function() {
      App.selection(null);
      return this.view.deselect();
    };
    Item.prototype.next = function() {
      var flat, i;
      flat = App.root.children.flatten();
      i = flat.indexOf(this);
      return flat[i + 1];
    };
    Item.prototype.previous = function() {
      var flat, i;
      flat = App.root.children.flatten();
      i = flat.indexOf(this);
      return flat[i - 1];
    };
    Item.prototype.previousSibling = function() {
      return this.parent.children.before(this);
    };
    Item.prototype.nextSibling = function() {
      return this.parent.children.after(this);
    };
    Item.prototype.indent = function() {
      var oldParent;
      if (this.previousSibling()) {
        oldParent = this.parent;
        this.setParent(this.previousSibling());
        oldParent.removeChild(this);
        this.parent.addChild(this);
        $(this.parent.view.childrenView.el).append(this.view.el);
        return this.save();
      }
    };
    Item.prototype.outdent = function() {
      var oldParent;
      if (this.parent !== App.root) {
        oldParent = this.parent;
        this.setParent(this.parent.parent);
        oldParent.removeChild(this);
        this.insertAfter(oldParent);
        $(this.view.el).insertAfter(oldParent.view.el);
        return this.save();
      }
    };
    Item.prototype.setParent = function(parent) {
      this.parent = parent;
      return this.set({
        'parent_id': parent.id
      });
    };
    Item.prototype.parents = function() {
      var current_parent, p;
      p = [];
      current_parent = this.parent;
      while (current_parent !== App.root) {
        p.push(current_parent);
        current_parent = current_parent.parent;
      }
      return p;
    };
    Item.prototype.remove = function() {
      var prev;
      prev = this.previous();
      if (prev) {
        prev.select();
      }
      $(this.view.el).remove();
      this.parent.children.remove(this);
      return this.updateList();
    };
    Item.prototype.toggleStatus = function() {
      if (this.get('status') === 'complete') {
        return this.setIncomplete();
      } else {
        return this.setComplete();
      }
    };
    Item.prototype.setIncomplete = function() {
      var parent, _i, _len, _ref;
      this.set({
        'status': 'incomplete'
      });
      _ref = this.parents();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        parent = _ref[_i];
        parent.setIncomplete();
      }
      this.view.status.attr('checked', false);
      this.view.setClasses();
      return this.save();
    };
    Item.prototype.setComplete = function() {
      var child, _i, _len, _ref;
      this.set({
        'status': 'complete'
      });
      _ref = this.children.flatten();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        child.setComplete();
      }
      this.view.status.attr('checked', true);
      this.view.setClasses();
      return this.save();
    };
    Item.prototype.save = function() {
      return this.updateList();
    };
    return Item;
  })();
  App.backbone.ItemChildren = (function() {
    __extends(ItemChildren, Backbone.Collection);
    function ItemChildren() {
      ItemChildren.__super__.constructor.apply(this, arguments);
    }
    ItemChildren.prototype.model = App.backbone.Item;
    ItemChildren.prototype.before = function(item) {
      return this.inRelationToItem(item, -1);
    };
    ItemChildren.prototype.after = function(item) {
      return this.inRelationToItem(item, 1);
    };
    ItemChildren.prototype.insertBefore = function(toInsert, ref) {
      var i;
      toInsert.parent.removeChild(toInsert);
      this.add(toInsert);
      this.models.pop();
      i = this.indexOf(ref);
      return this.models.splice(i, 0, toInsert);
    };
    ItemChildren.prototype.insertAfter = function(toInsert, ref) {
      var i;
      toInsert.parent.removeChild(toInsert);
      this.add(toInsert);
      this.models.pop();
      i = this.indexOf(ref);
      return this.models.splice(i + 1, 0, toInsert);
    };
    ItemChildren.prototype.inRelationToItem = function(item, relativeIndex) {
      var nextItem;
      nextItem = this.at(this.indexOf(item) + relativeIndex);
      return nextItem;
    };
    ItemChildren.prototype.flatten = function() {
      var results;
      results = [];
      this.each(function(item) {
        results.push(item);
        if (item.children.length) {
          return _.each(item.children.flatten(), function(child) {
            return results.push(child);
          });
        }
      });
      return results;
    };
    return ItemChildren;
  })();
  App.backbone.ItemFormView = (function() {
    __extends(ItemFormView, Backbone.View);
    function ItemFormView() {
      ItemFormView.__super__.constructor.apply(this, arguments);
    }
    ItemFormView.prototype.tagName = "form";
    ItemFormView.prototype.template = _.template("<input type='text' value='' />");
    ItemFormView.prototype.events = {
      submit: "submit",
      keydown: "handleKey",
      "keydown input": "handleInputKey",
      "blur input": "stopEditing"
    };
    ItemFormView.prototype.submit = function() {
      this.stopEditing();
      App.mainList.view.newItem();
      return false;
    };
    ItemFormView.prototype.stopEditing = function() {
      var val;
      val = this.$("input").val();
      this.model.set({
        body: val
      });
      this.model.save();
      return this.model.view.switchToShow();
    };
    ItemFormView.prototype.handleKey = function(event) {
      var keyCode;
      keyCode = event.keyCode.toString();
      if (keyCode === "27") {
        return this.stopEditing();
      } else if (keyCode === "13") {
        this.stopEditing();
        return App.mainList.view.newItem();
      }
    };
    ItemFormView.prototype.handleInputKey = function(event) {
      var keyCode, next, prev;
      keyCode = event.keyCode.toString();
      if (keyCode === "27") {
        this.stopEditing();
        return false;
      } else if (keyCode === "38") {
        prev = App.selection().previous();
        if (prev) {
          this.stopEditing();
          prev.select();
          prev.view.switchToForm();
        }
        return false;
      } else if (keyCode === "40") {
        next = App.selection().next();
        if (next) {
          this.stopEditing();
          next.select();
          next.view.switchToForm();
        }
        return false;
      }
    };
    ItemFormView.prototype.render = function() {
      $(this.el).html(this.template());
      this.$("input:first").val(this.model.get("body"));
      return this;
    };
    return ItemFormView;
  })();
  App.backbone.ItemView = (function() {
    __extends(ItemView, Backbone.View);
    function ItemView() {
      ItemView.__super__.constructor.apply(this, arguments);
    }
    ItemView.prototype.tagName = "li";
    ItemView.prototype.template = _.template("<div class='item'><div class='body'></div></div>");
    ItemView.prototype.initialize = function() {
      return this.model.view = this;
    };
    ItemView.prototype.events = {
      "change input[type=\"checkbox\"]:first": "changeStatus",
      "click .item.selected": "preventFurtherClicks",
      "click .item:first": "click",
      "dblclick .item:first": "switchToForm"
    };
    ItemView.prototype.changeStatus = function() {
      if (this.status.is(":checked")) {
        return this.model.setComplete();
      } else {
        return this.model.setIncomplete();
      }
    };
    ItemView.prototype.click = function() {
      return this.model.select();
    };
    ItemView.prototype.preventFurtherClicks = function(e) {
      return e.stopImmediatePropagation();
    };
    ItemView.prototype.dblclick = function() {
      return this.switchToForm();
    };
    ItemView.prototype.setClasses = function() {
      this.item.attr("class", "item");
      this.item.addClass(this.model.get("status"));
      this.item.addClass(this.model.get("item_type"));
      if (App.selected === this.model) {
        return this.item.addClass("selected");
      }
    };
    ItemView.prototype.select = function() {
      return this.item.addClass("selected");
    };
    ItemView.prototype.deselect = function() {
      if (this.$("form").length) {
        this.form.submit();
      }
      return this.item.removeClass("selected");
    };
    ItemView.prototype.setBody = function() {
      return this.body.html(this.model.get("body") + "&nbsp;");
    };
    ItemView.prototype.render = function() {
      var that;
      that = this;
      $(this.el).html(this.template(this.model.toJSON()));
      this.item = $(this.el).children(".item");
      this.body = this.item.children(".body");
      this.setBody();
      this.status = $("<input type='checkbox' />");
      if (this.model.get("status") === "complete") {
        this.status.attr("checked", true);
      } else {
        this.status.attr("checked", false);
      }
      $(this.item).prepend(this.status);
      this.childrenView = new App.backbone.ItemChildrenView({
        model: this.model
      });
      $(this.el).append(this.childrenView.render().el);
      this.setClasses();
      return this;
    };
    ItemView.prototype.switchToForm = function() {
      this.form = new App.backbone.ItemFormView({
        model: this.model
      });
      this.body.replaceWith(this.form.render().el);
      return $(this.form.el).find("input").focus();
    };
    ItemView.prototype.switchToShow = function() {
      this.setBody();
      $(this.form.el).replaceWith(this.body);
      return this.model.select();
    };
    return ItemView;
  })();
  App.backbone.ItemChildrenView = (function() {
    __extends(ItemChildrenView, Backbone.View);
    function ItemChildrenView() {
      ItemChildrenView.__super__.constructor.apply(this, arguments);
    }
    ItemChildrenView.prototype.tagName = "ul";
    ItemChildrenView.prototype.className = "children";
    ItemChildrenView.prototype.render = function() {
      var that;
      that = this;
      this.model.children.each(function(child) {
        var lv;
        lv = new App.backbone.ItemView({
          model: child
        });
        return $(that.el).append(lv.render().el);
      });
      return this;
    };
    return ItemChildrenView;
  })();
  App.backbone.ListPropertiesView = (function() {
    __extends(ListPropertiesView, Backbone.View);
    function ListPropertiesView() {
      ListPropertiesView.__super__.constructor.apply(this, arguments);
    }
    ListPropertiesView.prototype.render = function() {
      this.$(".name").text(this.model.get("name"));
      $(".list-" + (this.model.get("id")) + " a").text(this.model.get("name"));
      this.$(".notes").text(this.model.get("notes"));
      return this;
    };
    return ListPropertiesView;
  })();
  App.backbone.ListPropertiesFormView = (function() {
    __extends(ListPropertiesFormView, Backbone.View);
    function ListPropertiesFormView() {
      ListPropertiesFormView.__super__.constructor.apply(this, arguments);
    }
    ListPropertiesFormView.prototype.events = {
      "click .primary": "submit",
      "form submit": "submit",
      "click .cancel": "cancel"
    };
    ListPropertiesFormView.prototype.render = function() {
      this.$(".name").val(this.model.get("name"));
      this.$(".notes").val(this.model.get("notes"));
      return this;
    };
    ListPropertiesFormView.prototype.submit = function() {
      this.model.changeProperties({
        name: this.$(".name").val(),
        notes: this.$(".notes").val()
      });
      $("#properties-form").modal("hide");
      return false;
    };
    ListPropertiesFormView.prototype.cancel = function() {
      this.render();
      return $("#properties-form").modal("hide");
    };
    return ListPropertiesFormView;
  })();
  App.backbone.ListView = (function() {
    __extends(ListView, Backbone.View);
    function ListView() {
      ListView.__super__.constructor.apply(this, arguments);
    }
    ListView.prototype.tagName = "ul";
    ListView.prototype.className = "item-list";
    ListView.prototype.initialize = function() {
      return _.bindAll(this, "selectPrevious", "selectNext", "switchItem", "toggleStatus", "moveSelectionUp", "moveSelectionDown", "indentItem", "outdentItem", "newItem", "deleteItem");
    };
    ListView.prototype.selectPrevious = function() {
      var _ref, _ref2;
      if (!App.selected && App.selection()) {
        App.selection().select();
      } else {
        if ((_ref = App.selection()) != null) {
          if ((_ref2 = _ref.previous()) != null) {
            _ref2.select();
          }
        }
      }
      return false;
    };
    ListView.prototype.selectNext = function() {
      if (!App.selected && App.selection()) {
        App.selection().select();
      } else {
        if (App.selection() && App.selection().next()) {
          App.selection().next().select();
        }
      }
      return false;
    };
    ListView.prototype.switchItem = function() {
      return App.selection().view.switchToForm();
    };
    ListView.prototype.toggleStatus = function() {
      App.selection().toggleStatus();
      return false;
    };
    ListView.prototype.moveSelectionUp = function(event) {
      App.selection().moveUp();
      return false;
    };
    ListView.prototype.moveSelectionDown = function(event) {
      App.selection().moveDown();
      return false;
    };
    ListView.prototype.indentItem = function() {
      return App.selection().indent();
    };
    ListView.prototype.outdentItem = function() {
      return App.selection().outdent();
    };
    ListView.prototype.newItem = function(placement) {
      var item, itemView, parent, selection;
      selection = App.selection();
      if (selection) {
        parent = selection.parent;
      } else {
        parent = App.root;
      }
      item = new App.backbone.Item({
        parent: parent
      });
      itemView = new App.backbone.ItemView({
        model: item
      });
      itemView.render();
      if (selection) {
        if (placement === "previous") {
          item.insertBefore(selection);
          $(item.view.el).insertBefore(selection.view.el);
        } else {
          if (selection.children.size() > 0) {
            selection = selection.children.first();
            item.insertBefore(selection);
            $(item.view.el).insertBefore(selection.view.el);
          } else {
            if (placement === "indent") {
              item.insertAfter(selection);
              item.indent();
            } else {
              item.insertAfter(selection);
              $(item.view.el).insertAfter(selection.view.el);
            }
          }
        }
      } else {
        $(this.el).append(itemView.el);
      }
      item.select();
      return _.defer(function() {
        return App.selection().view.switchToForm();
      });
    };
    ListView.prototype.deleteItem = function() {
      App.selection().remove();
      return false;
    };
    ListView.prototype.render = function() {
      var that;
      that = this;
      this.collection.each(function(item) {
        var lv;
        if (!item.get("parent_id")) {
          lv = new App.backbone.ItemView({
            model: item
          });
          return $(that.el).append(lv.render().el);
        }
      });
      return this;
    };
    return ListView;
  })();
  App.keyBindings = function() {
    $(document).bind("keydown", "up", App.mainList.view.selectPrevious);
    $(document).bind("keydown", "down", App.mainList.view.selectNext);
    $(document).bind("keydown", "esc", App.mainList.view.switchItem);
    $(document).bind("keydown", "ctrl+up", App.mainList.view.moveSelectionUp);
    $(document).bind("keydown", "ctrl+down", App.mainList.view.moveSelectionDown);
    $(document).bind("keydown", "space", App.mainList.view.toggleStatus);
    $(document).bind("keydown", "return", function() {
      return App.mainList.view.newItem();
    });
    $(document).bind("keydown", "ctrl+return", function() {
      return App.mainList.view.newItem("indent");
    });
    $(document).bind("keydown", "shift+return", function() {
      return App.mainList.view.newItem("previous");
    });
    $(document).bind("keydown", "backspace", App.mainList.view.deleteItem);
    $(document).bind("keydown", "del", App.mainList.view.deleteItem);
    $(document).bind("keydown", "x", App.mainList.view.indentItem);
    $(document).bind("keydown", "z", App.mainList.view.outdentItem);
    return $(document).bind("keydown", "p", function() {
      return $("#project").focus();
    });
  };
  App.setup = function(list) {
    return $(function() {
      App.setupList(list);
      $(App.appId).append(App.mainList.view.render().el);
      App.keyBindings();
      return App.mainList.view.selectNext();
    });
  };
  App.setupList = function(list) {
    App.lists = new App.backbone.Lists([
      {
        id: list._id,
        name: list.name,
        notes: list.notes,
        items: list.items
      }
    ]);
    App.mainList = App.lists.at(0);
    App.setupItems(list.items);
    App.mainList.view = new App.backbone.ListView({
      collection: App.root.children
    });
    App.mainList.propertiesView = new App.backbone.ListPropertiesView({
      model: App.mainList,
      el: $("#properties")
    });
    return App.mainList.propertiesFormView = new App.backbone.ListPropertiesFormView({
      model: App.mainList,
      el: $("#properties-form")
    });
  };
  App.setupItems = function(items) {
    App.root = new App.backbone.Item();
    return _.each(items, function(item) {
      return new App.backbone.Item(item);
    });
  };
  $(function() {
    $(".cookie-user").click(function() {
      return confirm("Are you sure? You will not be able to recover your data unless you modify your account first.");
    });
    $("#new").bind("shown", function() {
      return $("#new .name").focus();
    });
    $("#new .primary").click(function() {
      return $("#new form").submit();
    });
    return $("#new .cancel").click(function() {
      return $("#new").modal("hide");
    });
  });
  window.App = App;
}).call(this);
// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//

$(document).ajaxSend(function(e, xhr, options) {
  var token = $("meta[name='csrf-token']").attr("content");
  xhr.setRequestHeader("X-CSRF-Token", token);
});
