class Loader {
  #assets
  #editor
  #field
  #elements

  constructor(assets, editor, field, elements, levelurl) { //{{{
    this.#assets = assets
    this.#editor = editor
    this.#field = field
    this.#elements = elements
    this.levelurl = levelurl
  } //}}}

  async load_level() { //{{{
    let level = await this.#get_level(this.levelurl)
    let pieces = level.split(/---\s*\r?\n/)
    if (pieces.length != 9) {
      this.#assets.say(this.#assets.texts.faultylevel,'div.speech')
      return false
    }
    [
      this.#field.raw_tiles,
      this.#field.raw_assignments,
      this.#field.title,
      this.#field.order,
      this.#field.mission,
      this.#field.raw_carrots,
      this.#field.times,
      this.#field.max_score,
      this.#elements.elements
    ] = pieces
    this.#field.x = 0
    this.#field.y = 0

    this.#elements.elements = this.#elements.elements.trim().split(',')
    this.#elements.elements_avail = []
    this.#elements.elements = this.#elements.elements.map((e)=>{
      let t = e.split('*')
      this.#elements.elements_avail.push(t.length > 1 ? parseInt(t[1]) : 0)
      return t.length > 1 ? t[0] : e
    })
    this.#field.state_flowers = []
    this.#field.state_carrots = []
    this.#field.state_op = []
    this.#field.state_dir = []
    this.#field.state_nocount = []
    this.#field.raw_tiles = this.#field.raw_tiles.trimRight().split(/\r?\n/)
    this.#field.success = parseInt(this.#field.times)
    this.#field.success = this.#field.success > 1 ? this.#field.success : 0

    this.#field.init_state()

    this.#field.raw_tiles = this.#field.raw_tiles.map( x => {
      this.#field.state_flowers.push([])
      this.#field.state_carrots.push([])
      this.#field.state_op.push([])
      this.#field.state_dir.push([])
      this.#field.state_nocount.push([])
      let s = x.split('')
      if (this.#field.x < s.length) { this.#field.x = s.length }
      return s
    })
    this.#field.carrots = ''
    this.#field.tiles = JSON.parse(JSON.stringify(this.#field.raw_tiles))
    this.#field.y = this.#field.raw_tiles.length

    this.#field.raw_assignments = this.#field.raw_assignments.split(/\r?\n/)
    this.#field.assignments = []
    this.#field.max_carrots = this.#field.raw_tiles.reduce((total,arr) => {
      return total + arr.reduce((total,ele) => {
        return total + (ele.match(/[1-9c]/) ? 1 : 0)
      },0)
    },0)
    return true
  }  //}}}

  #get_level(levelurl) { //{{{
    return new Promise( (resolve,reject) => {
      if (levelurl.match(/^http/)) {
        $.ajax({
          type: "GET",
          url: "download.php?url=" + levelurl,
          error: () => { this.#assets.say(this.#assets.texts.faultylevel,'div.speech'); reject() }
        }).then(res => { resolve(res) })
      } else {
        $.ajax({
          type: "GET",
          url: levelurl,
          error: () => { this.#assets.say(this.#assets.texts.faultylevel,'div.speech'); reject() }
        }).then(res => { resolve(res) })
      }
    })
  } //}}}
}
