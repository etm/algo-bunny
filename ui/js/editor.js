class Editor {
  #tile_width;
  #tile_height;
  #scale_factor;
  #height_shift;

  constructor(target,commands) { //{{{
    this.commands = commands;
    this.target = target;
    this.#tile_width = 26.4;
    this.#tile_height = 27;
    this.#scale_factor = 2.21;
    this.#height_shift = 10;
    this.program = {
      "a1": "forward",
      "a2": "forward",
      "a3": {
        "item": "if_smaller",
        "first": {
          "a4": "forward",
          "a5": {
            "item": "loop",
            "first": {
              "a8": "forward"
            }
          }
        },
        "second": {}
      },
      "a6": {
        "item": "loop",
        "first": { }
      }
    }
  }  //}}}

  #draw(id,i,x,y,what,parent) { //{{{
    let item = this.commands.items[i];
    let grax = item.graphics[what].clone();
    let g1 = $X('<g class="element" element-type="' + i + '" element-id="' + id  + '" xmlns="http://www.w3.org/2000/svg"></g>');
    let g2 = $X('<g transform="scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + ((x-1) * this.#tile_width) + ',' + ((y-1) * this.#tile_height) + ')" xmlns="http://www.w3.org/2000/svg"></g>');
        g2.append(grax);
        g1.append(g2);
    if (parent) {
      let tar = this.target.find('g[element-id=' + parent + ']');
      if (id == parent) {
        tar.append(g2);
      } else {
        tar.append(g1);
      }
    } else {
      this.target.append(g1);
    }
  } //}}}

  #iter(it,x,y,parent) { //{{{
    let width = x == 0 ? 1 : x;
    for (const [k,v] of Object.entries(it)) {
      if (typeof(v) == 'string') {
        y += 1;
        this.#draw(k,v,x,y,'icon',parent);
      }
      if (typeof(v) == 'object') {
        let [l,w] = this.#dig(k,v,x,y,parent);
        y = l;
        if (w > width) { width = w; }
      }
    }
    return [y,width];
  } //}}}

  #dig(id,sub,x,y,parent) { //{{{
    let width = x;
    y += 1;
    this.#draw(id,sub.item,x,y,'first',parent);
    this.#draw(id,sub.item,x,y,'first_icon',id);
    if (sub.first) {
      let [dy, w] = this.#iter(sub.first,x+1,y,id);
      for (let i = y+1; i <= dy; i++) {
        this.#draw(id,sub.item,x,i,'middle',id);
      }
      y = dy;
      if (w > width) { width = w; }
    }
    if (sub.second) {
      y += 1;
      this.#draw(id,sub.item,x,y,'second',id);
      this.#draw(id,sub.item,x,y,'second_icon',id);
      let [dy, w] = this.#iter(sub.second,x+1,y,id);
      for (let i = y; i < dy; i++) {
        this.#draw(id,sub.item,x,i,'middle',id);
      }
      y = dy;
      if (w > width) { width = w; }
    }
    y += 1;
    this.#draw(id,sub.item,x,y,'end',id);
    return [y,width];
  } //}}}

  #remove_item_rec(it,eid){
    for (const [k,v] of Object.entries(it)) {
      if (k == eid) { delete it[eid]; }
      if (typeof(v) == 'object') {
        this.#remove_item_rec(v.first,eid);
        if (v.second) {
          this.#remove_item_rec(v.second,eid);
        }
      }
    }
  }
  remove_item(eid) {
    this.#remove_item_rec(this.program,eid);
  }

  clear() {
    this.target.empty();
  }

  render() {
    let [y,w] = this.#iter(this.program,1,0);
    let hei = y * this.#tile_height * this.#scale_factor + this.#height_shift;
    let wid = w * this.#tile_width * this.#scale_factor;
    this.target.attr('height',   hei);
    this.target.attr('width',    wid);
  }
}
