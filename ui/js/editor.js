$(document).ready(function() {
  let commands  = new Commands;

  commands.load();
  commands.load_elements($('div.elements'));
});
