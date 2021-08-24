var active_del = '';
var active_del_timeout;

var field;

$(document).ready(async function() {
  let assets  = new Assets;
  await assets.load();

  let q = $.parseQuerySimple();
  let level = q.level ? q.level : '';

  let editor = new Editor($('div.program svg'), assets);
  editor.render();

  field = new Field($('div.field svg'), assets, level);
  if (!(await field.load_level())) {
    return;
  }
  field.render();


  // show some elements
  $('div.elements img').each((_,ele) => {
    let iname = $(ele).attr('data-type');
    let item = assets.commands[iname];
    $(ele).attr('title',item.label);
    if (field.elements.length == 0) {
      $(ele).show();
    } else {
      if (field.elements.includes(iname)) {
        $(ele).show();
      }
    }
    $('div.elements img[data-type=' + iname + ']').click(()=>{
      bunny_say(item.desc);
    });
  });

  // say initial thing
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
      let item = assets.commands[iname];
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
  $('div.field svg').on('mousedown','g.tile',(ev)=>{
    console.log(ev);
  });
  $('div.field svg').on('mousedown','foreignObject div',(ev)=>{
    var left = $(window).scrollLeft();
    var top = $(window).scrollTop();
    $('div.field svg foreignObject div').css('display: none');
    console.log(document.elementFromPoint(ev.pageX-left, ev.pageY-top));
    // if (event.isTrusted) {
    //   // Manually forward element to the canvas
    //   const mouseEvent = new MouseEvent(ev.type, ev);
    //   $('div.field svg g.tile')[0].dispatchEvent(mouseEvent);
    //   mouseEvent.stopPropagation();
    // }
  //   ev.type = "dragstart";
  //   ev.target = $('div.elements img:first')[0];
  //   ev.dataTransfer = new DataTransfer();
  //   $('div.elements img[data-type]').trigger(ev);
  //   ev.preventDefault();
  //   ev.stopPropagation();
  });
  $('div.elements').on('dragstart','img[data-type]',(ev)=>{
    if (ev.dataTransfer) { // the forward drag events, can be removed.
      ev.dataTransfer.effectAllowed = 'uninitialized';
      ev.dataTransfer.setData("text/plain", $(ev.currentTarget).attr('data-type'));
      ev.dataTransfer.setDragImage(ev.currentTarget, 0, 0);
    } else {
      ev.originalEvent.dataTransfer.setData("text/plain", $(ev.currentTarget).attr('data-type'));
      ev.originalEvent.dataTransfer.setDragImage(ev.originalEvent.srcElement, 28, 0);
    }
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
