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
    $('div.elements img[data-type=' + iname + ']').click(()=>{
      bunny_say(item.desc);
    });
  });

  let editor = new Editor($('div.program svg'), commands);
  editor.render();

  bunny_one_liner();

  $('div.program div.bunny').click(()=>{ bunny_one_liner(); });

  $('div.program').on('click','g[element-id]',(ev)=>{
    let eid = $(ev.currentTarget).attr('element-id');
    editor.remove_item(eid);
    editor.clear();
    editor.render();
    return false;
  });
});
