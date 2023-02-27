class Editor {
  #tile_width
  #tile_height
  #scale_factor
  #height_shift

  #width_add
  #height_add

  #changed

  constructor(target,assets,id) { //{{{
    this.assets = assets
    this.target = target
    this.target_svg = target.find('svg')
    this.id = id

    let t0 = $X('<g element-group="below" xmlns="http://www.w3.org/2000/svg"></g>')
    let t1 = $X('<g element-group="graph" xmlns="http://www.w3.org/2000/svg"></g>')
    let t2 = $X('<g element-group="drop"  xmlns="http://www.w3.org/2000/svg"></g>')
    this.target_svg.append(t0)
    this.target_svg.append(t1)
    this.target_svg.append(t2)

    this.groups = {
      'below': $X('<g element-x="" element-y="" element-type="" element-op="" element-id="" transform="" xmlns="http://www.w3.org/2000/svg"></g>'),
      'asset': $X('<g element-x="" element-y="" element-type="" element-op="" element-id="" transform="" xmlns="http://www.w3.org/2000/svg"></g>'),
      'drag': $X('<g element-x="" element-y="" transform="" xmlns="http://www.w3.org/2000/svg"><foreignObject width="" height="" requiredExtensions="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml" draggable="true" style="width: 100%; height:100%"></div></foreignObject></g>'),
      'element': $X('<g class="element" element-type="" element-id="" xmlns="http://www.w3.org/2000/svg"></g>'),
      'sub': $X('<g element-x="" element-y="" transform="" xmlns="http://www.w3.org/2000/svg"></g>')
    }

    this.target_below = t0
    this.target_graph = t1
    this.target_drop = t2

    this.#tile_width = 26.4
    this.#tile_height = 27
    this.#scale_factor = 2.21
    this.#height_shift = 10

    this.#width_add = this.#tile_width + 12
    this.#height_add = this.#tile_height + 8

    this.#changed = new Event("cisc:changed", {"bubbles":false, "cancelable":false})

    this.program = []

    this.add_id = null
    this.remove_ids = []
  }  //}}}

  #draw_below(id,what,x,y,op='',shift_y=0) { //{{{
    let item = this.assets.placeholders[what]
    let grax = item.graphics['icon'].clone()
    let g2 = this.groups.below.clone()
        g2.attr('element-x',x)
        g2.attr('element-y',y)
        g2.attr('element-type',what)
        g2.attr('element-op',op)
        g2.attr('element-id',id)
        g2.attr('transform','scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + ((x-1) * this.#tile_width) + ',' + ((y-1) * this.#tile_height + shift_y) + ')')
        g2.attr('transform-t-x',(x-1) * this.#tile_width)
        g2.attr('transform-t-y',(y-1) * this.#tile_height + shift_y)
        g2.append(grax)
    this.target_below.append(g2)
  } //}}}
  #draw_asset(id,what,x,y,op='',shift_y=0,mark=null) { //{{{
    let item = this.assets.placeholders[what]
    let grax = item.graphics['icon'].clone()
    let g2 = this.groups.asset.clone()
        g2.attr('element-x',x)
        g2.attr('element-y',y)
        g2.attr('element-type',what)
        g2.attr('element-op',op)
        g2.attr('element-id',id)
        g2.attr('transform','scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + ((x-1) * this.#tile_width) + ',' + ((y-1) * this.#tile_height + shift_y) + ')')
        g2.attr('transform-t-x',(x-1) * this.#tile_width)
        g2.attr('transform-t-y',(y-1) * this.#tile_height + shift_y)
        if (mark!=null) { g2.attr('element-mark','true') }
        g2.append(grax)
    this.target_drop.append(g2)
  } //}}}

  #draw_drag(x,y,parent,mark=null) { //{{{
    let tar = this.target_graph.find('g[element-id=' + parent + ']')
    let g2 = this.groups.drag.clone()
        g2.attr('element-x',x)
        g2.attr('element-y',y)
        g2.attr('transform','scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + ((x-1) * this.#tile_width) + ',' + ((y-1) * this.#tile_height) + ')')
        g2.attr('transform-t-x',(x-1) * this.#tile_width)
        g2.attr('transform-t-y',(y-1) * this.#tile_height)
        if (mark!=null) { g2.attr('element-mark','true') }
    let g3 = g2.find('foreignObject')
        g3.attr('width',this.#tile_width)
        g3.attr('height',this.#tile_height)
    tar.append(g2)
  } //}}}

  #draw(id,i,x,y,what,parent,mark=null) { //{{{
    let name = (typeof(i) == 'object') ? i.item : i
    let item = this.assets.commands[name]
    let grax = item.graphics[what].clone()
    let g1 = this.groups.element.clone()
        g1.attr('element-x',x)
        g1.attr('element-y',y)
        g1.attr('element-type',name)
        g1.attr('element-id',id)
        if (mark!=null) { g1.attr('element-mark','true') }
    if (item.type == 'position') {
      if (i.target != '') {
        g1.attr('element-para',i.target)
        g1.addClass('targeting')
      }
    }
    if (item.type == 'execute') {
      grax.find('#tid').text('P' + i.id)
    }
    let g2 = this.groups.sub.clone()
        g2.attr('element-x',x)
        g2.attr('element-y',y)
        g2.attr('transform','scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + ((x-1) * this.#tile_width) + ',' + ((y-1) * this.#tile_height) + ')')
        g2.attr('transform-t-x',(x-1) * this.#tile_width)
        g2.attr('transform-t-y',(y-1) * this.#tile_height)
        if (mark!=null) { g2.attr('element-mark','true') }
        g2.append(grax)
        g1.append(g2)
    if (parent) {
      let tar = this.target_graph.find('g[element-id=' + parent + ']')
      if (id == parent) {
        tar.append(g2)
      } else {
        tar.append(g1)
      }
    } else {
      this.target_graph.append(g1)
    }
  } //}}}

  #iter(it,x,y,parent,particular) { //{{{
    let width = x == 0 ? 1 : x
    let part = false
    for (const [k,v] of it) {
      if (typeof(v) == 'string' || (typeof(v) == 'object' && v != null && !('first' in v))) {
        y += 1
        if (particular === undefined || particular == k) {
          this.#draw(k,v,x,y,'icon',parent,particular == k ? true : null)
          this.#draw_drag(x,y,k,particular == k ? true : null)
          this.#draw_asset(k,'add',x,y,'after',this.#tile_height/2,particular == k ? true : null)
          this.#draw_asset(k,'delete',x,y,'at',0,                  particular == k ? true : null)
          this.#draw_asset(k,'here',x,y,'at',0,                    particular == k ? true : null)
          if (particular == k) { part = true }
        }
      }  else {
        let [l,w,tp] = this.#dig(k,v,x,y,parent,particular)
        part = part || tp ? true : false
        y = l
        if (w > width) { width = w }
      }
    }
    return [y,width,part]
  } //}}}
  #dig(id,sub,x,y,parent,particular) { //{{{
    let width = x
    y += 1
    let gpart = (particular == id)
    if (sub == null) { return [y,width] }
    if (particular === undefined || particular == id) {
      this.#draw(id,sub,x,y,'first',parent,particular == id ? true : null)
      this.#draw(id,sub,x,y,'first_icon',id,particular == id ? true : null)
      this.#draw_drag(x,y,id,particular == id ? true : null)
      this.#draw_drag(x+1,y,id,particular == id ? true : null)
      this.#draw_asset(id,'delete',x+1,y,'at',0,particular == id ? true : null)
      this.#draw_asset(id,'here',x+1,y,'at',0,particular == id ? true : null)
    }
    if (sub.first) {
      if (particular === undefined || particular == id) {
        this.#draw_asset(id,'add',x+1,y,'insert_first',this.#tile_height/2,particular == id ? true : null)
      }
      let [dy, w, part] = this.#iter(sub.first,x+1,y,id,particular)
      gpart = part || gpart ? true : false
      for (let i = y+1; i <= dy; i++) {
        if (particular === undefined || particular == id || part) {
          this.#draw(id,sub,x,i,'middle',id,gpart ? true : null)
          this.#draw_drag(x,i,id,gpart ? true : null)
        }
      }
      y = dy
      if (w > width) { width = w }
    }
    if (sub.second) {
      y += 1
      if (particular === undefined || particular == id) {
        this.#draw(id,sub,x,y,'second',id,particular == id ? true : null)
        this.#draw(id,sub,x,y,'second_icon',id,particular == id ? true : null)
        this.#draw_drag(x,y,id,particular == id ? true : null)
        this.#draw_drag(x+1,y,id,particular == id ? true : null)
        this.#draw_asset(id,'add',x+1,y,'insert_second',this.#tile_height/2,particular == id ? true : null)
      }
      let [dy, w, part] = this.#iter(sub.second,x+1,y,id,particular)
      gpart = part || gpart ? true : false
      for (let i = y+1; i <= dy; i++) {
        if (particular === undefined || particular == id || part) {
          this.#draw(id,sub,x,i,'middle',id,gpart ? true : null)
          this.#draw_drag(x,i,id,gpart ? true : null)
        }
      }
      y = dy
      if (w > width) { width = w }
    }
    y += 1
    if (particular === undefined || particular == id) {
      this.#draw(id,sub,x,y,'end',id,particular == id ? true : null)
      this.#draw_drag(x,y,id,particular == id ? true : null)
      this.#draw_drag(x+1,y,id,particular == id ? true : null)
    }
    if (sub.item != 'execute') {
      if (particular === undefined || particular == id) {
        this.#draw_asset(id,'add',x,y,'after',this.#tile_height/2,particular == id ? true : null)
      }
    }
    return [y,width,gpart]
  } //}}}

  #remove_item_rec(it,eid){ //{{{
    let newp = []
    for (const [k,v] of it) {
      if (k == eid) {
        if (newp.length > 0 && newp[newp.length-1][1] == null) {
          newp.pop()
        }
      } else {
        newp.push([k,v])
      }
      if (typeof(v) == 'object') {
        if (v != null && v.first) {
          v.first = this.#remove_item_rec(v.first,eid)
        }
        if (v != null && v.second) {
          v.second = this.#remove_item_rec(v.second,eid)
        }
      }
    }
    return newp
  } //}}}
  remove_item(eid) { //{{{
    this.program = this.#remove_item_rec(this.program,eid)
    this.remove_ids.push(eid)
    document.dispatchEvent(this.#changed)
  } //}}}
  #remove_item_by_type_rec(it,type){ //{{{
    let newp = []
    for (const [k,v] of it) {
      if (typeof(v) == 'string') {
        if (v == type) {
          this.remove_ids.push(k)
        } else {
          newp.push([k,v])
        }
      }
      if (typeof(v) == 'object') {
        if (v == null) {
          newp.push([k,v])
        } else {
          if (v.item == type) {
            this.remove_ids.push(k)
          } else {
            newp.push([k,v])
            if (v.first) {
              v.first = this.#remove_item_by_type_rec(v.first,type)
            }
            if (v.second) {
              v.second = this.#remove_item_by_type_rec(v.second,type)
            }
          }
        }
      }
    }
    return newp
  } //}}}
  remove_item_by_type(type) { //{{{
    this.program = this.#remove_item_by_type_rec(this.program,type)
  } //}}}

  #get_item_rec(it,eid){ //{{{
    let ret
    for (const [k,v] of it) {
      if (k == eid) {
        return v
      }
      if (typeof(v) == 'object' && v != null) {
        if (v.first && ret === undefined) {
          ret = this.#get_item_rec(v.first,eid)
        }
        if (v.second && ret === undefined) {
          ret = this.#get_item_rec(v.second,eid)
        }
      }
    }
    return ret
  } //}}}
  get_item(eid) { //{{{
    return this.#get_item_rec(this.program,eid)
  } //}}}
  #get_item_by_pid_rec(it,pid){ //{{{
    let ret
    for (const [k,v] of it) {
      if (typeof(v) == 'object' && v != null) {
        if (v.id == pid) {
          return v
        } else {
          if (v.first && ret === undefined) {
            ret = this.#get_item_by_pid_rec(v.first,pid)
          }
          if (v.second && ret === undefined) {
            ret = this.#get_item_by_pid_rec(v.second,pid)
          }
        }
      }
    }
    return ret
  } //}}}
  get_item_by_pid(pid) { //{{{
    return this.#get_item_by_pid_rec(this.program,pid)
  } //}}}
  #move_rec(it,eid,eop,eco,nid) { //{{{
    let newp = []
    for (const [k,v] of it) {
      newp.push([k,v])
      if (k == eid) {
        if (eop == 'after') {
          newp.push([nid,eco])
        }
        if (eop == 'insert_first') {
          v.first.unshift([nid,eco])
        }
        if (eop == 'insert_second') {
          v.second.unshift([nid,eco])
        }
      }
      if (typeof(v) == 'object') {
        if (v != null && v.first) {
          v.first = this.#move_rec(v.first,eid,eop,eco,nid)
        }
        if (v != null && v.second) {
          v.second = this.#move_rec(v.second,eid,eop,eco,nid)
        }
      }
    }
    return newp
  } //}}}
  move_item(eid,eop,eit) { //{{{
    let nid = this.#newid()
    this.add_id = nid
    let eco = JSON.parse(JSON.stringify(this.#get_item_rec(this.program,eit)))
    if (eid == '' && eop == 'insert_first') {
      this.program.unshift([nid,eco])
    } else {
      this.program = this.#move_rec(this.program,eid,eop,eco,nid)
    }
    this.program = this.#remove_item_rec(this.program,eit)
    this.remove_ids.push(eit)
    document.dispatchEvent(this.#changed)
  } //}}}

  #clear() { //{{{
    this.target_graph.empty()
    this.target_drop.empty()
  } //}}}

  #insert_rec_item(ety) { //{{{
    if (ety == null) { return ety }

    let item = this.assets.commands[ety]
    if (item.type == 'simple') {
      return ety
    }
    if (item.type == 'complex_one') {
      return { "item": ety, "first": [] }
    }
    if (item.type == 'complex_two') {
      return { "item": ety, "first": [], "second": [] }
    }
    if (item.type == 'position') {
      return { "item": ety, "target": "" }
    }
    if (item.type == 'execute') {
      return { "item": ety, "first": [], "id": "" }
    }
  } //}}}
  #newid_rec(it) { //{{{
    let ids = [0]
    for (const [k,v] of it) {
      ids.push(parseInt(k.replace(/^\w/,'')))
      if (typeof(v) == 'object') {
        if (v != null && v.first) {
          ids = ids.concat(this.#newid_rec(v.first))
        }
        if (v != null && v.second) {
          ids = ids.concat(this.#newid_rec(v.second))
        }
      }

    }
    return ids
  }  //}}}
  #newid(){ //{{{
    let ids = this.#newid_rec(this.program)
    return "a" + (Math.max(...ids) + 1)
  } //}}}
  #insert_rec(it,eid,eop,ety,nid) { //{{{
    let newp = []
    for (const [k,v] of it) {
      newp.push([k,v])
      if (k == eid) {
        if (eop == 'after') {
          newp.push([nid,this.#insert_rec_item(ety)])
        }
        if (eop == 'insert_first') {
          v.first.unshift([nid,this.#insert_rec_item(ety)])
        }
        if (eop == 'insert_second') {
          v.second.unshift([nid,this.#insert_rec_item(ety)])
        }
      }
      if (typeof(v) == 'object') {
        if (v != null && v.first) {
          v.first = this.#insert_rec(v.first,eid,eop,ety,nid)
        }
        if (v != null && v.second) {
          v.second = this.#insert_rec(v.second,eid,eop,ety,nid)
        }
      }
    }
    return newp
  } //}}}
  insert_item(eid,eop,ety) { //{{{
    let nid = this.#newid()
    this.add_id = nid
    if (eid == '' && eop == 'insert_first') {
      this.program.unshift([nid,this.#insert_rec_item(ety)])
    } else if (eid == '' && eop == 'insert_last') {
      this.program.push([nid,this.#insert_rec_item(ety)])
    } else {
      this.program = this.#insert_rec(this.program,eid,eop,ety,nid)
    }
    document.dispatchEvent(this.#changed)
    return nid
  } //}}}

  #update_rec(it,eid,para,value) { //{{{
    let newp = []
    for (const [k,v] of it) {
      if (k == eid) {
        v[para] = value
      }
      newp.push([k,v])
      if (typeof(v) == 'object') {
        if (v != null && v.first) {
          v.first = this.#update_rec(v.first,eid,para,value)
        }
        if (v != null && v.second) {
          v.second = this.#update_rec(v.second,eid,para,value)
        }
      }
    }
    return newp
  } //}}}
  update_item(eid,para,value) { //{{{
    this.program = this.#update_rec(this.program,eid,para,value)
  } //}}}

  #get_pids_rec(it){ //{{{
    let ret = []
    for (const [k,v] of it) {
      if (typeof(v) == 'object') {
        if (v != null && v.item == 'execute') {
          ret.push(v.id)
        }
        if (v != null && v.first && ret === undefined) {
          ret = ret.concat(this.#get_pids_rec(v.first))
        }
        if (v != null && v.second && ret === undefined) {
          ret = ret.concat(this.#get_pids_rec(v.second))
        }
      }
    }
    return ret
  } //}}}
  get_pids() { //{{{
    return this.#get_pids_rec(this.program)
  } //}}}
  get_free_pid() { //{{{
    let pids = this.#get_pids_rec(this.program)
    for (let i = 1; i<10; i++) {
      if (!pids.includes(i)) {
        return i
      }
    }
  } //}}}

  #cisc_length_rec(it) { //{{{
    let count = 0
    for (const [k,v] of it) {
      if (v != null) { count++ }
      if (typeof(v) == 'object' && v != null) {
        if (v.first) {
          count += this.#cisc_length_rec(v.first)
        }
        if (v.second) {
          count += this.#cisc_length_rec(v.second)
        }
      }
    }
    return count
  } //}}}

  cisc_length(){ //{{{
    return this.#cisc_length_rec(this.program)
  } //}}}

  #render_remove() { //{{{
    let aggr_shift = 0;
    this.remove_ids.forEach(e=>{
      let ele = $('div.program svg g[element-id=' + e + ']')
      let ys = []
      ele.find('g[element-y]').each((i,e)=>{
        ys.push(parseInt($(e).attr('element-y')))
      });
      let shift = Math.max(...ys) + 1 - Math.min(...ys)
      if (ele.attr('element-type') == 'execute') { shift += 1 }
      aggr_shift += shift
      let maxy = Math.max(...ys)
      ele.remove()
      let rest = $('div.program svg g[element-y]')
      rest.each((i,rr) => {
        let r = $(rr)
        let ry = parseInt(r.attr('element-y'))
        if (ys.includes(ry)) {
          r.remove()
        }
        if (ry > maxy) {
          if (r.attr('transform')) {
            let t_x = parseFloat(r.attr('transform-t-x'))
            let t_y = parseFloat(r.attr('transform-t-y'))
            r.attr('transform-t-y',t_y - shift*this.#tile_height)
            r.attr('transform','scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + t_x + ',' + (t_y - shift*this.#tile_height) + ')')
          }
          r.attr('element-y',ry-shift)
        }
      })
    })
    this.remove_ids = []
    let hei = parseFloat(this.target_svg.attr('height'))
    this.target_svg.attr('height', hei - aggr_shift * this.#scale_factor * this.#tile_height)
  } //}}}
  #render_add() { //{{{
    let aggr_shift = 0;

    let ele = $('div.program svg g[element-id=' + this.add_id + ']')
    let x = parseInt(ele.attr('element-x'))
    let ys = []
    ele.find('g[element-y]').each((i,e)=>{
      ys.push(parseInt($(e).attr('element-y')))
    });
    let shift = Math.max(...ys) + 1 - Math.min(...ys)
    if (ele.attr('element-type') == 'execute') { shift += 1 }
    aggr_shift += shift
    let miny = Math.min(...ys)
    let rest = $('div.program svg g[element-y]')
    rest.each((i,rr) => {
      let r = $(rr)
      if (r.attr('element-mark')) { return }
      let ry = parseInt(r.attr('element-y'))
      let rx = parseInt(r.attr('element-x'))

      if (ry >= miny) {
        if (r.attr('transform')) {
          let t_x = parseFloat(r.attr('transform-t-x'))
          let t_y = parseFloat(r.attr('transform-t-y'))
          r.attr('transform-t-y',t_y + shift*this.#tile_height)
          r.attr('transform','scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + t_x + ',' + (t_y + shift*this.#tile_height) + ')')
        }
        r.attr('element-y',ry+shift)
      }
    })

    $('div.program svg g[element-mark]').each((i,e) => {
      $(e).removeAttr('element-mark')
    })

    this.add_id = null
  } //}}}

  render() { //{{{
    this.add_id = null
    this.#render_remove()
    this.#clear()
    this.#draw_asset('','bunny',1,1,'start')
    this.#draw_below('','below',1,1,'')
    this.#draw_asset('','add',1,1,'insert_first',this.#tile_height/2)
    let [y,w] = this.#iter(this.program,1,1,undefined)
    let hei = y * this.#tile_height * this.#scale_factor + this.#height_add
    let wid = w * this.#tile_width * this.#scale_factor + this.#width_add
    this.target_svg.attr('height', hei)
    this.target_svg.attr('width',  wid)
    window.localStorage.setItem(this.id, JSON.stringify(this.program,null,2));
    window.localStorage.setItem('current', JSON.stringify(this.program,null,2));

  } //}}}
  render_diff() { //{{{
    if (this.add_id != null) {
      let [y,w] = this.#iter(this.program,1,1,undefined,this.add_id)
      this.#render_add()
      let hei = y * this.#tile_height * this.#scale_factor + this.#height_add
      let wid = w * this.#tile_width * this.#scale_factor + this.#width_add
      this.target_svg.attr('height', hei)
      this.target_svg.attr('width',  wid)
    }
    this.#render_remove()
    window.localStorage.setItem(this.id, JSON.stringify(this.program,null,2));
    window.localStorage.setItem('current', JSON.stringify(this.program,null,2));
  } //}}}


  #program_walk(it) {
    if (typeof(it) == null || it === undefined) { return [] }
    let result = []
    for (const [k,v] of it) {
      if (typeof(v) == 'string') {
        result.push(v)
      }

      if (typeof(v) == 'object' && v != null) {
        result.push(v.item)
        result = result.concat(this.#program_walk(v.first))
        result = result.concat(this.#program_walk(v.second))
      }
    }
    return result
  }
  program_stats() {
    const result = this.#program_walk(this.program)
    const counts = {}
    result.forEach((x)=>{ counts[x] = (counts[x] || 0) + 1 })
    return counts
  }
}
