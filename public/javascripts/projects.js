App.setupProjectSwitcher = function() {
  $("#project").change(function(){
    var val = $(this).val()
    switch(val) {
      case 'new':
      window.location = '/projects/new';
      break;
      
      case 'edit':
      window.location += '/edit'
      break;
      
      case 'delete':
      var answer = confirm("Are you sure you want to delete this project?")
      if(answer) {
        $("#delete").submit()
      }
      break;
      
      default:
      window.location = '/projects/' + val
      break;
    }
  })
}

App.selectProjectName = function() {
  $("#project_name").focus()
}