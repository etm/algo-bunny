class Field {
  #tile_width
  #tile_height
  #scale_factor
  #perspective_correction
  #height_shift
  #carrot_y_displacement
  #carrot_scale_x_compensation
  #carrot_scale_y_compensation
  #flower_y_displacement
  #op_y_displacement
  #dir_y_displacement
  #nocount_y_displacement
  #bunny_y_displacement

  #save_state_bunny
  #save_state_op
  #save_state_dir
  #save_state_nocount
  #save_state_carrots
  #save_state_flowers
  #save_state_assignments

  #nodraw

  constructor(target,assets) { //{{{
    this.assets = assets

    this.target = target
    this.target_svg = target.find('svg')

    let t1 = $X('<g element-group="field" xmlns="http://www.w3.org/2000/svg"></g>')
    let t2 = $X('<g element-group="drag"  xmlns="http://www.w3.org/2000/svg"></g>')
    this.target_svg.append(t1)
    this.target_svg.append(t2)

    this.target_field = t1
    this.target_drag = t2

    this.#tile_width = 57
    this.#tile_height = 83.5
    this.#carrot_y_displacement = -25
    this.#carrot_scale_x_compensation = 60
    this.#carrot_scale_y_compensation = 28
    this.#flower_y_displacement = -18
    this.#op_y_displacement = 0
    this.#dir_y_displacement = 0
    this.#nocount_y_displacement = 0
    this.#bunny_y_displacement = -37
    this.#scale_factor = 0.9
    this.#perspective_correction = 0
    this.#height_shift = 40

    this.success = 1

    this.timing = 500

    this.#nodraw = false

    this.#save_state_carrots = []
    this.#save_state_flowers = []
    this.#save_state_assignments = []
  } //}}}

  #coordinate_transform(x,y) { //{{{
    // for anybody interested: https://en.wikipedia.org/wiki/Rotation_matrix
    let rot = Math.PI/4 // 45 degrees
    let nx = x * Math.cos(rot) - y * Math.sin(rot)
    let ny = x * Math.sin(rot) + y * Math.cos(rot)
    return [nx,ny]
  } //}}}

  #tile_rel_pos(x,y) { //{{{
    let [nx,ny] = this.#coordinate_transform(x,y)
    let pos_x = nx * (this.#tile_width + this.#tile_width/2)
    let pos_y = ny * (this.#tile_height - this.#tile_height/2)
    return [pos_x,pos_y]
  } //}}}
  #tile_pos(x,y) { //{{{
    let [nx,ny] = this.#coordinate_transform(x,y)
    let pos_x = nx * (this.#tile_width + this.#tile_width/2) + (this.y * this.#tile_width) - (this.#tile_width / 2) - (this.y * this.#perspective_correction)
    let pos_y = ny * (this.#tile_height - this.#tile_height/2) + this.#height_shift
    return [pos_x,pos_y]
  } //}}}
  #tile_base(x,y,klas) { //{{{
    let [pos_x,pos_y] = this.#tile_pos(x,y)
    return $X('<g transform="scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + pos_x + ',' + pos_y + ')" class="' + klas + '" element-x="' + x + '" element-y="' + y  + '" xmlns="http://www.w3.org/2000/svg"></g>')
  } //}}}

  #facing_tile () { //{{{
    let [ox,oy,oface] = this.state_bunny
    if      (oface == 'N') { oy -= 1 }
    else if (oface == 'E') { ox += 1 }
    else if (oface == 'S') { oy += 1 }
    else if (oface == 'W') { ox -= 1 }
    return [ox,oy,oface]
  } //}}}

  #draw_drag_layer(width,height) { //{{{
    let g1 = $X('<foreignObject x="0" y="0" width="' + width + '" height="' + height + '" xmlns="http://www.w3.org/2000/svg" requiredExtensions="http://www.w3.org/1999/xhtml"><div xmlns="http://www.w3.org/1999/xhtml" draggable="true" style="width: 100%; height:100%"></div></foreignObject>')
    this.target_drag.append(g1)
  } //}}}

  #draw_tile(x,y) { //{{{
    let grax = this.assets.tiles.normal.graphics.sample().clone()
        grax.addClass('tilebase')
    let g1 = this.#tile_base(x,y,'tile')
    g1.append(grax)
    this.target_field.append(g1)
  } //}}}

  #draw_carrot(x,y,size) { //{{{
    let grax = this.assets.tiles.carrot.graphics.sample().clone()
    let tar = $('g.tile[element-x='+x+'][element-y='+y+']',this.target_field)

    if (size === undefined) { size = 1 }
    if (size > this.max_carrots) { size = this.max_carrots }
    let scale = (size * (0.6 / this.max_carrots)) + 0.4

    let g1 = $X('<g transform="scale('+scale+','+scale+') translate(' + ((1/scale) * this.#carrot_scale_x_compensation - this.#carrot_scale_x_compensation) + ',' + (((1/scale) * this.#carrot_scale_y_compensation - this.#carrot_scale_y_compensation) + this.#carrot_y_displacement) + ')" class="carrot" xmlns="http://www.w3.org/2000/svg"></g>')
        g1.append(grax)
    tar.append(g1)
  } //}}}
  #draw_flower(x,y,type) { //{{{
    let grax
    if (type == 'position') {
      grax = this.assets.tiles.flower_blue.graphics.sample().clone()
    } else if (type == 'number') {
      grax = this.assets.tiles.flower_red.graphics.sample().clone()
    } else if (type == 'math') {
      grax = this.assets.tiles.flower_math.graphics.sample().clone()
    }
    let tar = $('g.tile[element-x='+x+'][element-y='+y+']',this.target_field)
    let g1 = $X('<g transform="scale(1,1) translate(0,' + this.#flower_y_displacement + ')" class="flower" xmlns="http://www.w3.org/2000/svg"></g>')
        g1.append(grax)
    tar.append(g1)
  } //}}}
  #draw_nocount(x,y) { //{{{
    let grax = this.assets.tiles.grass.graphics.sample().clone()
    let tar = $('g.tile[element-x='+x+'][element-y='+y+']',this.target_field)
    let g1 = $X('<g transform="scale(1,1) translate(0,' + this.#nocount_y_displacement + ')" class="grass" xmlns="http://www.w3.org/2000/svg"></g>')
        g1.append(grax)
    tar.append(g1)
  } //}}}
  #draw_dir(x,y,type) { //{{{
    let grax
    if (type == 'E') {
      grax = this.assets.tiles.east.graphics.sample().clone()
    } else if (type == 'W') {
      grax = this.assets.tiles.west.graphics.sample().clone()
    } else if (type == 'N') {
      grax = this.assets.tiles.north.graphics.sample().clone()
    } else if (type == 'S') {
      grax = this.assets.tiles.south.graphics.sample().clone()
    }
    let tar = $('g.tile[element-x='+x+'][element-y='+y+']',this.target_field)
    let g1 = $X('<g transform="scale(1,1) translate(0,' + this.#dir_y_displacement + ')" class="direction_' + type + '" xmlns="http://www.w3.org/2000/svg"></g>')
        g1.append(grax)
    tar.append(g1)
  } //}}}
  #draw_op(x,y,type) { //{{{
    let grax
    if (type == 'plus') {
      grax = this.assets.tiles.plus.graphics.sample().clone()
    } else if (type == 'minus') {
      grax = this.assets.tiles.minus.graphics.sample().clone()
    } else if (type == 'times') {
      grax = this.assets.tiles.times.graphics.sample().clone()
    } else if (type == 'div') {
      grax = this.assets.tiles.div.graphics.sample().clone()
    }
    let tar = $('g.tile[element-x='+x+'][element-y='+y+']',this.target_field)
    let g1 = $X('<g transform="scale(1,1) translate(0,' + this.#op_y_displacement + ')" class="' + type + '" xmlns="http://www.w3.org/2000/svg"></g>')
        g1.append(grax)
    tar.append(g1)
  } //}}}
  #draw_bunny(x,y,face) { //{{{
    let grax
    if (face == 'N') {
      grax = this.assets.tiles.bunny_n.graphics.sample().clone()
    } else if (face == 'S') {
      grax = this.assets.tiles.bunny_s.graphics.sample().clone()
    } else if (face == 'W') {
      grax = this.assets.tiles.bunny_w.graphics.sample().clone()
    } else if (face == 'E') {
      grax = this.assets.tiles.bunny_e.graphics.sample().clone()
    }
    $(grax).attr('id','elbunnerino')
    let tar = $('g.tile[element-x='+x+'][element-y='+y+']',this.target_field)
    let g1 = this.#tile_base(x,y,'bunny')
    let g2 = $X('<g transform="scale(1,1) translate(0,' + this.#bunny_y_displacement + ')" xmlns="http://www.w3.org/2000/svg"></g>')
        g2.append(grax)
        g1.append(g2)
    g1.insertAfter(tar)
  } // }}}
  #remove_bunny() { //{{{
    this.target_field.find('g.bunny').remove()
  } //}}}

  #bunny_hop(tx,ty,face) { //{{{
    let fx = 0
    let fy = 0
    let tar = $('g.bunny',this.target_field)
    let tar_x = tar.attr('element-x')
    let tar_y = tar.attr('element-y')
    let [pos_x,pos_y] = this.#tile_rel_pos(tx-tar_x,ty-tar_y)

    let g1

    // calc quadratic bezier point
    let cx
    let cy

    // jump higher when only 1 field distance
    if (
         (Math.abs(tx-tar_x) == 1 && Math.abs(ty-tar_y) == 0) ||
         (Math.abs(tx-tar_x) == 0 && Math.abs(ty-tar_y) == 1)
       ) {
      cx = (tx-tar_x) / 0.5
      cy = (ty-tar_y) / 0.5
    } else {
      cx = (tx-tar_x) / 1.5
      cy = (ty-tar_y) / 1.5
    }

    // select direction of orthogonal vector depending on diagonal plane of matrix

    // this is very naive. length of ortho-vector should be adjusted based
    // angle between source target and diagonal plane but hey, we are not
    // building a photo-realistic shooter
    if (cx < cy) {
      let vx, vy
      // select vector shift direction based one movement direction
      if (tar_x > tx || tar_y > ty) {
        vx = -cy + cx
        vy = cx + cy
      } else {
        vx = -cy - cx
        vy = cx - cy
      }
      let [pos_vx,pos_vy] = this.#tile_rel_pos(vx,vy)
      g1 = $X('<path id="motionpath" d="M ' + fx + ' ' + fy + ' Q ' + pos_vx + ' ' + pos_vy + ' ' + pos_x + ' ' + pos_y + '" stroke="none" fill="none" class="arc" xmlns="http://www.w3.org/2000/svg"></path>')
    } else if (cx > cy) {
      let vx, vy
      // select vector shift direction based one movement direction
      if (tar_x > tx || tar_y > ty) {
        vx = cy + cx
        vy = -cx + cy
      } else {
        vx = cy - cx
        vy = -cx - cy
      }
      let [pos_vx,pos_vy] = this.#tile_rel_pos(vx,vy)
      g1 = $X('<path id="motionpath" d="M ' + fx + ' ' + fy + ' Q ' + pos_vx + ' ' + pos_vy + ' ' + pos_x + ' ' + pos_y + '" stroke="none" fill="none" class="arc" xmlns="http://www.w3.org/2000/svg"></path>')
    } else {
      // if on diagonal plane of matrix its just a line :-)
      g1 = $X('<path id="motionpath" d="M ' + fx + ' ' + fy + ' L ' + pos_x + ' ' + pos_y + '" stroke="none" class="arc" xmlns="http://www.w3.org/2000/svg"></path>')
    }

    // keySplines is the secret sauce, define motion pattern
    let g2 = $X('<animateMotion id="bunnyani" x:href="#elbunnerino" begin="indefinite" dur="0.5s" calcMode="spline" keyTimes="0;1" values="1;0" keySplines="0 0.5 1 0.5" repeatCount="1" fill="freeze" xmlns="http://www.w3.org/2000/svg" xmlns:x="http://www.w3.org/1999/xlink"><mpath x:href="#motionpath"/></animateMotion>')
    tar.append(g1)
    tar.append(g2)

    // move higher
    this.target_field.append(tar)
    // start
    this.assets.play_audio(this.assets.audio.boing.sounds.sample())
    $('#bunnyani')[0].beginElement()
  } //}}}

  #init_carrots_and_flowers() { //{{{
    let counter
    let flower_count
    let carrot_count
    let generated_carrots

    let repeat
    do {
      repeat = false
      for (let i=0; i< this.raw_assignments.length; i++) {
        let s = this.raw_assignments[i].trim().split(',')
        if      (s.length == 1 && s[0].match(/^r/)) {
          this.assignments[i] = { 'type': 'number', 'value': Math.floor(Math.random() * parseInt(s[0].substring(1)) + 1) }
          if (this.#save_state_assignments[i] && this.assignments[i].value == this.#save_state_assignments[i].value) { repeat = true }
        } else if (s.length == 1 && s[0].match(/^f/)) {
          this.assignments[i] = { 'type': 'number', 'value': this.assignments[s[0].substring(1)].value }
        } else if (s.length == 1 && s[0].match(/^[1-9]/)) {
          this.assignments[i] = { 'type': 'number', 'value': parseInt(s[0]) }
        } else if (s.length == 3) {
          this.assignments[i] = { 'type': 'position', 'x': parseInt(s[0]), 'y': parseInt(s[1]), 'face': s[2] }
        }
      }
    } while (repeat)

    this.carrots = ''
    if (this.raw_carrots.match(/^t/)) {
      let c = this.raw_carrots.substring(1).split(',')
      for (let i=0; i < this.assignments[parseInt(c[0])].value; i++) {
        this.carrots += c[1].trim()
      }
    } else if (this.raw_carrots.match(/^s/)) {
      this.carrots = this.assignments[parseInt(this.raw_carrots.substring(1))].value.toString()
    } else {
      this.carrots = this.raw_carrots.trim()
    }
    this.carrots = this.carrots.split('').map(x => x.trim()).filter(x => x !== undefined && x != '')

    do {
      counter = 0
      flower_count = 0
      carrot_count = 0
      repeat = false
      generated_carrots = []

      repeat = false
      for (let i=1; i<=this.max_carrots; i++) { generated_carrots[i-1] = i }
      for (let i=0;i<Math.max(this.x,this.y)*2;i++) {
        for (let j = counter; j >= 0; j--) {
          if (j < this.x && (i-j) < this.y) {
            if (this.raw_tiles[i-j][j]) {
              if (this.raw_tiles[i-j][j].match(/[1-9c]/)) {
                if (this.raw_tiles[i-j][j] == 'c') {
                  carrot_count += 1
                  this.state_carrots[i-j][j] = generated_carrots.sample()
                  generated_carrots =  generated_carrots.remove(this.state_carrots[i-j][j])
                  if (this.#save_state_carrots[i-j] && this.state_carrots[i-j][j] == this.#save_state_carrots[i-j][j]) {
                    repeat = true
                  }
                } else {
                  this.state_carrots[i-j][j] = parseInt(this.raw_tiles[i-j][j])
                }
              }
              if (this.raw_tiles[i-j][j] == 'f') {
                this.state_flowers[i-j][j] = this.assignments[flower_count++]
              }
            }
          }
        }
        counter += 1
      }
    } while (repeat && carrot_count > 1)

    this.#save_state_carrots = JSON.parse(JSON.stringify(this.state_carrots))
    this.#save_state_flowers = JSON.parse(JSON.stringify(this.state_flowers))
    this.#save_state_assignments = JSON.parse(JSON.stringify(this.assignments))
  } //}}}

  has_carrot()    { //{{{
    let [ox,oy,oface] = this.#facing_tile()
    return (this.state_carrots[oy] && this.state_carrots[oy][ox]) ? true : false
  }  //}}}
  has_flower()    {  //{{{
    let [ox,oy,oface] = this.#facing_tile()
    return (this.state_flowers[oy] && this.state_flowers[oy][ox]) ? true : false
  } //}}}
  is_hole()    {  //{{{
    let [ox,oy,oface] = this.#facing_tile()
    return (this.tiles[oy] && this.tiles[oy][ox] && this.tiles[oy][ox].match(/[T+\-*\/]/)) ? false : true
  } //}}}
  is_empty()    {  //{{{
    let [ox,oy,oface] = this.#facing_tile()
    return (this.tiles[oy] && this.tiles[oy][ox] && this.tiles[oy][ox].match(/[T+\-*\/]/) && (this.state_carrots[oy][ox] === undefined || this.state_carrots[oy][ox] == null) && (this.state_flowers[oy][ox] === undefined || this.state_flowers[oy][ox] == null)) ? true : false
  } //}}}
  check_carrot()   { //{{{
    let [ox,oy,oface] = this.#facing_tile()
    if (this.state_carrots[oy][ox]) {
      return this.state_carrots[oy][ox]
    } else {
      return false
    }
  } //}}}
  check_flower()   { //{{{
    let [ox,oy,oface] = this.#facing_tile()
    if (this.state_flowers[oy] && this.state_flowers[oy][ox]) {
      return this.state_flowers[oy][ox]
    } else {
      return false
    }
  } //}}}
  check_nocount()   { //{{{
    let [ox,oy,oface] = this.state_bunny
    return (this.state_nocount[oy] && this.state_nocount[oy][ox])
  } //}}}
  check_dir(ox,oy)   { //{{{
    if (this.state_dir[oy] && this.state_dir[oy][ox]) {
      return this.state_dir[oy][ox]
    } else {
      return
    }
  } //}}}
  get_carrot()   { //{{{
    let [ox,oy,oface] = this.#facing_tile()
    if (this.state_carrots[oy] && this.state_carrots[oy][ox]) {
      let c = this.state_carrots[oy][ox]
      delete this.state_carrots[oy][ox]
      if (!this.#nodraw) {
        $('g.tile[element-x='+ox+'][element-y='+oy+'] g.carrot',this.target_field).remove()
        this.assets.play_audio(this.assets.audio.interact.sounds.sample())
      }
      return c
    } else {
      return false
    }
  } //}}}
  put_carrot(val) { //{{{
    let [ox,oy,oface] = this.#facing_tile()
    if (this.tiles[oy] && this.tiles[oy][ox] && this.tiles[oy][ox] == 'T' && (this.state_carrots[oy][ox] === undefined || this.state_carrots[oy][ox] == null) && (this.state_flowers[oy][ox] === undefined || this.state_flowers[oy][ox] == null)) {
      this.state_carrots[oy][ox] = val
      if (!this.#nodraw) {
        this.#draw_carrot(ox,oy,val)
        this.assets.play_audio(this.assets.audio.interact.sounds.sample())
      }
      return true
    } else {
      return false
    }
  } //}}}
  eat() { //{{{
    if (!this.#nodraw) {
      this.assets.play_audio(this.assets.audio.eat.sounds.sample())
    }
  } //}}}

  put_flower(val) { //{{{
    let v
    let s = val.toString().trim().split(',')
    if (s.length == 1) { v = { 'type': 'number', 'value': parseInt(s[0]) } }
    if (s.length == 3) { v = { 'type': 'position', 'x': parseInt(s[0]), 'y': parseInt(s[1]), 'face': s[2] } }

    let [ox,oy,oface] = this.#facing_tile()
    if (this.tiles[oy] && this.tiles[oy][ox] && this.tiles[oy][ox] == 'T' && (this.state_carrots[oy][ox] === undefined || this.state_carrots[oy][ox] == null) && (this.state_flowers[oy][ox] === undefined || this.state_flowers[oy][ox] == null)) {
      this.state_flowers[oy][ox] = v
      if (!this.#nodraw) {
        this.#draw_flower(ox,oy,v.type)
        this.assets.play_audio(this.assets.audio.interact.sounds.sample())
      }
      return true
    } else if (v.type =='number' && this.tiles[oy] && this.tiles[oy][ox] && this.tiles[oy][ox] == '+') {
      if (this.state_flowers[oy][ox] === undefined || this.state_flowers[oy][ox] == null) {
        this.state_flowers[oy][ox] = v
      } else {
        this.state_flowers[oy][ox].value += v.value
      }
      if (!this.#nodraw) {
        $('g.tile[element-x='+ox+'][element-y='+oy+'] g.flower',this.target_field).remove()
        this.#draw_flower(ox,oy,'math')
        this.assets.play_audio(this.assets.audio.interact.sounds.sample())
      }
    } else if (v.type =='number' && this.tiles[oy] && this.tiles[oy][ox] && this.tiles[oy][ox] == '-') {
      if (this.state_flowers[oy][ox] === undefined || this.state_flowers[oy][ox] == null) {
        this.state_flowers[oy][ox] = v
      } else {
        this.state_flowers[oy][ox].value -= v.value
      }
      if (!this.#nodraw) {
        $('g.tile[element-x='+ox+'][element-y='+oy+'] g.flower',this.target_field).remove()
        this.#draw_flower(ox,oy,'math')
        this.assets.play_audio(this.assets.audio.interact.sounds.sample())
      }
    } else if (v.type =='number' && this.tiles[oy] && this.tiles[oy][ox] && this.tiles[oy][ox] == '*') {
      if (this.state_flowers[oy][ox] === undefined || this.state_flowers[oy][ox] == null) {
        this.state_flowers[oy][ox] = v
      } else {
        this.state_flowers[oy][ox].value *= v.value
      }
      if (!this.#nodraw) {
        $('g.tile[element-x='+ox+'][element-y='+oy+'] g.flower',this.target_field).remove()
        this.#draw_flower(ox,oy,'math')
        this.assets.play_audio(this.assets.audio.interact.sounds.sample())
      }
    } else if (v.type =='number' && this.tiles[oy] && this.tiles[oy][ox] && this.tiles[oy][ox] == '/') {
      if (this.state_flowers[oy][ox] === undefined || this.state_flowers[oy][ox] == null) {
        this.state_flowers[oy][ox] = v
      } else {
        this.state_flowers[oy][ox].value = Math.floor(this.state_flowers[oy][ox].value / v.value)
      }
      if (!this.#nodraw) {
        $('g.tile[element-x='+ox+'][element-y='+oy+'] g.flower',this.target_field).remove()
        this.#draw_flower(ox,oy,'math')
        this.assets.play_audio(this.assets.audio.interact.sounds.sample())
      }
    } else {
      return false
    }
  } //}}}
  eat_flower()    {  //{{{
    this.eat()
    let [ox,oy,oface] = this.#facing_tile()
    if (this.state_flowers[oy] && this.state_flowers[oy][ox]) {
      let c = this.state_flowers[oy][ox]
      delete this.state_flowers[oy][ox]
      if (!this.#nodraw) {
        $('g.tile[element-x='+ox+'][element-y='+oy+'] g.flower',this.target_field).remove()
        this.assets.play_audio(this.assets.audio.eat.sounds.sample())
      }
      return true
    } else {
      return false
    }
  } //}}}

  async right()     { //{{{
    let [ox,oy,oface] = this.state_bunny
    if      (oface == 'W') { oface = 'N' }
    else if (oface == 'N') { oface = 'E' }
    else if (oface == 'E') { oface = 'S' }
    else if (oface == 'S') { oface = 'W' }
    return await this.jump(ox,oy,oface)
  } //}}}
  async left()     { //{{{
    let [ox,oy,oface] = this.state_bunny
    if      (oface == 'N') { oface = 'W' }
    else if (oface == 'E') { oface = 'N' }
    else if (oface == 'S') { oface = 'E' }
    else if (oface == 'W') { oface = 'S' }
    return await this.jump(ox,oy,oface)
  } //}}}
  async step_right()     { //{{{
    let [ox,oy,oface] = this.state_bunny
    if      (oface == 'W') { oy -= 1 }
    else if (oface == 'N') { ox += 1 }
    else if (oface == 'E') { oy += 1 }
    else if (oface == 'S') { ox -= 1 }
    return await this.jump(ox,oy,oface)
  } //}}}
  async step_left()     { //{{{
    let [ox,oy,oface] = this.state_bunny
    if      (oface == 'N') { ox -= 1 }
    else if (oface == 'E') { oy -= 1 }
    else if (oface == 'S') { ox += 1 }
    else if (oface == 'W') { oy += 1 }
    return await this.jump(ox,oy,oface)
  } //}}}
  async forward() { //{{{
    let [ox,oy,oface] = this.#facing_tile()
    return await this.jump(ox,oy,oface)
  } //}}}
  async back() { //{{{
    let [ox,oy,oface] = this.state_bunny
    if      (oface == 'N') { oy += 1 }
    else if (oface == 'E') { ox -= 1 }
    else if (oface == 'S') { oy -= 1 }
    else if (oface == 'W') { ox += 1 }
    return await this.jump(ox,oy,oface)
  } //}}}
  async jump_forward(dist) { //{{{
    let [ox,oy,oface] = this.state_bunny
    if      (oface == 'W') { ox -= parseInt(dist) }
    else if (oface == 'N') { oy -= parseInt(dist) }
    else if (oface == 'E') { ox += parseInt(dist) }
    else if (oface == 'S') { oy += parseInt(dist) }
    return await this.jump(ox,oy,oface)
  } //}}}

  jump_forward_possible(dist) { //{{{
    let [x,y,face] = this.state_bunny
    if      (face == 'W') { x -= parseInt(dist) }
    else if (face == 'N') { y -= parseInt(dist) }
    else if (face == 'E') { x += parseInt(dist) }
    else if (face == 'S') { x += parseInt(dist) }

    if (!(this.tiles[y] && this.tiles[y][x] && this.tiles[y][x] == 'T' && (this.state_carrots[y][x] === undefined || this.state_carrots[y][x] == null) && (this.state_flowers[y][x] === undefined || this.state_flowers[y][x] == null))) {
      return false
    } else {
      return true
    }
  } //}}}
  jump_possible(x,y,face) { //{{{
    x = parseInt(x)
    y = parseInt(y)

    if (!(this.tiles[y] && this.tiles[y][x] && this.tiles[y][x] == 'T' && (this.state_carrots[y][x] === undefined || this.state_carrots[y][x] == null) && (this.state_flowers[y][x] === undefined || this.state_flowers[y][x] == null))) {
      return false
    } else {
      return true
    }
  } //}}}

  async jump(x,y,face) { //{{{
    x = parseInt(x)
    y = parseInt(y)

    if (!(this.tiles[y] && this.tiles[y][x] && this.tiles[y][x] == 'T' && (this.state_carrots[y][x] === undefined || this.state_carrots[y][x] == null) && (this.state_flowers[y][x] === undefined || this.state_flowers[y][x] == null))) {
      return false
    }
    let [ox,oy,oface] = this.state_bunny
    if (ox == x && oy == y && oface != face && !(face === undefined)) {
      if (!this.#nodraw) {
        this.#remove_bunny()
        this.#draw_bunny(x,y,face)
      }
      this.state_bunny = [x,y,face]
    }
    if (ox != x || oy != y) {
      if (this.timing > 0) {
        this.#bunny_hop(x,y,face)
      }
      let nface = (face === undefined) ? oface : face
      this.state_bunny = [x,y,nface]
      if (!this.#nodraw) {
        if (this.timing > 0) {
          await new Promise(resolve => setTimeout(resolve, this.timing))
        }
        this.#remove_bunny()
        this.#draw_bunny(x,y,nface)
      }
    }
    return true
  } //}}}

  reset_state() { //{{{
    this.state_bunny   = JSON.parse(this.#save_state_bunny)
    this.state_op      = JSON.parse(this.#save_state_op)
    this.state_dir     = JSON.parse(this.#save_state_dir)
    this.state_nocount = JSON.parse(this.#save_state_nocount)
    this.state_carrots = JSON.parse(JSON.stringify(this.#save_state_carrots)) // load because carrots may be at different locations
    this.state_flowers = JSON.parse(JSON.stringify(this.#save_state_flowers)) // loead because flowers may be at different locations
    // no need to load saved assignments, because they dont change
    this.#init_carrots_and_flowers()
    $('g.flower,g.carrot,g.bunny',this.target_field).remove()
  } //}}}
  reset_full() { //{{{
    this.reset_state()
    for (const[y,line] of this.state_carrots.entries()) {
      for (const [x,v] of line.entries()) {
        if (v) { this.#draw_carrot(x,y,v) }
      }
    }
    for (const[y,line] of this.state_flowers.entries()) {
      for (const [x,v] of line.entries()) {
        if (v) { this.#draw_flower(x,y,v.type) }
      }
    }
    this.#draw_bunny(this.state_bunny[0],this.state_bunny[1],this.state_bunny[2])
  } //}}}
  render() { //{{{
    let counter = 0
    this.#init_carrots_and_flowers()
    for (let i=0;i<Math.max(this.x,this.y)*2;i++) {
      for (let j = counter; j >= 0; j--) {
        if (j < this.x && (i-j) < this.y) {
          if (this.tiles[i-j][j]) {
            if (this.tiles[i-j][j] != ' ') {
              this.#draw_tile(j,i-j)
            }
            if (this.tiles[i-j][j] == 'G') {
              this.#draw_nocount(j,i-j)
              this.state_nocount[i-j][j] = true
              this.tiles[i-j][j] = 'T'
            }
            if (this.tiles[i-j][j].match(/[NEWS]/)) {
              this.#draw_dir(j,i-j,this.tiles[i-j][j])
              this.state_dir[i-j][j] = this.tiles[i-j][j]
              this.state_nocount[i-j][j] = true
              this.tiles[i-j][j] = 'T'
            }
            if (this.tiles[i-j][j].match(/[1-9c]/)) {
              this.tiles[i-j][j] = 'T'
              this.#draw_carrot(j,i-j,this.state_carrots[i-j][j])
            }
            if (this.tiles[i-j][j] == 'f') {
              this.tiles[i-j][j] = 'T'
              this.#draw_flower(j,i-j,this.state_flowers[i-j][j].type)
            }
            if (this.tiles[i-j][j].match(/\+/)) {
              this.state_op[i-j][j] = this.tiles[i-j][j]
              this.#draw_op(j,i-j,'plus')
            }
            if (this.tiles[i-j][j].match(/-/)) {
              this.state_op[i-j][j] = this.tiles[i-j][j]
              this.#draw_op(j,i-j,'minus')
            }
            if (this.tiles[i-j][j].match(/\//)) {
              this.state_op[i-j][j] = this.tiles[i-j][j]
              this.#draw_op(j,i-j,'div')
            }
            if (this.tiles[i-j][j].match(/\*/)) {
              this.state_op[i-j][j] = this.tiles[i-j][j]
              this.#draw_op(j,i-j,'times')
            }
            if (this.tiles[i-j][j] == 'B') {
              this.state_bunny = [j,i-j,'E']
              this.tiles[i-j][j] = 'T'
              this.#draw_bunny(j,i-j,this.state_bunny[2])
            }
          }
        }
      }
      counter += 1
    }

    this.#save_state_bunny   = JSON.stringify(this.state_bunny)
    this.#save_state_op      = JSON.stringify(this.state_op)
    this.#save_state_dir     = JSON.stringify(this.state_dir)
    this.#save_state_nocount = JSON.stringify(this.state_nocount)

    let [wid,_th] = this.#coordinate_transform(this.x,0)
    let [_tw,hei] = this.#coordinate_transform(this.x,this.y)

    let iw = (wid * (this.#tile_width  + this.#tile_width/2)  + (this.y * this.#tile_width) + this.#tile_width/2  - this.y * this.#perspective_correction + 2) * this.#scale_factor
    let ih = (hei * (this.#tile_height - this.#tile_height/2)                               + this.#tile_height/2 - this.y * this.#perspective_correction + 2) * this.#scale_factor + this.#height_shift

    this.#draw_drag_layer(iw,ih)

    this.target_svg.attr('viewBox', '0 0 ' + iw + ' ' + ih)
  } // }}}
}
