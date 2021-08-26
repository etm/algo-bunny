class Walker {
  #jump_back
  #hand
  #brain
  #steps_active

  #sleep(milliseconds) {//{{{
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  } //}}}

  #check_steps_active() {//{{{
    if (this.#steps_active) {
      this.#brain += 1
      $('div.field div.ui.brain .text').text(this.#brain)
    }
  } //}}}

  constructor(editor,field) { //{{{
    this.editor = editor;
    this.field = field;
    this.walking = false;
    this.timing = 500
    this.#steps_active = false
    this.#jump_back = null
  }  //}}}

  async #walk_rec(it) { //{{{
    let res;
    for (const [k,v] of it) {
      if (typeof(v) == 'string') {
        switch (v) {
          case 'forward': //{{{
            res = await this.field.forward()
            if (res === false) { return false; }
            this.#check_steps_active()
            break; //}}}
          case 'left': //{{{
            await this.#sleep(this.timing/2)
            res = await this.field.left()
            if (res === false) { return false; }
            await this.#sleep(this.timing/2)
            break; //}}}
          case 'right': //{{{
            await this.#sleep(this.timing/2)
            res = await this.field.right()
            if (res === false) { return false; }
            await this.#sleep(this.timing/2)
            break; //}}}
          case 'step_left': //{{{
            res = await this.field.step_left()
            if (res === false) { return false; }
            this.#check_steps_active()
            break; //}}}
          case 'step_right': //{{{
            res = await this.field.step_right()
            if (res === false) { return false; }
            this.#check_steps_active()
            break; //}}}
          case 'jump_back': //{{{
            if (this.#jump_back != null) {
              let [wx,wy,wface] = JSON.parse(this.#jump_back)
              res = await this.field.jump(wx,wy,wface)
              if (res === false) { return false; }
            } else {
              return false
            }
            break; //}}}
          case 'get_carrot': //{{{
            if (this.#hand === undefined || this.#hand == null) {
              await this.#sleep(this.timing/2)
              res = this.field.get_carrot()
              if (res === false) { return false; }
              this.#hand = res
              $('div.field div.ui.hand img').show()
              await this.#sleep(this.timing/2)
            } else {
              return false
            }
            break; //}}}
          case 'put_carrot': //{{{
            if (!(this.#hand === undefined || this.#hand == null)) {
              await this.#sleep(this.timing/2)
              res = this.field.put_carrot(this.#hand)
              if (res === false) { return false; }
              this.#hand = null
              $('div.field div.ui.hand img').hide()
              await this.#sleep(this.timing/2)
            } else {
              return false
            }
            break; //}}}
          case 'put_flower': //{{{
            if (!(this.#brain === undefined || this.#brain == null)) {
              await this.#sleep(this.timing/2)
              res = this.field.put_flower(this.#brain)
              if (res === false) { return false; }
              await this.#sleep(this.timing/2)
            } else {
              return false
            }
            break; //}}}
          case 'eat_carrot': //{{{
            if (!(this.#hand === undefined || this.#hand == null)) {
              await this.#sleep(this.timing/2)
              this.field.eat()
              this.#hand = null
              $('div.field div.ui.hand img').hide()
              await this.#sleep(this.timing/2)
            } else if (this.field.has_carrot()) {
              await this.#sleep(this.timing/2)
              res = this.field.get_carrot()
              if (res === false) { return false; }
              this.field.eat()
              await this.#sleep(this.timing/2)
            } else {
              return false;
            }
            break; //}}}
          case 'eat_flower': //{{{
            if (this.field.has_flower()) {
              await this.#sleep(this.timing/2)
              res = this.field.eat_flower()
              if (res === false) { return false; }
              await this.#sleep(this.timing/2)
            } else {
              return false;
            }
            break; //}}}
          case 'memorize_carrot': //{{{
            if (this.field.has_carrot()) {
              await this.#sleep(this.timing/2)
              res = this.field.check_carrot()
              if (res === false) { return false; }
              $('div.field div.ui.brain .type').hide()
              $('div.field div.ui.brain .text').text(res)
              this.#brain = res
              this.#steps_active = false
              await this.#sleep(this.timing/2)
            } else {
              return false;
            }
            break; //}}}
          case 'memorize_position': //{{{
            await this.#sleep(this.timing/2)
            res = this.field.state_bunny[0] + ',' + this.field.state_bunny[1] + ' ' + this.field.state_bunny[2];
            $('div.field div.ui.brain .type').hide()
            $('div.field div.ui.brain .type.location').show()
            $('div.field div.ui.brain .text').text(res)
            this.#brain = this.field.state_bunny.join(',')
            this.#steps_active = false
            await this.#sleep(this.timing/2)
             break; //}}}
          case 'memorize_steps': //{{{
            await this.#sleep(this.timing/2)
            $('div.field div.ui.brain .type').hide()
            $('div.field div.ui.brain .type.steps').show()
            this.#brain = 0
            $('div.field div.ui.brain .text').text(this.#brain)
            this.#steps_active = true
            await this.#sleep(this.timing/2)
            break; //}}}
          case 'memorize_flower': // fix //{{{
            if (this.field.has_flower()) {
              res = this.field.check_flower()
              if (res === false) { return false; }
              if (res.type == 'number') {
                await this.#sleep(this.timing/2)
                $('div.field div.ui.brain .type').hide()
                $('div.field div.ui.brain .text').text(res.value)
                this.#brain = res
                this.#steps_active = false
                await this.#sleep(this.timing/2)
              } else if (res.type == 'position') {
                res = await this.field.jump(res.x,res.y,res.face)
                if (res === false) { return false; }
              }
            } else {
              return false;
            }
            break; //}}}
        }
      }
      if (typeof(v) == 'object') {
        if (v.item == 'jump') {
          this.#jump_back = JSON.stringify(this.field.state_bunny)
          let [wx,wy] = v.target.split(',')
          res = await this.field.jump(parseInt(wx),parseInt(wy))
          if (res === false) { return false; }
        }
      }

      //   if (v.first) {
      //     v.first = this.#walk_rec(v.first,eid,para,value);
      //   }
      //   if (v.second) {
      //     v.second = this.#walk_rec(v.second,eid,para,value);
      //   }
      // }
    }
    return true;
  } //}}}
  walk() { //{{{
    this.walking = true
    this.#walk_rec(this.editor.program)
  } //}}}

  stop() { //{{{
    this.walking = false
    this.#brain = null
    this.#hand = null
    this.#steps_active = false
    $('div.field div.ui.brain .type').hide()
    $('div.field div.ui.brain .text').text('')
    $('div.field div.ui.hand img').hide()
  } //}}}
}
