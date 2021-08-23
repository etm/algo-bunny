class Field {
  #tile_width;
  #tile_height;
  #scale_factor;
  #perspective_correction;
  #height_shift;
  #carrot_y_displacement;
  #flower_y_displacement;
  #bunny_y_displacement;

  #get_level(levelurl) { //{{{
    return new Promise( resolve => {
      $.ajax({
        type: "GET",
        url: levelurl,
        error: () => {}
      }).then(res => { resolve(res); })
    });
  } //}}}

  #coordinate_transform(x,y) { //{{{
    // for anybody interested: https://en.wikipedia.org/wiki/Rotation_matrix
    let rot = Math.PI/4; // 45 degrees
    let nx = x * Math.cos(rot) - y * Math.sin(rot);
    let ny = x * Math.sin(rot) + y * Math.cos(rot);
    return [nx,ny];
  } //}}}

  #tile_rel_pos(x,y) { //{{{
    let [nx,ny] = this.#coordinate_transform(x,y);
    let pos_x = nx * (this.#tile_width + this.#tile_width/2);
    let pos_y = ny * (this.#tile_height - this.#tile_height/2);
    return [pos_x,pos_y];
  } //}}}
  #tile_pos(x,y) { //{{{
    let [nx,ny] = this.#coordinate_transform(x,y);
    let pos_x = nx * (this.#tile_width + this.#tile_width/2) + (this.y * this.#tile_width) - (this.#tile_width / 2) - (this.y * this.#perspective_correction);
    let pos_y = ny * (this.#tile_height - this.#tile_height/2) + this.#height_shift;
    return [pos_x,pos_y];
  } //}}}
  #tile_base(x,y,klas) { //{{{
    let [pos_x,pos_y] = this.#tile_pos(x,y)
    return $X('<g transform="scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + pos_x + ',' + pos_y + ')" class="' + klas + '" element-x="' + x + '" element-y="' + y  + '" xmlns="http://www.w3.org/2000/svg"></g>');
  } //}}}

  #draw_tile(x,y) { //{{{
    let grax = this.assets.tiles.normal.graphics.sample().clone();
    let g1 = this.#tile_base(x,y,'tile');
    g1.append(grax);
    this.target.append(g1);
  } //}}}
  #draw_carrot(x,y,size) { //{{{
    let grax = this.assets.tiles.carrot.graphics.sample().clone();
    let tar = $('g.tile[element-x='+x+'][element-y='+y+']',this.target);
    let g1 = $X('<g transform="scale(1,1) translate(0,' + this.#carrot_y_displacement + ')" class="carrot" xmlns="http://www.w3.org/2000/svg"></g>');
        g1.append(grax)
    tar.append(g1);
  } //}}}
  #draw_flower(x,y,type) { //{{{
    let grax;
    if (type == 'position') {
      grax = this.assets.tiles.flower_blue.graphics.sample().clone();
    } else if (type == 'number') {
      grax = this.assets.tiles.flower_red.graphics.sample().clone();
    }
    let tar = $('g.tile[element-x='+x+'][element-y='+y+']',this.target);
    let g1 = $X('<g transform="scale(1,1) translate(0,' + this.#flower_y_displacement + ')" class="flower" xmlns="http://www.w3.org/2000/svg"></g>');
        g1.append(grax)
    tar.append(g1);
  } //}}}
  #draw_bunny(x,y,face) { //{{{
    let grax;
    if (face == 'N') {
      grax = this.assets.tiles.bunny_n.graphics.sample().clone();
    } else if (face == 'S') {
      grax = this.assets.tiles.bunny_s.graphics.sample().clone();
    } else if (face == 'W') {
      grax = this.assets.tiles.bunny_w.graphics.sample().clone();
    } else if (face == 'E') {
      grax = this.assets.tiles.bunny_e.graphics.sample().clone();
    }
    $(grax).attr('id','elbunnerino')
    let tar = $('g.tile[element-x='+x+'][element-y='+y+']',this.target);
    let g1 = this.#tile_base(x,y,'bunny');
    let g2 = $X('<g transform="scale(1,1) translate(0,' + this.#bunny_y_displacement + ')" xmlns="http://www.w3.org/2000/svg"></g>');
        g2.append(grax)
        g1.append(g2);
    g1.insertAfter(tar);
  } // }}}
  #bunny_hop(tx,ty,face) {
    let fx = 0;
    let fy = 0;
    let tar = $('g.bunny',this.target);
    let tar_x = tar.attr('element-x');
    let tar_y = tar.attr('element-y');
    let [pos_x,pos_y] = this.#tile_rel_pos(tx-tar_x,ty-tar_y);

    let g1;

    // calc quadratic bezier point
    let cx;
    let cy;

    // jump higher when only 1 field distance
    if (
         (Math.abs(tx-tar_x) == 1 && Math.abs(ty-tar_y) == 0) ||
         (Math.abs(tx-tar_x) == 0 && Math.abs(ty-tar_y) == 1)
       ) {
      cx = (tx-tar_x) / 0.5;
      cy = (ty-tar_y) / 0.5;
    } else {
      cx = (tx-tar_x) / 1.5;
      cy = (ty-tar_y) / 1.5;
    }

    // select direction of orthogonal vector depending on diagonal plane of matrix

    // this is very naive. length of ortho-vector should be adjusted based angle between source target and diagonal plane
    // but hey, we are not building a photo-realistic shooter
    if (cx < cy) {
      let vx, vy;
      // select vector shift direction based one movement direction
      if (tar_x > tx || tar_y > ty) {
        vx = -cy + cx
        vy = cx + cy
      } else {
        vx = -cy - cx
        vy = cx - cy
      }
      let [pos_vx,pos_vy] = this.#tile_rel_pos(vx,vy)
      g1 = $X('<path id="motionpath" d="M ' + fx + ' ' + fy + ' Q ' + pos_vx + ' ' + pos_vy + ' ' + pos_x + ' ' + pos_y + '" stroke="red" fill="none" class="arc" xmlns="http://www.w3.org/2000/svg"></path>');
    } else if (cx > cy) {
      let vx, vy;
      // select vector shift direction based one movement direction
      if (tar_x > tx || tar_y > ty) {
        vx = cy + cx
        vy = -cx + cy
      } else {
        vx = cy - cx
        vy = -cx - cy
      }
      let [pos_vx,pos_vy] = this.#tile_rel_pos(vx,vy)
      g1 = $X('<path id="motionpath" d="M ' + fx + ' ' + fy + ' Q ' + pos_vx + ' ' + pos_vy + ' ' + pos_x + ' ' + pos_y + '" stroke="red" fill="none" class="arc" xmlns="http://www.w3.org/2000/svg"></path>');
    } else {
      // if on diagonal plane of matrix its just a line :-)
      g1 = $X('<path id="motionpath" d="M ' + fx + ' ' + fy + ' L ' + pos_x + ' ' + pos_y + '" stroke="red" class="arc" xmlns="http://www.w3.org/2000/svg"></path>');
    }

    // keySplines is the secret sauce, define motion pattern
    let g2 = $X('<animateMotion id="bunnyani" x:href="#elbunnerino" begin="indefinite" dur="0.5s" calcMode="spline" keyTimes="0;1" values="1;0" keySplines="0 0.5 1 0.5" repeatCount="1" fill="freeze" xmlns="http://www.w3.org/2000/svg" xmlns:x="http://www.w3.org/1999/xlink"><mpath x:href="#motionpath"/></animateMotion>');
    tar.append(g1);
    tar.append(g2);

    // move higher
    this.target.append(tar)
    // start
    $('#bunnyani')[0].beginElement()
    setTimeout(()=>{
      this.#remove_bunny()
      let nface = (face === undefined) ? this.state_bunny[2] : face;
      this.#draw_bunny(tx,ty,nface)
      this.state_bunny = [tx,ty,nface]
    },500);
  }


  #remove_bunny() { //{{{
    this.target.find('g.bunny').remove();
  } //}}}

  constructor(target,assets,levelurl) { //{{{
    this.assets = assets;
    this.target = target;
    this.levelurl = levelurl;

    this.#tile_width = 57;
    this.#tile_height = 83.5;
    this.#carrot_y_displacement = -25;
    this.#flower_y_displacement = -18;
    this.#bunny_y_displacement = -37;
    this.#scale_factor = 0.9;
    this.#perspective_correction = 0;
    this.#height_shift = 40;
   } //}}}

  async load_level() { //{{{
    let level = await this.#get_level(this.levelurl);
    let pieces = level.split(/---\s*\r?\n/);
    if (pieces.length != 6) {
      bunny_say('Uh, oh. Level is no good.');
      return false;
    }
    [
      this.tiles,
      this.assignments,
      this.help,
      this.carrots,
      this.max_score,
      this.elements] = pieces;
    this.x = 0;
    this.y = 0;


    this.elements = this.elements.split(',');
    this.state_flowers = [];
    this.state_carrots = [];
    this.tiles = this.tiles.split(/\r?\n/);
    this.tiles = this.tiles.map( x => {
      this.state_flowers.push([]);
      this.state_carrots.push([]);
      let s = x.split('');
      if (this.x < s.length) { this.x = s.length; }
      return s;
    });
    this.y = this.tiles.length;

    this.assignments = this.assignments.split(/\r?\n/);
    this.assignments = this.assignments.map( x => {
      let s = x.trim().split(',');
      if (s.length == 1) { return { 'type': 'number', 'value': parseInt(s[0]) } };
      if (s.length == 3) { return { 'type': 'position', 'x': parseInt(s[0]), 'y': parseInt(s[1]), 'face': s[2] } };
    });
    this.carrots = this.carrots.split('').map(x => x.trim()).filter(x => x !== undefined);
    this.max_score = parseInt(this.max_score);
    this.max_carrots = this.tiles.reduce((total,arr) => {
      return total + arr.reduce((total,ele) => {
        return total + (ele.match(/[1-9c]/) ? 1 : 0);
      },0);
    },0);
    return true;
  }  //}}}

  bunny_jump(x,y,face) {
    let [ox,oy,oface] = this.state_bunny;
    if (ox == x && oy == y && oface != face && !(face === undefined)) {
      this.#remove_bunny()
      this.#draw_bunny(x,y,face)
      this.state_bunny = [x,y,face];
    }
    if (ox != x || oy != y) {
      this.#bunny_hop(x,y,face);
    }
  }

  render() { //{{{
    let counter = 0;
    let flower_count = 0;
    let generated_carrots = [];
    for (let i=1; i<=this.max_carrots; i++) { generated_carrots[i-1] = i }
    for (let i=0;i<Math.max(this.x,this.y)*2;i++) {
      for (let j = counter; j >= 0; j--) {
        if (j < this.x && (i-j) < this.y) {
          if (this.tiles[i-j][j]) {
            if (this.tiles[i-j][j] != ' ') {
              this.#draw_tile(j,i-j);
            }
            if (this.tiles[i-j][j].match(/[1-9c]/)) {
              if (this.tiles[i-j][j] == 'c') {
                this.state_carrots[i-j][i] = generated_carrots.sample();
                generated_carrots =  generated_carrots.remove(this.state_carrots[i-j][i]);
              } else {
                this.state_carrots[i-j][i] = parseInt(this.tiles[i-j][j]);
              }
              this.#draw_carrot(j,i-j);
            }
            if (this.tiles[i-j][j] == 'f') {
              this.state_flowers[i-j][i] = this.assignments[flower_count++];
              this.#draw_flower(j,i-j,this.state_flowers[i-j][j].type);
            }
            if (this.tiles[i-j][j] == 'B') {
              this.state_bunny = [j,i-j,'E'];
              this.#draw_bunny(j,i-j,this.state_bunny[2]);
            }
          }
        }
      }
      counter += 1;
    }
    let [wid,_th] = this.#coordinate_transform(this.x,0);
    let [_tw,hei] = this.#coordinate_transform(this.x,this.y);

    let iw = (wid * (this.#tile_width  + this.#tile_width/2)  + (this.y * this.#tile_width) + this.#tile_width/2  - this.y * this.#perspective_correction + 2) * this.#scale_factor;
    let ih = (hei * (this.#tile_height - this.#tile_height/2)                               + this.#tile_height/2 - this.y * this.#perspective_correction + 2) * this.#scale_factor + this.#height_shift;

    this.target.attr('height', 'auto');
    this.target.attr('viewBox', '0 0 ' + iw + ' ' + ih);
  } //}}}
}
