class Elements {
  #assets
  #field
  #editor

  constructor(target,assets,field,editor) { //{{{
    this.target = target
    this.#assets = assets
    this.#field = field
    this.#editor = editor
    this.elements = []
    this.elements_avail = []
  } //}}}

  render() { //{{{
    this.target.find('*[data-type]').each((_,ele) => {
      let iname = $(ele).attr('data-type')
      let item = this.#assets.commands[iname]
      $(ele).attr('title',item.label)
      if (this.elements.length == 0) {
        $(ele).show()
      } else {
        if (this.elements.includes(iname)) {
          $(ele).show()
          let ea = this.elements_avail[this.elements.indexOf(iname)]
          if (ea > 0) {
            $(ele).attr('data-avail',ea)
          }
        }
      }
      this.target.find(' *[data-type=' + iname + ']').click(()=>{
        this.#assets.say(item.desc,'div.speech')
      })
    })
    this.show(this.#editor.program_stats())
    if (this.elements.includes('execute')) {
      $('#execute').show()
    }
  } //}}}

  show(stats) { //{{{
    for (let e of this.elements) {
      const c = stats[e]
      const ele = this.target.find('img[data-type=' + e + ']')
      if (parseInt(ele.attr('data-avail')) <= c) {
        ele.hide()
      } else {
        ele.show()
      }
    }
  } //}}}
}
