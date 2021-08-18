var active_del = '';
var active_del_timeout;

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

  // one liners
  $('div.program svg').on('click','g[element-type=bunny]',()=>{ bunny_one_liner(); });

  // click element in editor, say and show delete
  $('div.program svg').on('click','g[element-group=graph] g[element-id]',(ev)=>{
    if (active_del_timeout) {
      clearTimeout(active_del_timeout);
    }
    if (active_del != '') {
      $('div.program svg g[element-group=drop] g[element-type=delete][element-id=' + active_del + ']').removeClass('active');
    }
    let eid = $(ev.currentTarget).attr('element-id');
    if (active_del == eid) {
      active_del = '';
    } else {
      active_del = eid;
      $('div.program svg g[element-group=drop] g[element-type=delete][element-id=' + eid + ']').addClass('active');
      let iname = $(ev.currentTarget).attr('element-type');
      let item = commands.items[iname];
      bunny_say(item.label);
      active_del_timeout = setTimeout(()=>{
        $('div.program svg g[element-group=drop] g[element-type=delete][element-id].active').removeClass('active');
        active_del = '';
      },12000);
    }
    return false;
  });

  // click delete
  $('div.program svg').on('click','g[element-group=drop] g[element-type=delete].active',(ev)=>{
    let eid = $(ev.currentTarget).attr('element-id');
    editor.remove_item(eid);
    editor.render();
    active_del = '';
    $(ev.currentTarget).removeClass('active');
    bunny_say_reset();
    return false;
  });

  // click drag and drop
  $('div.elements').on('dragstart','img[data-type]',(ev)=>{
    ev.originalEvent.dataTransfer.setData("text/plain", $(ev.currentTarget).attr('data-type'));
  });
  $('div.program').on('drop','g[element-type=add]',(ev)=>{
    ev.preventDefault();
    ev.stopPropagation();
    let eid = $(ev.currentTarget).attr('element-id');
    let eop = $(ev.currentTarget).attr('element-op');
    let ety = ev.originalEvent.dataTransfer.getData("text/plain");
    editor.insert_item(eid,eop,ety);
    editor.render();
  });
  $('div.program').on('dragover','g[element-type=add]',(ev)=>{
    ev.preventDefault();
    ev.stopPropagation();
    $(ev.currentTarget).addClass('active');
  });
  $('div.program').on('dragleave','g[element-type=add]',(ev)=>{
    ev.preventDefault();
    ev.stopPropagation();
    $(ev.currentTarget).removeClass('active');
  });
});
