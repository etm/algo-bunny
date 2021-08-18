class Field {
  #tile_width;
  #tile_height;
  #scale_factor;
  #height_shift;

  #width_add;
  #height_add;

  constructor(target,assets,level) { //{{{
    this.assets = assets;
    this.target = target;
    this.level = level;

    let t1 = $X('<g element-group="graph" xmlns="http://www.w3.org/2000/svg"></g>');
    let t2 = $X('<g element-group="drop"  xmlns="http://www.w3.org/2000/svg"></g>');
    target.append(t1);
    target.append(t2);

    this.target_graph = t1;
    this.target_drop = t2;

    this.#tile_width = 26.4;
    this.#tile_height = 27;
    this.#scale_factor = 2.21;
    this.#height_shift = 10;

    this.#width_add = this.#tile_width + 12;
    this.#height_add = this.#tile_height + 8;

    this.program = [];
  }  //}}}

  render() {
    // this.clear();
    // this.#draw_asset('','bunny',1,1,'start');
    // this.#draw_asset('','add',1,1,'insert_first',this.#tile_height/2);
    // let [y,w] = this.#iter(this.program,1,1);
    // let hei = y * this.#tile_height * this.#scale_factor + this.#height_add;
    // let wid = w * this.#tile_width * this.#scale_factor + this.#width_add;
    // this.target.attr('height', hei);
    // this.target.attr('width',  wid);
  }
}
