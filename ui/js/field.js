
class Field {
  #tile_width;
  #tile_height;
  #scale_factor;
  #height_shift;

  #width_add;
  #height_add;

  #get_level(levelurl) {
    return new Promise( resolve => {
      $.ajax({
        type: "GET",
        url: levelurl,
        error: () => {}
      }).then(res => { resolve(res); })
    });
  }

  constructor(target,assets,levelurl) { //{{{
    this.assets = assets;
    this.target = target;
    this.levelurl = levelurl;


    this.#tile_width = 26.4;
    this.#tile_height = 27;
    this.#scale_factor = 2.21;
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
    this.tiles = this.tiles.split('\n');
    this.tiles = this.tiles.map( x => {
      let s = x.split('');
      if (this.x < s.length) { this.x = s.length; }
      return s;
    });
    this.y = this.tiles.length;

    return true;
  }

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
