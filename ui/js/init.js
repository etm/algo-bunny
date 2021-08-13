$(document).ready(async function() {
  let commands  = new Commands;
  await commands.load();

  let restrictions = [];

  $('div.elements img').each((_,ele) => {
    let iname = $(ele).attr('data-type');
    let item = commands.items[iname];
    $(ele).attr('title',item.label);
    if (restrictions.length == 0) {
      $(ele).show();
    } else {
      if (restrictions.includes(iname)) {
        $(ele).show();
      }
    }
  });

  let editor = new Editor($('div.program svg'), commands);
  editor.render();

});

