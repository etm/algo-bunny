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

  // display target tiles
  $('div.program svg').on('mouseover','g[element-group=graph] g[element-type=jump]',(ev)=>{
    let epara = $(ev.currentTarget).attr('element-para');
    if (epara && epara.match(/^\d+,\d+$/)) {
      let [ox,oy] = epara.split(',')
      $('div.field g.tile[element-x=' + ox + '][element-y=' + oy + ']').addClass('active')
    }
  });
  $('div.program svg').on('mouseout','g[element-group=graph] g[element-type=jump]',(ev)=>{
    let epara = $(ev.currentTarget).attr('element-para');
    if (epara && epara.match(/^\d+,\d+$/)) {
      let [ox,oy] = epara.split(',')
      $('div.field g.tile[element-x=' + ox + '][element-y=' + oy + ']').removeClass('active')
    }
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

  // drag on SVG does not work. so we have to be clever monkis
  // foreignObject with div inside and at the end ov svg.
  // it catches all mouseclicks :-) read on for the grand finale!
  $('div.field svg').on('dragstart','foreignObject div',(ev)=>{
    var left = $(window).scrollLeft();
    var top = $(window).scrollTop();

    // what fucking clever shit. we hide the foreignObject that sits on top of
    // SVG but is part of svg. we then use #elementFromPoint, and switch it
    // back on. Its sad that we have to do this, but holy shit this is great.
    field.target_drag.css('display','none')
    let oe = document.elementFromPoint(ev.pageX-left, ev.pageY-top);
    field.target_drag.css('display','inline')

    let ot = $(oe).parents('g.tile')

    if (ot.length == 1) {
      let ox = ot.attr('element-x')
      let oy = ot.attr('element-y')
      ev.originalEvent.dataTransfer.setData("text/plain",ox+','+oy);

      var img = document.createElement("img");
      img.src = "assets/location.svg";
      ev.originalEvent.dataTransfer.setDragImage(img, 0, 0);
    }
  });
  $('div.program').on('drop','g[element-type=jump]',(ev)=>{
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^\d+,\d+$/)) {
      let eid = $(ev.currentTarget).attr('element-id');
      $(ev.currentTarget).removeClass('active');
      $(ev.currentTarget).addClass('targeting');
      $(ev.currentTarget).attr('element-para',ev.originalEvent.dataTransfer.getData("text/plain"))
      editor.update_item(eid,'target',ev.originalEvent.dataTransfer.getData("text/plain"))
    }
  });
  $('div.program').on('dragover','g[element-type=jump]',(ev)=>{
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^\d+,\d+$/)) {
      $(ev.currentTarget).addClass('active');
    }
  });
  $('div.program').on('dragleave','g[element-type=jump]',(ev)=>{
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^\d+,\d+$/)) {
      $(ev.currentTarget).removeClass('active');
    }
  });


  $('div.elements').on('dragstart','img[data-type]',(ev)=>{
    ev.originalEvent.dataTransfer.setData("text/plain", $(ev.currentTarget).attr('data-type'));
    ev.originalEvent.dataTransfer.setDragImage(ev.originalEvent.srcElement, 28, 0);
  });
  $('div.program').on('drop','g[element-type=add]',(ev)=>{
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^[a-z_]*$/)) {
      let eid = $(ev.currentTarget).attr('element-id');
      let eop = $(ev.currentTarget).attr('element-op');
      let ety = ev.originalEvent.dataTransfer.getData("text/plain");
      editor.insert_item(eid,eop,ety);
      editor.render();
    }
  });
  $('div.program').on('dragover','g[element-type=add]',(ev)=>{
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^[a-z_]*$/)) {
      $(ev.currentTarget).addClass('active');
    }
  });
  $('div.program').on('dragleave','g[element-type=add]',(ev)=>{
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^[a-z_]*$/)) {
      $(ev.currentTarget).removeClass('active');
    }
  });
});
