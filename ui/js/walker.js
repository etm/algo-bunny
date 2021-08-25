class Walker {
  constructor(editor,field) { //{{{
    this.editor = editor;
    this.field = field;
    this.walking = false;
  }  //}}}

  #walk_rec(it,eid,para,value) { //{{{
    let newp = [];
    for (const [k,v] of it) {
      if (k == eid) {
        v[para] = value
      }
      newp.push([k,v])
      if (typeof(v) == 'object') {
        if (v.first) {
          v.first = this.#walk_rec(v.first,eid,para,value);
        }
        if (v.second) {
          v.second = this.#walk_rec(v.second,eid,para,value);
        }
      }
    }
    return newp;
  } //}}}
  walk() { //{{{
    this.walking = true
    //this.#walk_rec(editor.program,eid,para,value)
  } //}}}

  stop() { //{{{
    this.walking = false
  } //}}}
}
