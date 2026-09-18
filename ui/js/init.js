var active_del = ''
var active_del_timeout

var success = 0

var active_drag_location = null // thany you chrome for security without reason. Dragover and dragleave can not getData.
var active_element_drag = null

document.addEventListener('contextmenu', event => event.preventDefault())

document.addEventListener('touchmove', function (e) {
  let dragging = active_element_drag || (active_drag_location && active_drag_location.engaged !== false)
  if (dragging || !e.target.closest('div.program')) {
    e.preventDefault();
  }
}, { passive: false });

$(document).ready(async function() {
  let q = $.parseQuerySimple()
  let levelurl = q.level ? q.level : ''
  let solurl = q.solution ? q.solution : ''

  let assets  = new Assets
  await assets.load()

  let editor = new Editor($('div.program'), assets, levelurl)

  let autoscroll_timer = null
  let autoscroll_y = 0
  const autoscroll_zone = 60
  const autoscroll_step = 12
  const autoscroll_update = (clientY)=>{
    autoscroll_y = clientY
    if (autoscroll_timer == null) {
      autoscroll_timer = setInterval(()=>{
        let prog = editor.target[0]
        let r = prog.getBoundingClientRect()
        if (autoscroll_y < r.top + autoscroll_zone) {
          prog.scrollTop -= autoscroll_step
        } else if (autoscroll_y > r.bottom - autoscroll_zone) {
          prog.scrollTop += autoscroll_step
        }
      },16)
    }
  }
  const autoscroll_stop = ()=>{
    clearInterval(autoscroll_timer)
    autoscroll_timer = null
  }
  let field = new Field($('div.field'), assets)
      field.target.find('.victory .hurra').text(assets.texts.hurra)
      field.target.find('.victory .text .title .label').text(assets.texts.victory_text_title)
      field.target.find('.victory .text .steps .label').text(assets.texts.victory_text_steps)
      field.target.find('.victory .text .cmps .label').text(assets.texts.victory_text_cmps)
      field.target.find('.victory .text .cisc .label').text(assets.texts.victory_text_cisc)
      field.target.find('.victory .text .ins .label').text(assets.texts.victory_text_ins)
      field.target.find('.victory .text .explanation').html(assets.texts.victory_text_explanation)
      field.target.find('.victory .text .reference_rank .label').text(assets.texts.victory_text_reference_rank)
      field.target.find('.stats .steps .label').text(assets.texts.stats_steps)
      field.target.find('.stats .cmps .label').text(assets.texts.stats_cmps)
      field.target.find('.stats .ins .label').text(assets.texts.stats_ins)
      field.target.find('.stats .cisc .label').text(assets.texts.stats_cisc)
      field.target.find('.stats .success .label').text(assets.texts.stats_success)
      field.target.find('.bottom .ui.mission').attr('title',assets.texts.mission)
      field.target.find('.bottom .ui.control').attr('title',assets.texts.control)
      field.target.find('.bottom .ui.speed').attr('title',assets.texts.speed)
      field.target.find('.bottom .ui.save').attr('title',assets.texts.save)
      field.target.find('.bottom .ui.load').attr('title',assets.texts.load)
  let elements = new Elements($('div.elements'),assets,field,editor)

  let loader = new Loader(assets, editor, field, elements, levelurl, solurl)
  if (!(await loader.load_level())) { return }
  if (solurl !== '') {await loader.load_solution()}

  let prog
  if (solurl === '' && (prog = window.localStorage.getItem(levelurl))) {
    editor.program = JSON.parse(prog)
  }

  elements.render()
  editor.render()
  field.render()

  elements.show(editor.program_stats())
  field.target.find('div.stats .cisc .value').text(editor.cisc_length())
  editor.get_pids().forEach(pid => {
    elements.target.find('img[data-type=execute' + pid + ']').show()
  })

  walker = new Walker(assets,editor,field)

  elements.target.find('#execute').click((ev)=>{
    let gr = elements.target.find('#execute').parents('div.group')
    let pid = editor.get_free_pid()
    if (pid) {
      editor.insert_item('','insert_last',null)
      let nid = editor.insert_item('','insert_last','execute')
      editor.update_item(nid,'id',pid)
      editor.render()
      elements.show(editor.program_stats())
      elements.target.find('img[data-type=execute' + pid + ']').show()
    }
  })
  //}}}

  // set mission and title
  document.title = field.title.trim()
  field.target.find('div.mission div.top .order').text(field.order)
  field.target.find('div.mission div.text').html(marked(field.mission))
  field.target.find('div.mission div.text a[href]').attr('target','_blank')
  field.target.find('div.mission').toggleClass('active')

  // order
  assets.say(field.order.trim(),'div.speech')

  // one liners
  editor.target_svg.on('click','g[element-type=bunny]',()=>{ assets.oneliner('div.speech') })

  // click element in editor, say and show delete

  // display target tiles
  editor.target_svg.on('mouseover','g[element-group=graph] g[element-type=jump]',(ev)=>{ //{{{
    let epara = $(ev.currentTarget).attr('element-para')
    if (epara && epara.match(/^\d+,\d+$/)) {
      let [ox,oy] = epara.split(',')
      field.target_svg.find('g.tile').removeClass('active')
      field.target_svg.find('g.tile[element-x=' + ox + '][element-y=' + oy + ']').addClass('active')
    }
  }) //}}}
  editor.target_svg.on('mouseout','g[element-group=graph] g[element-type=jump]',(ev)=>{ //{{{
    let epara = $(ev.currentTarget).attr('element-para')
    if (epara && epara.match(/^\d+,\d+$/)) {
      field.target_svg.find('g.tile').removeClass('active')
    }
  }) //}}}

  // click delete
  editor.target_svg.on('click','g[element-group=drop] g[element-type=delete].active',(ev)=>{ //{{{
    let eid = $(ev.currentTarget).attr('element-id')
    let it = editor.get_item(eid)
    if (it.item == 'execute') {
      editor.remove_item_by_type(it.item + it.id)
      elements.target.find('img[data-type=execute' + it.id + ']').hide()
    }
    editor.remove_item(eid)
    editor.render_diff()
    elements.show(editor.program_stats())
    active_del = ''
    $(ev.currentTarget).removeClass('active')
    assets.say_reset('div.speech')
    return false
   }) //}}}

  // drag on SVG does not work. so we have to be clever monkis
  // foreignObject with div inside and at the end of svg.
  // it catches all mouseclicks :-) read on for the grand finale!
  field.target_svg.on('dragstart','foreignObject div',(ev)=>{ //{{{
    if (walker.walking) { return false }

    var left = $(window).scrollLeft()
    var top = $(window).scrollTop()

    editor.target_svg.find('g[element-group=drop] g[element-type=here]').removeClass('active')
    // what fucking clever shit. we hide the foreignObject that sits on top of
    // SVG but is part of SVG. we then use #elementFromPoint, and switch it
    // back on. Its sad that we have to do this, but holy shit this is great.
    let oes = document.elementsFromPoint(ev.pageX-left, ev.pageY-top)
    let oe = oes[2]

    let ot = $(oe).parents('g.tile')

    if (ot.length == 1) {
      let ox = ot.attr('element-x')
      let oy = ot.attr('element-y')
      ev.originalEvent.dataTransfer.setData("text/plain",ox+','+oy)

      var img = document.createElement("img")
      img.src = "assets/location.svg"
      ev.originalEvent.dataTransfer.setDragImage(img, 0, 0)

      active_drag_location = { x: ox, y: oy }
    } else {
      return false
    }
   }) //}}}
  // touch fallback for the location-drag above: iOS/iPadOS requires a long-press
  // before it will fire native dragstart on a touch, so we drive the same
  // interaction off touch events instead, exactly like the elements panel below.
  field.target_svg.on('touchstart','foreignObject div',(ev)=>{ //{{{
    if (walker.walking) { return false }

    let touchobj = ev.originalEvent.changedTouches[0]

    editor.target_svg.find('g[element-group=drop] g[element-type=here]').removeClass('active')
    let oes = document.elementsFromPoint(touchobj.clientX, touchobj.clientY)
    let oe = oes[2]

    let ot = $(oe).parents('g.tile')

    if (ot.length == 1) {
      let ox = ot.attr('element-x')
      let oy = ot.attr('element-y')

      let drag = document.querySelector('#drag')
      let img = document.createElement('img')
      img.src = 'assets/location.svg'
      drag.replaceChildren(img)

      active_drag_location = { x: ox, y: oy, target: null }
      ev.preventDefault()
    }
  }) //}}}
  field.target_svg.on('touchmove','foreignObject div',(ev)=>{ //{{{
    if (active_drag_location && active_drag_location.target !== undefined) {
      let touchobj = ev.originalEvent.changedTouches[0]
      let drag = document.querySelector('#drag')
      drag.classList.add('visible')
      drag.style.left = touchobj.pageX + 'px'
      drag.style.top = touchobj.pageY + 'px'
      autoscroll_update(touchobj.clientY)

      let pos = document.elementsFromPoint(touchobj.clientX, touchobj.clientY)[0]
      let ot = $(pos).parents('g[element-type=jump]')

      if (ot.length > 0) {
        if (!ot.is(active_drag_location.target)) {
          if (active_drag_location.target != null) {
            active_drag_location.target.removeClass('active')
          }
          active_drag_location.target = ot
          active_drag_location.target.addClass('active')
        }
      } else {
        if (active_drag_location.target != null) {
          active_drag_location.target.removeClass('active')
          active_drag_location.target = null
        }
      }
      ev.preventDefault()
    }
  }) //}}}
  field.target_svg.on('touchend','foreignObject div',(ev)=>{ //{{{
    if (active_drag_location && active_drag_location.target !== undefined) {
      autoscroll_stop()
      document.querySelector('#drag').classList.remove('visible')

      let target = active_drag_location.target
      if (target && target.length > 0) {
        let eid = target.attr('element-id')
        target.removeClass('active')
        target.addClass('targeting')
        target.attr('element-para',active_drag_location.x+','+active_drag_location.y)
        editor.update_item(eid,'target',active_drag_location.x+','+active_drag_location.y)

        field.target_svg.find('g.tile').removeClass('active')
        field.target_svg.find('g.tile[element-x=' + active_drag_location.x + '][element-y=' + active_drag_location.y + ']').addClass('active')
      }

      active_drag_location = null
      ev.preventDefault()
    }
  }) //}}}
  editor.target.on('drop','g[element-type=jump]',(ev)=>{ //{{{
    ev.preventDefault()
    ev.stopPropagation()
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^\d+,\d+$/)) {
      let eid = $(ev.currentTarget).attr('element-id')
      $(ev.currentTarget).removeClass('active')
      $(ev.currentTarget).addClass('targeting')
      $(ev.currentTarget).attr('element-para',ev.originalEvent.dataTransfer.getData("text/plain"))
      editor.update_item(eid,'target',ev.originalEvent.dataTransfer.getData("text/plain"))

      let [ox,oy] = ev.originalEvent.dataTransfer.getData("text/plain").split(',')
      field.target_svg.find('g.tile').removeClass('active')
      field.target_svg.find('g.tile[element-x=' + ox + '][element-y=' + oy + ']').addClass('active')
    }
  }) //}}}
  editor.target.on('dragover','g[element-type=jump]',(ev)=>{ //{{{
    ev.preventDefault()
    ev.stopPropagation()
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^\d+,\d+$/) || active_drag_location != null) {
      $(ev.currentTarget).addClass('active')
    }
  }) //}}}
  editor.target.on('dragleave','g[element-type=jump]',(ev)=>{ //{{{
    ev.preventDefault()
    ev.stopPropagation()
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^\d+,\d+$/) || active_drag_location != null) {
      $(ev.currentTarget).removeClass('active')
    }
  }) //}}}
  $(document).on('dragend',ev=>{ //{{{
    if (active_drag_location == null && active_element_drag == null) {
      assets.say(assets.texts.delete,'div.speech')
    }
    active_drag_location = null // thanks again chrome.
    active_element_drag = null
  }) //}}}

  editor.target_svg.on('click','foreignObject div',(ev)=>{ //{{{
    if (walker.walking) { return false }

    let oe = $(ev.currentTarget)
    let ot = $(oe).parents('g[element-type]')
    if (ot.length > 0) {
      editor.target_svg.find('g[element-group=drop] g[element-type=here]').removeClass('active')

      if (active_del_timeout) {
        clearTimeout(active_del_timeout)
      }
      if (active_del != '') {
        editor.target_svg.find('g[element-group=drop] g[element-type=delete][element-id=' + active_del + ']').removeClass('active')
      }
      let eid = ot.first().attr('element-id')
      if (active_del == eid) {
        active_del = ''
      } else {
        active_del = eid
        if (!walker.walking) {
          editor.target_svg.find('g[element-group=drop] g[element-type=delete][element-id=' + eid + ']').addClass('active')
        }
        let iname = ot.first().attr('element-type')
        let item = assets.commands[iname]
        assets.say(item.label,'div.speech')
        active_del_timeout = setTimeout(()=>{
          editor.target_svg.find('g[element-group=drop] g[element-type=delete][element-id].active').removeClass('active')
          active_del = ''
        },12000)
      }
      return false
    }
  }) //}}}
  editor.target_svg.on('dragstart','foreignObject div',(ev)=>{ //{{{
    if (walker.walking) { return false }

    let oe = $(ev.currentTarget)
    let ot = $(oe).parents('g[element-type]')
    if (ot.length > 0 && ot.parents('g[element-group=graph]').length == 1) {
      var ety = ot.first().attr('element-type')
      if (ety == 'execute') {
        return false
      }
      var eid = ot.first().attr('element-id')
      ev.originalEvent.dataTransfer.setData("text/plain",eid)

      let img = elements.target.find('img[data-type='+ety+']')[0]
      ev.originalEvent.dataTransfer.setDragImage(img, 0, 0)

      editor.target_svg.find('g[element-group=drop] g[element-type=here]').removeClass('active')
      setTimeout(ev=>{ // yes, chrome, you are an idiot
        editor.target_svg.find('g[element-type=add] .adder').show()
      },100)
      active_element_drag = true
    } else {
      return false
    }
  }) //}}}
  // touch fallback for moving/reordering an existing program element, same
  // reasoning as the location-drag touch fallback above. Unlike that one,
  // a plain tap on these foreignObjects is also used (see the 'click'
  // handler above) to select the element for deletion, so we must not
  // preventDefault/engage the drag until the touch has actually moved -
  // otherwise we'd swallow the synthetic click that drives tap-to-delete.
  const drag_move_threshold = 10 // px
  editor.target_svg.on('touchstart','foreignObject div',(ev)=>{ //{{{
    if (walker.walking) { return false }

    let oe = $(ev.currentTarget)
    let ot = $(oe).parents('g[element-type]')
    if (ot.length > 0 && ot.parents('g[element-group=graph]').length == 1) {
      var ety = ot.first().attr('element-type')
      if (ety == 'execute') {
        return false
      }
      var eid = ot.first().attr('element-id')
      let touchobj = ev.originalEvent.changedTouches[0]

      active_drag_location = { eid: eid, ety: ety, node: ot.first()[0], target: null, engaged: false, startX: touchobj.pageX, startY: touchobj.pageY }
    }
  }) //}}}
  editor.target_svg.on('touchmove','foreignObject div',(ev)=>{ //{{{
    if (active_drag_location && active_drag_location.eid) {
      let touchobj = ev.originalEvent.changedTouches[0]

      if (!active_drag_location.engaged) {
        let dx = touchobj.pageX - active_drag_location.startX
        let dy = touchobj.pageY - active_drag_location.startY
        if (Math.sqrt(dx*dx + dy*dy) < drag_move_threshold) { return }

        active_drag_location.engaged = true
        active_element_drag = true

        // Build the ghost from the live element being dragged rather than
        // the matching palette icon: that palette icon is display:none
        // whenever this element type's supply is fully placed already
        // (the common case when reordering), and cloning a display:none
        // node renders as a solid black box.
        let drag = document.querySelector('#drag')
        let svg_el = active_drag_location.node
        let bbox = svg_el.getBBox()
        let rect = svg_el.getBoundingClientRect()
        let ghost = document.createElementNS('http://www.w3.org/2000/svg','svg')
        ghost.setAttribute('viewBox', bbox.x+' '+bbox.y+' '+bbox.width+' '+bbox.height)
        ghost.setAttribute('width', rect.width)
        ghost.setAttribute('height', rect.height)
        ghost.appendChild(svg_el.cloneNode(true))
        drag.replaceChildren(ghost)

        editor.target_svg.find('g[element-group=drop] g[element-type=here]').removeClass('active')
        editor.target_svg.find('g[element-type=add] .adder').show()
      }

      let drag = document.querySelector('#drag')
      drag.classList.add('visible')
      drag.style.left = (touchobj.pageX - (drag.clientWidth/2)) + 'px'
      drag.style.top = touchobj.pageY + 'px'
      autoscroll_update(touchobj.clientY)

      let pos = document.elementsFromPoint(touchobj.clientX, touchobj.clientY)[0]
      let ot = $(pos).parents('g[element-type=add]')

      if (ot.length > 0) {
        if (!ot.is(active_drag_location.target)) {
          if (active_drag_location.target != null) {
            active_drag_location.target.removeClass('active')
          }
          active_drag_location.target = ot
          active_drag_location.target.addClass('active')
        }
      } else {
        if (active_drag_location.target != null) {
          active_drag_location.target.removeClass('active')
          active_drag_location.target = null
        }
      }
      ev.preventDefault()
    }
  }) //}}}
  editor.target_svg.on('touchend','foreignObject div',(ev)=>{ //{{{
    if (active_drag_location && active_drag_location.eid) {
      autoscroll_stop()
      if (active_drag_location.engaged) {
        let eit = active_drag_location.eid
        let target = active_drag_location.target

        document.querySelector('#drag').classList.remove('visible')
        editor.target_svg.find('g[element-type=add] .adder').hide()
        editor.target_svg.find('g[element-type=add]').removeClass('active')

        if (target && target.length > 0) {
          let eid = target.attr('element-id')
          let eop = target.attr('element-op')
          editor.move_item(eid,eop,eit)
          editor.render()
          elements.show(editor.program_stats())
        }

        active_element_drag = false
        ev.preventDefault()
      }
      active_drag_location = null
    }
  }) //}}}

  elements.target.on('dragstart','[draggable=true][data-type]',(ev)=>{ //{{{
    if (walker.walking) { return false }

    ev.originalEvent.dataTransfer.setData("text/plain", $(ev.currentTarget).attr('data-type'))
    ev.originalEvent.dataTransfer.setDragImage(ev.originalEvent.srcElement, 28, 0)
    editor.target_svg.find('g[element-group=drop] g[element-type=here]').removeClass('active')
    editor.target_svg.find('g[element-type=add] .adder').show()
    active_element_drag = true
  }) //}}}

  elements.target.on('touchstart','[draggable=true][data-type]',(ev)=>{ //{{{
    let touchobj = ev.changedTouches[0]
    active_drag_location = {
      x: parseInt(touchobj.clientX),
      y: parseInt(touchobj.clientY),
      add: null
    }
    editor.target_svg.find('g[element-group=drop] g[element-type=here]').removeClass('active')
    editor.target_svg.find('g[element-type=add] .adder').show()
    active_element_drag = true
    ev.preventDefault()
  }) //}}}
  elements.target.on('touchend','[draggable=true][data-type]',(ev)=>{ //{{{
    autoscroll_stop()
    active_drag_location = null
    active_element_drag = false
    drag.classList.remove('visible')

    let pos = document.elementsFromPoint(ev.originalEvent.changedTouches[0].pageX,ev.originalEvent.changedTouches[0].pageY)[0]
    let ot = $(pos).parents('g[element-type=add]')

    let eid = $(ot).attr('element-id')
    let eop = $(ot).attr('element-op')
    let ety = $(ev.currentTarget).attr('data-type')

    editor.insert_item(eid,eop,ety)

    editor.target_svg.find('g[element-type=add] .adder').hide()
    editor.target_svg.find('g[element-type=add]').removeClass('active')

    editor.render_diff()
    elements.show(editor.program_stats())

    ev.preventDefault()
  }) //}}}
  elements.target.on('touchmove','[draggable=true][data-type]',(ev)=>{ //{{{
    if (active_element_drag) {
      let drag = document.querySelector('#drag')
      let elem = ev.currentTarget
      let clone = elem.cloneNode(true)
      let elem_rect = elem.getBoundingClientRect()
      clone.style.height = elem_rect.height + 'px'
      clone.style.width = elem_rect.width + 'px'

      drag.replaceChildren(clone)
      drag.classList.add('visible')
      let posX = ev.originalEvent.changedTouches[0].pageX - (ev.currentTarget.clientWidth/2)
      let posY = ev.originalEvent.changedTouches[0].pageY
      drag.style.left = posX + 'px'
      drag.style.top = posY + 'px'
      autoscroll_update(ev.originalEvent.changedTouches[0].clientY)

      let pos = document.elementsFromPoint(ev.originalEvent.changedTouches[0].pageX,ev.originalEvent.changedTouches[0].pageY)[0]
      let ot = $(pos).parents('g[element-type=add]')

      if (ot.length > 0) {
        if (!ot.hasClass('active')) {
          active_drag_location.add = ot
          active_drag_location.add.addClass('active')
        }
      } else {
        if (active_drag_location.add != null) {
          active_drag_location.add.removeClass('active')
          active_drag_location.add = null
        }
      }
    } else {
      // no move that we care about
    }
    ev.preventDefault();
  }) //}}}

  editor.target.on('drop','g[element-type=add]',(ev)=>{ //{{{
    ev.preventDefault()
    ev.stopPropagation()
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^[a-z]{2}[a-z0-9_]+$/)) {
      let eid = $(ev.currentTarget).attr('element-id')
      let eop = $(ev.currentTarget).attr('element-op')
      let ety = ev.originalEvent.dataTransfer.getData("text/plain")
      editor.insert_item(eid,eop,ety)
      active_element_drag = false
      editor.target_svg.find('g[element-type=add] .adder').hide()
      editor.target_svg.find('g[element-type=add]').removeClass('active')
      editor.render_diff()
      elements.show(editor.program_stats())
    }
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^a\d+$/)) {
      let eid = $(ev.currentTarget).attr('element-id')
      let eop = $(ev.currentTarget).attr('element-op')
      let eit = ev.originalEvent.dataTransfer.getData("text/plain")
      editor.move_item(eid,eop,eit)
      active_element_drag = false
      editor.target_svg.find('g[element-type=add] .adder').hide()
      editor.target_svg.find('g[element-type=add]').removeClass('active')
      editor.render()
      elements.show(editor.program_stats())
    }
    active_element_drag = false
  }) //}}}
  editor.target.on('dragover','g[element-type=add]',(ev)=>{ //{{{
    ev.preventDefault()
    ev.stopPropagation()
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^[a-z]{2}[a-z0-9_]+$/) || ev.originalEvent.dataTransfer.getData("text/plain").match(/^a\d+$/) || active_element_drag) {
      $(ev.currentTarget).addClass('active')
    }
  }) //}}}
  editor.target.on('dragleave','g[element-type=add]',(ev)=>{ //{{{
    ev.preventDefault()
    ev.stopPropagation()
    if (ev.originalEvent.dataTransfer.getData("text/plain").match(/^[a-z]{2}[a-z0-9_]+$/) || ev.originalEvent.dataTransfer.getData("text/plain").match(/^a\d+$/) || active_element_drag) {
      $(ev.currentTarget).removeClass('active')
    }
  }) //}}}

  $('button.mission').click(ev=>{
    field.target.find('div.victory').removeClass('active')
    field.target.find('div.mission').toggleClass('active')
  })
  field.target.find('div.mission div.top img').click(ev=>{
    field.target.find('div.mission').toggleClass('active')
  })
  field.target.find('div.victory div.top img').click(ev=>{
    field.target.find('div.victory').toggleClass('active')
  })
  $('button.control').click(ev=>{
    field.target.find('div.victory').removeClass('active')
    field.target.find('div.mission').removeClass('active')
    if (editor.program.length > 0) {
      $('button.control img').removeClass('important')
      if ($(ev.currentTarget).hasClass('active')) {
        $('button.speed').hide()
        walker.trigger_stop()
      } else {
        if (active_del_timeout) {
          clearTimeout(active_del_timeout)
        }
        if (active_del != '') {
          editor.target_svg.find('g[element-group=drop] g[element-type=delete][element-id]').removeClass('active')
          active_del = ''
        }
        $('button.speed img').hide()
        $('button.speed img.normal').show()
        $('button.speed').show()
        walker.walk()
        $.ajax({
          type: 'POST',
          url: 'save.php',
          data: { "level": field.title.trim().replace(/[^a-zA-Z0-9!?()-]/g,'_'), "solution": JSON.stringify(editor.program,null,2) }
        });
      }
      $(ev.currentTarget).toggleClass('active')
    }
  })
  $('button.speed').click(ev=>{
    walker.speed_control()
  })
  document.addEventListener('speed:fast', (e) => {
    $('button.speed img').hide()
    $('button.speed img.fast').show()
  })
  document.addEventListener('speed:normal', (e) => {
    $('button.speed img').hide()
    $('button.speed img.normal').show()
  })
  document.addEventListener('speed:pause', (e) => {
    $('button.speed img').hide()
    $('button.speed img.pause').show()
  })
  document.addEventListener('cisc:changed', (e) => {
    field.target.find('div.stats .cisc .value').text(editor.cisc_length())
    success = 0
    field.target.find('div.stats .success .value').text(success)
  })
  document.addEventListener('ins:changed', (e) => {
    field.target.find('div.stats .ins .value').text(walker.ins_count())
  })
  document.addEventListener('steps:changed', (e) => {
    field.target.find('div.stats .steps .value').text(walker.step_count())
  })
  document.addEventListener('cmps:changed', (e) => {
    field.target.find('div.stats .cmps .value').text(walker.cmps_count())
  })
  document.addEventListener('walking:success', (e) => {
    success += 1
    if (success >= field.success) {
      setTimeout(()=>{
        field.target.find('div.mission').removeClass('active')
        field.target.find('div.victory').toggleClass('active')
        let cisc = editor.cisc_length()
        let ins = walker.ins_count()
        let steps = walker.step_count()
        let cmps = walker.cmps_count()
        let level_src = $.parseQuerySimple().level
        let sol_stats = { "cisc": cisc,
                          "ins": ins,
                          "steps": steps,
                          "cmps": cmps,
                          "level_src": level_src
                        }

        field.target.find('div.victory .text .title .value').text(field.title.trim())
        field.target.find('div.victory .text .steps .value').text(steps)
        field.target.find('div.victory .text .cmps .value').text(cmps)
        field.target.find('div.victory .text .ins .value').text(ins)
        field.target.find('div.victory .text .cisc .value').text(cisc)
        field.target.find('div.victory .text .reference_rank .value').text(field.max_score)
        $.ajax({
          type: 'POST',
          url: 'save_scores.php',
          data: { "level": field.title.trim().replace(/[^a-zA-Z0-9!?()-]/g,'_'),
                  "stats": JSON.stringify(sol_stats,null,2),
                  "solution": JSON.stringify(editor.program,null,2)}
        });
      },1000)
      assets.play_audio(assets.audio.yay.sounds.sample())
    } else {
      assets.say(assets.texts.again,'div.speech')
    }
    field.target.find('div.stats .success .value').text(success)
  })
  document.addEventListener('walking:nosuccess', (e) => {
    success = 0
    assets.play_audio(assets.audio.no.sounds.sample())
    field.target.find('div.stats .success .value').text(success)
  })

  $('button.save').click(ev=>{
    $('#saveinstructions').attr('download',field.title.trim().replace(/[^a-zA-Z0-9!?()-]/g,'_') + '.json')
    $('#saveinstructions').attr('href','data:application/xml;charset=utf-8;base64,' + $B64(JSON.stringify(editor.program,null,2)))
    document.getElementById('saveinstructions').click()
  })
  $('button.load').click(ev=>{
    document.getElementById('loadinstructions').click()
  })
  $("input[name=loadinstructions]").change(ev=>{
    if (typeof window.FileReader !== 'function') {
      alert('FileReader not yet supportet')
      return
    }
    var files = $('#loadinstructions').get(0).files
    var reader = new FileReader()
    reader.onload = ()=>{
      editor.program = JSON.parse(reader.result)
      editor.render()
      elements.show(editor.program_stats())
      document.getElementById('fuckchrome').reset()
      editor.get_pids().forEach(pid => {
        elements.target.find('img[data-type=execute' + pid + ']').show()
      })
      field.target.find('div.stats .cisc .value').text(editor.cisc_length())
    }
    reader.onerror = function(){ console.log('error reading file'); loading = false; }
    reader.onabort = function(){ console.log('abort reading file'); loading = false; }
    reader.readAsText(files[0])
  })
})
