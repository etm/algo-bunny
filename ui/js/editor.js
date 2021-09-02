class Editor {
  #tile_width
  #tile_height
  #scale_factor
  #height_shift

  #width_add
  #height_add

  #changed

  #draw_drag_layer(width,height) { //{{{
    let g1 = $X('<foreignObject x="0" y="0" width="' + width + '" height="' + height + '" xmlns="http://www.w3.org/2000/svg" requiredExtensions="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml" draggable="true" style="width: 100%; height:100%"></div></foreignObject>')
    this.target_drag.append(g1)
  } //}}}

  constructor(target,assets) { //{{{
    this.assets = assets
    this.target = target

    let t1 = $X('<g element-group="graph" xmlns="http://www.w3.org/2000/svg"></g>')
    let t2 = $X('<g element-group="drop"  xmlns="http://www.w3.org/2000/svg"></g>')
    let t3 = $X('<g element-group="drag"  xmlns="http://www.w3.org/2000/svg"></g>')
    target.append(t1)
    target.append(t2)
    target.append(t3)

    this.target_graph = t1
    this.target_drop = t2
    this.target_drag = t3

    this.#tile_width = 26.4
    this.#tile_height = 27
    this.#scale_factor = 2.21
    this.#height_shift = 10

    this.#width_add = this.#tile_width + 12
    this.#height_add = this.#tile_height + 8

    this.#changed = new Event("cisc:changed", {"bubbles":false, "cancelable":false})

    this.program = []
  }  //}}}

  #draw_asset(id,what,x,y,op='',shift_y=0) { //{{{
    let item = this.assets.placeholders[what]
    let grax = item.graphics['icon'].clone()
    let g2 = $X('<g element-type="' + what + '" element-op="' + op  + '" element-id="' + id  + '" transform="scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + ((x-1) * this.#tile_width) + ',' + ((y-1) * this.#tile_height + shift_y) + ')" xmlns="http://www.w3.org/2000/svg"></g>')
        g2.append(grax)
    this.target_drop.append(g2)
  } //}}}

  #draw(id,i,x,y,what,parent) { //{{{
    let name = (typeof(i) == 'object') ? i.item : i
    let item = this.assets.commands[name]
    let grax = item.graphics[what].clone()
    let g1 = $X('<g draggable="true" class="element" element-type="' + name + '" element-id="' + id  + '" xmlns="http://www.w3.org/2000/svg"></g>')
    if (item.type == 'position') {
      if (i.target != '') {
        g1.attr('element-para',i.target)
        g1.addClass('targeting')
      }
    }
    if (item.type == 'execute') {
      grax.find('#tid').text('P' + i.id)
    }
    let g2 = $X('<g transform="scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + ((x-1) * this.#tile_width) + ',' + ((y-1) * this.#tile_height) + ')" xmlns="http://www.w3.org/2000/svg"></g>')
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

  #iter(it,x,y,parent) { //{{{
    let width = x == 0 ? 1 : x
    for (const [k,v] of it) {
      if (typeof(v) == 'string' || (typeof(v) == 'object' && v != null && !('first' in v))) {
        y += 1
        this.#draw(k,v,x,y,'icon',parent)
        this.#draw_asset(k,'add',x,y,'after',this.#tile_height/2)
        this.#draw_asset(k,'delete',x,y,'at')
        this.#draw_asset(k,'here',x,y,'at')
      }  else {
        let [l,w] = this.#dig(k,v,x,y,parent)
        y = l
        if (w > width) { width = w }
      }
    }
    return [y,width]
  } //}}}
  #dig(id,sub,x,y,parent) { //{{{
    let width = x
    y += 1
    if (sub == null) { return [y,width] }
    this.#draw(id,sub,x,y,'first',parent)
    this.#draw(id,sub,x,y,'first_icon',id)
    this.#draw_asset(id,'delete',x+1,y,'at')
    this.#draw_asset(id,'here',x+1,y,'at')
    if (sub.first) {
      this.#draw_asset(id,'add',x+1,y,'insert_first',this.#tile_height/2)
      let [dy, w] = this.#iter(sub.first,x+1,y,id)
      for (let i = y+1; i <= dy; i++) {
        this.#draw(id,sub,x,i,'middle',id)
      }
      y = dy
      if (w > width) { width = w }
    }
    if (sub.second) {
      y += 1
      this.#draw(id,sub,x,y,'second',id)
      this.#draw(id,sub,x,y,'second_icon',id)
      this.#draw_asset(id,'add',x+1,y,'insert_second',this.#tile_height/2)
      let [dy, w] = this.#iter(sub.second,x+1,y,id)
      for (let i = y+1; i <= dy; i++) {
        this.#draw(id,sub,x,i,'middle',id)
      }
      y = dy
      if (w > width) { width = w }
    }
    y += 1
    this.#draw(id,sub,x,y,'end',id)
    if (sub.item != 'execute') {
      this.#draw_asset(id,'add',x,y,'after',this.#tile_height/2)
    }
    return [y,width]
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
    document.dispatchEvent(this.#changed)
  } //}}}

  #get_item_rec(it,eid){ //{{{
    let ret
    for (const [k,v] of it) {
      if (k == eid) {
        return [k,v]
      }
      if (typeof(v) == 'object') {
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
  #move_rec(it,eid,eop,eco) { //{{{
    let newp = []
    for (const [k,v] of it) {
      newp.push([k,v])
      if (k == eid) {
        if (eop == 'after') {
          newp.push([this.#newid(),eco[1]])
        }
        if (eop == 'insert_first') {
          v.first.unshift([this.#newid(),eco[1]])
        }
        if (eop == 'insert_second') {
          v.second.unshift([this.#newid(),eco[1]])
        }
      }
      if (typeof(v) == 'object') {
        if (v != null && v.first) {
          v.first = this.#move_rec(v.first,eid,eop,eco)
        }
        if (v != null && v.second) {
          v.second = this.#move_rec(v.second,eid,eop,eco)
        }
      }
    }
    return newp
  } //}}}
  move_item(eid,eop,eit) { //{{{
    let eco = JSON.parse(JSON.stringify(this.#get_item_rec(this.program,eit)))
    if (eid == '' && eop == 'insert_first') {
      this.program.unshift([this.#newid(),eco[1]])
    } else {
      this.program = this.#move_rec(this.program,eid,eop,eco)
    }
    this.program = this.#remove_item_rec(this.program,eit)
    document.dispatchEvent(this.#changed)
  } //}}}

  #clear() { //{{{
    this.target_graph.empty()
    this.target_drop.empty()
    this.target_drag.empty()
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
    if (item.type == 'execute_item') {
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
    return "a" + (_.max(ids) + 1)
  } //}}}
  #insert_rec(it,eid,eop,ety,nid) { //{{{
    let newp = []
    for (const [k,v] of it) {
      newp.push([k,v])
      if (k == eid) {
        if (eop == 'after') {
          newp.push([this.#newid(),this.#insert_rec_item(ety)])
        }
        if (eop == 'insert_first') {
          v.first.unshift([this.#newid(),this.#insert_rec_item(ety)])
        }
        if (eop == 'insert_second') {
          v.second.unshift([this.#newid(),this.#insert_rec_item(ety)])
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

  #get_free_pid_rec(it){ //{{{
    let ret = []
    for (const [k,v] of it) {
      if (typeof(v) == 'object') {
        if (v != null && v.item == 'execute') {
          ret.push(v.id)
        }
        if (v != null && v.first && ret === undefined) {
          ret = ret.concat(this.#get_free_pid_rec(v.first))
        }
        if (v != null && v.second && ret === undefined) {
          ret = ret.concat(this.#get_free_pid_rec(v.second))
        }
      }
    }
    return ret
  } //}}}
  get_free_pid() { //{{{
    let pids = this.#get_free_pid_rec(this.program)
    for (let i = 1; i<10; i++) {
      if (!pids.includes(i)) {
        return i
      }
    }
  } //}}}

  #cisc_length_rec(it) { //{{{
    let count = 0
    for (const [k,v] of it) {
      count++
      if (typeof(v) == 'object') {
        if (v != null && v.first) {
          count += this.#cisc_length_rec(v.first)
        }
        if (v != null && v.second) {
          count += this.#cisc_length_rec(v.second)
        }
      }
    }
    return count
  } //}}}
  cisc_length(){ //{{{
    return this.#cisc_length_rec(this.program)
  } //}}}

  render() {
    this.#clear()
    this.#draw_asset('','bunny',1,1,'start')
    this.#draw_asset('','add',1,1,'insert_first',this.#tile_height/2)
    let [y,w] = this.#iter(this.program,1,1)
    let hei = y * this.#tile_height * this.#scale_factor + this.#height_add
    let wid = w * this.#tile_width * this.#scale_factor + this.#width_add
    this.target.attr('height', hei)
    this.target.attr('width',  wid)

    this.#draw_drag_layer(wid,hei)
  }
}
