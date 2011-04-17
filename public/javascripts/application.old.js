BaseForm = $.klass(Remote.Form, {
	initialize: function($super, options) {
		$super();
		this.submit_button = $(":submit", this.element);
		this.submit_button.original_value = this.submit_button.val();
		this.spinner = $(".ajax-loader", this.element);
		this.options.url = this.element.attr('action') + ".js"
	},

	beforeSend: function() {
		this.spinner.show();
		this.disable();
	},
	
	complete: function() {
		this.spinner.hide();
		this.enable();
	},
  
  
  disable: function() {
		this.submit_button.attr('disabled', 'disabled').val('Submitting...');
	},
	
	enable: function() {
    this.submit_button.attr('disabled', false).attr('value',this.submit_button.original_value);
	},
	
	error: function() {
	  alert("There was a problem submitting your form.")
	}
})

// give lines modelly capabilities
// "container" and "recordId"

$.fn.container = function() {
  return $(this).parent("li");
}

$.fn.parentLine = function() {
  var parentContainer = $(this).parents("li")[1]
  return parentContainer ? $(parentContainer).children(".line") : null
}

$.fn.recordId = function() {
  return $(this)[0].id.substring(5);
}

// allow lines to have "focus"
$(function(){
  var lineSelector = ".line";
  var focusedLineSelector = ".line.focus";
  var focusSelector = ".focus";
  var containerSelector = "li";
  
  $(lineSelector).livequery(function(){
    this.recordId = function() {
      return this.id.substring(5);
    }
  })
  
  function giveFocus(event) {
    $(".focus").removeClass("focus")
    $(this).addClass("focus")
    return false;
  }
  
  $(lineSelector).livequery('focus', giveFocus)
  
  $(lineSelector).livequery("click", function(event) {
    $(this).focus()
  })
  
  // focus
  function lineWithFocus() {
    if($(focusedLineSelector).size() == 0) {
      return null;
    } else {
      return $(focusedLineSelector)
    }
  }
  
  function firstLine() {
    return $(".line:first");
  }
  
  function allLines() {
    return $(lineSelector)
  }
  
  function previousLine() {
    if(!lineWithFocus()) {
      return null;
    } else {
      var index = $.inArray(lineWithFocus()[0], allLines());
      var el = allLines()[index - 1];
      return el ? $(el) : null
    }
  }
  
  function nextLine() {
    if(!lineWithFocus()) {
      return null;
    } else {
      var index = $.inArray(lineWithFocus()[0], allLines());
      var el = allLines()[index + 1];
      return el ? $(el) : null
    }
  }
  
  function previousLineAtCurrentLevel() {
    if(!lineWithFocus()) {
      return null;
    } else {
      var jq = lineWithFocus().container().prev(containerSelector)
      return jq.size() > 0 && jq.children(lineSelector);
    }
  }
  
  function nextLineAtCurrentLevel() {
    if(!lineWithFocus()) {
      return null;
    } else {
      var jq = lineWithFocus().container().next(containerSelector)
      return jq.size() > 0 && jq.children(lineSelector);
    }
  }
  
  // key bindings - navigation
  $(document.documentElement).bind('keydown', 'up', focusOnPrevious)
  $(document.documentElement).bind('keydown', 'down', focusOnNext)
  
  function focusOnFirstLine() {
    if(!lineWithFocus()) {
      firstLine().focus();
      return true;
    } 
    return false;
  }
  
  function focusOnPrevious() {
    if(!focusOnFirstLine() && previousLine()) {
      previousLine().focus()
    }
    return false;
  }
  
  function focusOnNext() {
    if(!focusOnFirstLine() && nextLine()) {
      nextLine().focus()
    }
    return false;
  }
  
  // key bindings - new row
  $(document).bind('keydown', 'esc', switchLine)
  $(lineSelector + " :text").livequery(function(){
    $(this).bind('keydown', 'esc', switchLine)
  })
  
  function newLine(){
    var idOfNext;
    
    if(nextLineAtCurrentLevel()) {
      idOfNext = nextLineAtCurrentLevel().recordId();
    }
    
    if(!lineWithFocus() && allLines().size() > 0) {
      idOfNext = allLines()[0].recordId();
    }
    
    var parentId;
    if(lineWithFocus() && lineWithFocus().parentLine()) {
      parentId = lineWithFocus().parentLine().recordId();
    }
    
    var container = $("#newLineTemplate").tmpl({
      "idOfNext": idOfNext,
      "parentId": parentId
    })
    
    if(lineWithFocus()) {
      lineWithFocus().container().after(container);
      giveFocus.apply(nextLineAtCurrentLevel());
    } else {
      $(".lines").prepend(container);
      giveFocus.apply(firstLine());
    }
    
    lineWithFocus().find("input").focus()
    return false;
  }
  
  // key bindings - moving
  $(document).bind('keydown', 'ctrl+up', moveUp)
  $(document).bind('keydown', 'ctrl+down', moveDown)
  
  function updateOrder( direction) {
    $.ajax({
      url: moveUrl(),
      type: "POST",
      data: {
        direction: direction,
        _method: "PUT"
      }
    })
  }
  
  function moveUp() {
    var reference = previousLineAtCurrentLevel();
    if(reference){
      lineWithFocus().container().insertBefore(reference.container());
      updateOrder('up');
    }
  }
  
  function moveDown() {
    var reference = nextLineAtCurrentLevel();
    if(reference){
      lineWithFocus().container().insertAfter(reference.container());
      updateOrder('down');
    }
  }
  
  // change status
  $(document).bind('keydown', 'space', switchStatus)
  function switchStatus() {
    if(lineWithFocus()) {
      var newStatus, oldStatus;
      if(lineWithFocus().hasClass("complete")) {
        oldStatus = "complete";
        newStatus = "incomplete";
      } else {
        oldStatus = "incomplete";
        newStatus = "complete";
      }
      
      $.post(updateUrl(),{
          line:{status:newStatus},
          _method:"PUT"
      })
      
      lineWithFocus().removeClass(oldStatus).addClass(newStatus)
    }
    return false;
  }
  
  // form/text switching
  $(document).bind('keydown', 'return', newLine)
  
  //dblclick
  $(lineSelector).livequery(function(){
    if($(this).children("input").size() == 0) {
      $(this).dblclick(switchLine)
    }
  })
  
  function switchLine() {
    focusOnFirstLine()
    if(lineWithFocus()) {
      if(lineWithFocus().hasClass("show")) {
        switchToForm();
      } else {
        switchToShow();
      }
    }
    return false;
  }
  
  function switchToForm() {
    $.get(editUrl(), {focus:"focus"}, function(data){
      lineWithFocus().replaceWith(data);
      lineWithFocus().find(":text").focus()
    })
  }
  
  function switchToShow() {
    var $form = lineWithFocus().find("form")
    $form.data("switching", true)
    $form.trigger("submit")
  }
  
  // delete record
  $(document).bind('keydown', 'backspace', deleteLine)
  $(document).bind('keydown', 'del', deleteLine)
  function deleteLine() {
    if(lineWithFocus()) {
      var lineToDelete = lineWithFocus();
      $.post(deleteUrl(), {_method:"DELETE"}, function(){
        if(nextLine()) {
          focusOnNext()
        } else if(previousLine()) {
          focusOnPrevious()
        }
        lineToDelete.container().remove();
      })
    }
    return false;
  }
  
  // nesting
  // if a ul doesn't exist when nesting, create it
  // change parent id
  // if no previous line within the ul, ignore
  $(document).bind('keydown', "x", indentLine)
  $(document).bind('keydown', "z", outdentLine)
  
  function indentLine() {
    if(lineWithFocus() && previousLineAtCurrentLevel()) {
      if(previousLineAtCurrentLevel().container().children("ul").size()== 0) {
        previousLineAtCurrentLevel().container().append("<ul></ul>") 
      }
      var ul = previousLineAtCurrentLevel().container().children("ul");
      ul.append(lineWithFocus().container());
      updateParent();
    }
  }
  
  function outdentLine() {
    if(lineWithFocus() && lineWithFocus().parents(containerSelector)[1]) {
      lineWithFocus().container().insertAfter(lineWithFocus().parents(containerSelector)[1]);
      updateParent();
    }
  }
  
  function updateParent() {
    var parentId = "root"
    if(lineWithFocus().parentLine()) {
      parentId = lineWithFocus().parentLine().recordId();
    } 
    
    var referenceId = previousLineAtCurrentLevel() ? previousLineAtCurrentLevel().recordId() : null
    
    $.ajax({
      url: reparentUrl(),
      type: 'POST',
      data: {
        parent_id : parentId,
        reference_id : referenceId,
        _method : "PUT"
      }
    })
  }
  
  // urls
  var urlBase = "/lines"
  function showUrl() {
    return urlBase + "/" + lineWithFocus().recordId()
  }
  
  function editUrl() {
    return showUrl() + "/edit";
  }
  
  function updateUrl() {
    return showUrl();
  }
  
  function moveUrl() {
    return showUrl() + "/move";
  }

  function reparentUrl() {
    return showUrl() + "/reparent";
  }
    
  function deleteUrl() {
    return showUrl();
  }
  
  function createUrl() {
    return urlBase;
  }
  
  function newUrl() {
    return urlBase + "/new"
  }
  
  // form
  LineForm = $.klass(BaseForm, {
    success: function(response, result) {
      var html = $(response)
      html.addClass("focus")
      
      var $form = $(this.element)
      var switching = $form.data("switching")
      
      $form.parents(lineSelector).replaceWith(html)
      
      if(!switching) {
        newLine();
      }
    }
  })
  
  $("form.new_line, form.edit_line").attach(LineForm)
})