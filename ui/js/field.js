class Field {
  #tile_width;
  #tile_height;
  #scale_factor;
  #height_shift;

  #width_add;
  #height_add;

  #get_level(levelurl) { //{{{
    return new Promise( resolve => {
      $.ajax({
        type: "GET",
        url: levelurl,
        error: () => {}
      }).then(res => { resolve(res); })
    });
  } //}}}

  #coordinate_transform(x,y,height) { //{{{
    // for anybody interested: https://en.wikipedia.org/wiki/Rotation_matrix
    let rot = Math.PI/4; // 45 degrees
    let nx = x * Math.cos(rot) - y * Math.sin(rot);
    let ny = x * Math.sin(rot) + y * Math.cos(rot);
    return [height+nx,ny];
  } //}}}

  #get_random(list) {
    return list[Math.floor((Math.random()*list.length))];
  }

  #draw_tile(x,y) { //{{{
    let grax = this.#get_random(this.assets.tiles.normal.graphics).clone();
    let [nx,ny] = this.#coordinate_transform(x,y,this.y);
    let g1 = $X('<g transform="scale(' + this.#scale_factor + ',' + this.#scale_factor + ') translate(' + (nx * (this.#tile_width + this.#tile_width/2)) + ',' + (ny * (this.#tile_height - this.#tile_height/2)) + ')" class="tile" element-x="' + x + '" element-y="' + y  + '" xmlns="http://www.w3.org/2000/svg"></g>');
        g1.append(grax);
    this.target.append(g1);
  } //}}}

  constructor(target,assets,levelurl) { //{{{
    this.assets = assets;
    this.target = target;
    this.levelurl = levelurl;


    this.#tile_width = 57;
    this.#tile_height = 83.5;
    this.#scale_factor = 0.9;
    this.#height_shift = 10;

    this.#width_add = this.#tile_width + 12;
    this.#height_add = this.#tile_height + 8;
   }  //}}}

  async load_level() {
    let level = await this.#get_level(this.levelurl);
    let pieces = level.split(/---\s*\r?\n/).map( x => x.trim() );
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
    this.tiles = this.tiles.split(/\r?\n/);
    this.tiles = this.tiles.map( x => {
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
    return true;
  }
  render() {
    let counter = 0;
    for (let i=0;i<Math.max(this.x,this.y);i++) {
      for (let j = counter; j > 0; j--) {
        this.#draw_tile(j,i-j);
      }
      counter += 1;
    }
    let [wid,hei] = this.#coordinate_transform(this.x,this.y,this.y);
    this.target.attr('height', hei * (this.#tile_height - this.#tile_height/2) * this.#scale_factor);
    this.target.attr('width', 2 * wid * (this.#tile_width + this.#tile_width/2) * this.#scale_factor);
  }
}
