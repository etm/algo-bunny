var active_del = ''
var active_del_timeout

var walker

var active_drag_location = null // thany you chrome for security without reason. Dragover and dragleave can not getData.
var active_element_drag = null

document.addEventListener('contextmenu', event => event.preventDefault())

$(document).ready(async function() {

  let assets  = new Assets;
  await assets.load();

  let q = $.parseQuerySimple();
  let level = q.level ? q.level : '';

  let editor = new Editor($('div.program svg'), assets);
  editor.render();

  let field = new Field($('div.field svg'), assets, level);
  if (!(await field.load_level())) { return; }
  field.render();

  walker = new Walker(assets,editor,field)

  // show some elements
  $('div.elements *[data-type]').each((_,ele) => { //{{{
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
    $('div.elements *[data-type=' + iname + ']').click(()=>{
      assets.say(item.desc,'div.speech')
    });
  });
  if (field.elements.includes('execute')) {
    $('#execute').show()
  }
  $('div.elements #execute').click((ev)=>{
    let gr = $('div.elements #execute').parents('div.group')
    let pid = editor.get_free_pid()
    if (pid) {
      editor.insert_item('','insert_last',null)
      let nid = editor.insert_item('','insert_last','execute')
      editor.update_item(nid,'id',pid)
      editor.render()
      $('div.elements img[data-type=execute' + pid + ']').show()
    }
  });
  //}}}

  // order
  assets.say(field.order.trim(),'div.speech')

  // set mission and title
  document.title = field.title.trim();
  $('div.field div.mission div.top .order').text(field.order)
  $('div.field div.mission div.text').html(marked(field.mission))
  $('div.field div.mission div.text a[href]').attr('target','_blank')
  if (field.title.trim() == 'Carrots!') {
    $('div.field div.mission').toggleClass('active')
  }

  // one liners
  $('div.program svg').on('click','g[element-type=bunny]',()=>{ assets.oneliner('div.speech') })

  // click element in editor, say and show delete
  $('div.program svg').on('click','g[element-group=graph] g[element-id]',(ev)=>{ //{{{
    $('div.program svg g[element-group=drop] g[element-type=here]').removeClass('active')

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
      if (!walker.walking) {
        $('div.program svg g[element-group=drop] g[element-type=delete][element-id=' + eid + ']').addClass('active');
      }
      let iname = $(ev.currentTarget).attr('element-type');
      let item = assets.commands[iname];
      assets.say(item.label,'div.speech')
      active_del_timeout = setTimeout(()=>{
        $('div.program svg g[element-group=drop] g[element-type=delete][element-id].active').removeClass('active');
        active_del = '';
      },12000);
    }
    return false;
  }); //}}}

  // display target tiles
  $('div.program svg').on('mousemove','g[element-group=graph] g[element-type=jump]',(ev)=>{ //{{{
    let epara = $(ev.currentTarget).attr('element-para');
    if (epara && epara.match(/^\d+,\d+$/)) {
      let [ox,oy] = epara.split(',')
      $('div.field g.tile').removeClass('active')
      $('div.field g.tile[element-x=' + ox + '][element-y=' + oy + ']').addClass('active')
    }
  }) //}}}

  // click delete
  $('div.program svg').on('click','g[element-group=drop] g[element-type=delete].active',(ev)=>{ //{{{
    let eid = $(ev.currentTarget).attr('element-id')
    let it = editor.get_item(eid)
    if (it.item == 'execute') {
      editor.remove_item_by_type(it.item + it.id)
      $('div.elements img[data-type=execute' + it.id + ']').hide()
    }
    editor.remove_item(eid)
    editor.render()
    active_del = ''
    $(ev.currentTarget).removeClass('active')
    assets.say_reset('div.speech')
    return false;
   }); //}}}

  // drag on SVG does not work. so we have to be clever monkis
  // foreignObject with div inside and at the end of svg.
  // it catches all mouseclicks :-) read on for the grand finale!
  $('div.field svg').on('dragstart','foreignObject div',(ev)=>{ //{{{
    var left = $(window).scrollLeft();
    var top = $(window).scrollTop();

    editor.target_drag.addClass('inactive')

    $('div.program svg g[element-group=drop] g[element-type=here]').removeClass('active')
    // what fucking clever shit. we hide the foreignObject that sits on top of
    // SVG but is part of SVG. we then use #elementFromPoint, and switch it
    // back on. Its sad that we have to do this, but holy shit this is great.
    let oes = document.elementsFromPoint(ev.pageX-left, ev.pageY-top)
    let oe = oes[2]

    let ot = $(oe).parents('g.tile')

    if (ot.length == 1) {
      let ox = ot.attr('element-x')
      let oy = ot.attr('element-y')
      ev.originalEvent.dataTransfer.setData("text/plain",ox+','+oy);

      var img = document.createElement("img");
      img.src = "assets/location.svg";
      ev.originalEvent.dataTransfer.setDragImage(img, 0, 0);

      active_drag_location = ox+','+oy
    } else {
      return false
    }
   }); //}}}
  $('div.program').on('drop','g[element-type=jump]',(ev)=>{ //{{{
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^\d+,\d+$/)) {
      let eid = $(ev.currentTarget).attr('element-id');
      $(ev.currentTarget).removeClass('active');
      $(ev.currentTarget).addClass('targeting');
      $(ev.currentTarget).attr('element-para',ev.originalEvent.dataTransfer.getData("text/plain"))
      editor.update_item(eid,'target',ev.originalEvent.dataTransfer.getData("text/plain"))

      let [ox,oy] = ev.originalEvent.dataTransfer.getData("text/plain").split(',')
      $('div.field g.tile').removeClass('active')
      $('div.field g.tile[element-x=' + ox + '][element-y=' + oy + ']').addClass('active')
    }
  }); //}}}
  $('div.program').on('dragover','g[element-type=jump]',(ev)=>{ //{{{
    console.log('rrrr')
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^\d+,\d+$/) || active_drag_location != null) {
      $(ev.currentTarget).addClass('active');
    }
  }); //}}}
  $('div.program').on('dragleave','g[element-type=jump]',(ev)=>{ //{{{
    console.log('rrrr')
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^\d+,\d+$/) || active_drag_location != null) {
      $(ev.currentTarget).removeClass('active');
    }
  }); //}}}
  $(document).on('dragend',ev=>{ //{{{
    if (active_drag_location == null && active_element_drag == null) {
      assets.say(assets.texts.delete,'div.speech')
    }
    active_drag_location = null // thanks again chrome.
    active_element_drag = null
      console.log('aaa2')
    editor.target_drag.removeClass('inactive')
  }) //}}}

  $('div.program svg').on('click','foreignObject div',(ev)=>{ //{{{
    var left = $(window).scrollLeft();
    var top = $(window).scrollTop();
    let oes = document.elementsFromPoint(ev.pageX-left, ev.pageY-top)
    let oe = oes[2]
    let ot = $(oe).parents('g[element-type]')
    if (ot.length > 0) {
      ot.first().click()
    }
  }) //}}}
  $('div.program svg').on('mousemove','foreignObject div',(ev)=>{ //{{{
    console.log('rrrra5')
    var left = $(window).scrollLeft()
    var top = $(window).scrollTop()
    let oes = document.elementsFromPoint(ev.pageX-left, ev.pageY-top)
    let oe = oes[2]
    let ot = $(oe).parents('g[element-type=jump]')
    if (ot.length > 0) {
      ot.first().mousemove()
    } else {
      $('div.field g.tile').removeClass('active')
    }
  }) //}}}
  $('div.program svg').on('mouseout','foreignObject div',(ev)=>{ //{{{
    $('div.field g.tile').removeClass('active')
  }) //}}}
  $('div.program svg').on('dragstart','foreignObject div',(ev)=>{ //{{{
    var left = $(window).scrollLeft();
    var top = $(window).scrollTop();

    let oes = document.elementsFromPoint(ev.pageX-left, ev.pageY-top)
    let oe = oes[2]
    let ot = $(oe).parents('g[element-type]')
    if (ot.length > 0 && ot.parents('g[element-group=graph]').length == 1) {
      var ety = ot.first().attr('element-type')
      if (ety == 'execute') {
        console.log('aaa3')
        editor.target_drag.removeClass('inactive')
        return false
      }
      editor.target_drag.addClass('inactive')
      var eid = ot.first().attr('element-id')
      ev.originalEvent.dataTransfer.setData("text/plain",eid);

      var img = document.createElement("img")
      img.src = assets.commands[ety].icon
      ev.originalEvent.dataTransfer.setDragImage(img, 0, 0)

      $('div.program svg g[element-group=drop] g[element-type=here]').removeClass('active')
      $('div.program g[element-type=add] .adder').show();
      active_element_drag = true
    } else {
      console.log('yyyy')
      return false
    }
  }) //}}}

  $('div.elements').on('dragstart','[draggable=true][data-type]',(ev)=>{ //{{{
    ev.originalEvent.dataTransfer.setData("text/plain", $(ev.currentTarget).attr('data-type'));
    ev.originalEvent.dataTransfer.setDragImage(ev.originalEvent.srcElement, 28, 0);
    $('div.program svg g[element-group=drop] g[element-type=here]').removeClass('active')
    $('div.program g[element-type=add] .adder').show();
    editor.target_drag.addClass('inactive')
    active_element_drag = true
  }); //}}}
  $('div.program').on('drop','g[element-type=add]',(ev)=>{ //{{{
    ev.preventDefault()
    ev.stopPropagation()
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^[a-z]{2}[a-z0-9_]+$/)) {
      let eid = $(ev.currentTarget).attr('element-id')
      let eop = $(ev.currentTarget).attr('element-op')
      let ety = ev.originalEvent.dataTransfer.getData("text/plain")
      editor.insert_item(eid,eop,ety)
      editor.render()
    }
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^a\d+$/)) {
      let eid = $(ev.currentTarget).attr('element-id')
      let eop = $(ev.currentTarget).attr('element-op')
      let eit = ev.originalEvent.dataTransfer.getData("text/plain")
      editor.move_item(eid,eop,eit)
      editor.render();
      console.log('aaa1')
      editor.target_drag.removeClass('inactive')
    }
    active_element_drag = false
  }); //}}}
  $('div.program').on('dragover','g[element-type=add]',(ev)=>{ //{{{
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^[a-z]{2}[a-z0-9_]+$/) || ev.originalEvent.dataTransfer.getData("text/plain").match(/^a\d+$/) || active_element_drag) {
      $(ev.currentTarget).addClass('active');
    }
  }); //}}}
  $('div.program').on('dragleave','g[element-type=add]',(ev)=>{ //{{{
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^[a-z]{2}[a-z0-9_]+$/) || ev.originalEvent.dataTransfer.getData("text/plain").match(/^a\d+$/) || active_element_drag) {
      $(ev.currentTarget).removeClass('active');
    }
  }); //}}}

  $('button.mission').click(ev=>{
    $('div.field div.victory').removeClass('active')
    $('div.field div.mission').toggleClass('active')
  })
  $('div.field div.mission div.top img').click(ev=>{
    $('div.field div.mission').toggleClass('active')
  })
  $('div.field div.victory div.top img').click(ev=>{
    $('div.field div.victory').toggleClass('active')
  })
  $('button.control').click(ev=>{
    $('div.field div.victory').removeClass('active')
    $('div.field div.mission').removeClass('active')
    if (editor.program.length > 0) {
      if ($(ev.currentTarget).hasClass('active')) {
        walker.stop()
        field.reset_full()
      } else {
        walker.walk()
      }
      $(ev.currentTarget).toggleClass('active');
    }
  })
  document.addEventListener('cisc:changed', (e) => {
    $('div.field div.stats .cisc .value').text(editor.cisc_length())
  })
  document.addEventListener('ins:changed', (e) => {
    $('div.field div.stats .ins .value').text(walker.ins_count())
  })
  document.addEventListener('steps:changed', (e) => {
    $('div.field div.stats .steps .value').text(walker.step_count())
  })
  document.addEventListener('walking:success', (e) => {
    setTimeout(()=>{
      $('div.field div.mission').removeClass('active')
      $('div.field div.victory').toggleClass('active')
      let cisc = editor.cisc_length()
      let ins = walker.ins_count()
      let steps = walker.step_count()

      $('div.field div.victory .text .title').text(field.title.trim())
      $('div.field div.victory .text .steps').text(steps)
      $('div.field div.victory .text .ins').text(ins)
      $('div.field div.victory .text .cisc').text(cisc)
      $('div.field div.victory .text .rank').text(cisc + steps)
      $('div.field div.victory .text .reference_rank').text(field.max_score)
    },1000)
  })

  $('button.save').click(ev=>{
    $('#saveinstructions').attr('download',field.title.trim().replace(/[^a-zA-Z0-9!?()-]/g,'_') + '.json');
    $('#saveinstructions').attr('href','data:application/xml;charset=utf-8;base64,' + $B64(JSON.stringify(editor.program,null,2)));
    document.getElementById('saveinstructions').click();
  })
  $('button.load').click(ev=>{
    document.getElementById('loadinstructions').click();
  })
  $("input[name=loadinstructions]").change(ev=>{
    if (typeof window.FileReader !== 'function') {
      alert('FileReader not yet supportet');
      return;
    }
    var files = $('#loadinstructions').get(0).files;
    var reader = new FileReader();
    reader.onload = function(){
      editor.program = JSON.parse(reader.result)
      editor.render()
      document.getElementById('fuckchrome').reset();
      editor.get_pids().forEach(pid => {
        $('div.elements img[data-type=execute' + pid + ']').show()
      })
      $('div.field div.stats .cisc .value').text(editor.cisc_length())
    }
    reader.onerror = function(){ console.log('error reading file'); loading = false; }
    reader.onabort = function(){ console.log('abort reading file'); loading = false; }
    reader.readAsText(files[0]);

  })
})
