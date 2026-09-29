class Loader {
  #assets
  #editor
  #field
  #elements

  constructor(assets, editor, field, elements, levelurl, solurl) { //{{{
    this.#assets = assets
    this.#editor = editor
    this.#field = field
    this.#elements = elements
    this.levelurl = levelurl
    this.solurl = solurl
  } //}}}

  async load_level() { //{{{
    let level = await this.#get_level(this.levelurl)
    let generator = null
    if (level.substring(0,2) == '#!') {
      let start = level.indexOf('\n') + 1
      let end = level.indexOf('\n---')
      generator = level.substring(start,end)
      level = eval(generator) + level.substring(end)
    }
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
    this.#field.tile_generator = generator

    this.#elements.elements = this.#elements.elements.trim().split(',')
    this.#elements.elements_avail = []
    this.#elements.elements = this.#elements.elements.map((e)=>{
      let t = e.split('*')
      this.#elements.elements_avail.push(t.length > 1 ? parseInt(t[1]) : 0)
      return t.length > 1 ? t[0] : e
    })
    this.#field.success = parseInt(this.#field.times)
    this.#field.success = this.#field.success > 1 ? this.#field.success : 0
    this.#field.carrots = ''
    this.#field.build_tiles(this.#field.raw_tiles)

    this.#field.raw_assignments = this.#field.raw_assignments.split(/\r?\n/)
    this.#field.assignments = []
    return true
  }  //}}}

  async load_solution() {
    let solution = await this.#get_solution(this.solurl)
    this.#editor.program = solution
  }

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

  #get_solution(solurl) { //{{{
    return new Promise( (resolve,reject) => {
      $.ajax({
        type: "GET",
        url: solurl,
        error: () => { this.#assets.say(this.#assets.texts.faultysolution,'div.speech'); reject() }
      }).then(res => { resolve(res) })
    }
  )} //}}}
}
