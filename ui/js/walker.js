class Walker {
  #jump_back
  #hand
  #brain
  #steps_active
  #eaten

  #changed_steps
  #changed_cmps
  #changed_ins
  #success
  #nosuccess

  #speed_normal
  #speed_fast
  #speed_pause

  #ins_count
  #step_count
  #cmps_count

  #continue

  #pause

  #sleep(milliseconds) {//{{{
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  } //}}}

  #check_steps_active() {//{{{
    if (this.#steps_active) {
      this.#brain += 1
      $('div.field div.ui.brain .text').text(this.#brain)
    }
  } //}}}

  constructor(assets,editor,field) { //{{{
    this.editor = editor
    this.field = field
    this.assets = assets
    this.walking = false
    this.default_timing = 500
    this.#steps_active = false
    this.#jump_back = []
    this.#eaten = ''
    this.#pause = false
    this.#continue = null

    this.#step_count = 0
    this.#ins_count = 0
    this.#cmps_count = 0

    this.#changed_steps = new Event("steps:changed", {"bubbles":false, "cancelable":false})
    this.#changed_cmps = new Event("cmps:changed", {"bubbles":false, "cancelable":false})
    this.#changed_ins = new Event("ins:changed", {"bubbles":false, "cancelable":false})
    this.#success = new Event("walking:success", {"bubbles":false, "cancelable":false})
    this.#nosuccess = new Event("walking:nosuccess", {"bubbles":false, "cancelable":false})
    this.#speed_normal = new Event("speed:normal", {"bubbles":false, "cancelable":false})
    this.#speed_fast = new Event("speed:fast", {"bubbles":false, "cancelable":false})
    this.#speed_pause = new Event("speed:pause", {"bubbles":false, "cancelable":false})

    this.timing = this.default_timing
    this.field.timing = this.default_timing
    this.assets.mute = false
  }  //}}}

  async #walk_rec(it) { //{{{
    if (this.#pause) { await new Promise(resolve => { this.#continue = resolve}) }

    let res;
    for (const [k,v] of it) {
      if (!this.walking) { return false }
      if (v == null) { return true }

      this.#ins_count += 1
      document.dispatchEvent(this.#changed_ins)

      $('div.program svg g[element-group=drop] g[element-type=here]').removeClass('active')
      $('div.program svg g[element-group=drop] g[element-type=here][element-id=' + k + ']').addClass('active')

      if (typeof(v) == 'string') {
        if (v == 'forward') { //{{{
          res = await this.field.forward()
          if (res === false) { this.assets.say(this.assets.texts.nostep,'div.speech'); return false; }
          this.#check_steps_active()
          if (!this.field.check_nocount()) {
            this.#step_count += 1
            document.dispatchEvent(this.#changed_steps)
          }  //}}}
        } else if (v == 'back') { //{{{
          res = await this.field.back()
          if (res === false) { this.assets.say(this.assets.texts.nostep,'div.speech'); return false; }
          this.#check_steps_active()
          if (!this.field.check_nocount()) {
            this.#step_count += 1
            document.dispatchEvent(this.#changed_steps)
          } //}}}
        } else if (v == 'left') { //{{{
          await this.#sleep(this.timing/4)
          res = await this.field.left()
          if (res === false) { return false; }
          await this.#sleep(this.timing/4) //}}}
        } else if (v == 'right') { //{{{
          await this.#sleep(this.timing/4)
          res = await this.field.right()
          if (res === false) { return false; }
          await this.#sleep(this.timing/4) //}}}
        } else if (v == 'step_left') { //{{{
          res = await this.field.step_left()
          if (res === false) { this.assets.say(this.assets.texts.nostep,'div.speech'); return false; }
          this.#check_steps_active()
          if (!this.field.check_nocount()) {
            this.#step_count += 1
            document.dispatchEvent(this.#changed_steps)
          } //}}}
        } else if (v == 'step_right') { //{{{
          res = await this.field.step_right()
          if (res === false) { this.assets.say(this.assets.texts.nostep,'div.speech'); return false; }
          this.#check_steps_active()
          if (!this.field.check_nocount()) {
            this.#step_count += 1
            document.dispatchEvent(this.#changed_steps)
          } //}}}
        } else if (v == 'jump_brain') { //{{{
          if (this.#brain === undefined || this.#brain == null) {
            this.assets.say(this.assets.texts.brainempty,'div.speech')
            return false
          }

          if (this.#brain.toString().match(/\d+,\d+,[NEWS]/)) {
            this.#jump_back.push(JSON.stringify(this.field.state_bunny))
            let [wx,wy,wface] = this.#brain.split(',')
            res = await this.field.jump(wx,wy,wface)
            if (res === false) { return false }
          }
          else if (this.#brain.toString().match(/\d+/)) {
            this.#jump_back.push(JSON.stringify(this.field.state_bunny))
            res = await this.field.jump_forward(this.#brain)
            if (res === false) { return false }
          }
        //}}}
        } else if (v == 'jump_back') { //{{{
          if (this.#jump_back.length > 0) {
            let [wx,wy,wface] = JSON.parse(this.#jump_back.pop())
            res = await this.field.jump(wx,wy,wface)
            if (res === false) { this.assets.say(this.assets.texts.nostep,'div.speech'); return false; }
          } else {
            this.assets.say(this.assets.texts.neverjump,'div.speech')
            return false
          } //}}}
        } else if (v == 'get_carrot') { //{{{
          if (this.#hand === undefined || this.#hand == null) {
            await this.#sleep(this.timing/2)
            res = this.field.get_carrot()
            if (res === false) { this.assets.say(this.assets.texts.noget,'div.speech'); return false; }
            this.#hand = res
            $('div.field div.ui.hand img').show()
            await this.#sleep(this.timing/2)
          } else {
            this.assets.say(this.assets.texts.alreadyhold,'div.speech')
            return false
          } //}}}
        } else if (v == 'put_carrot') { //{{{
          if (!(this.#hand === undefined || this.#hand == null)) {
            await this.#sleep(this.timing/2)
            let tres = 0
            if (this.field.has_carrot()) {
              tres = this.field.get_carrot()
            }
            res = this.field.put_carrot(this.#hand)
            if (res === false) { this.assets.say(this.assets.texts.noplace,'div.speech'); return false; }
            if (tres > 0) {
              this.#hand = tres
              $('div.field div.ui.hand img').show()
            } else {
              this.#hand = null
              $('div.field div.ui.hand img').hide()
            }
            await this.#sleep(this.timing/2)
          } else {
            this.assets.say(this.assets.texts.nocarrot,'div.speech')
            return false
          } //}}}
        } else if (v == 'put_flower') { //{{{
          if (this.#brain === undefined || this.#brain == null) { this.#brain = 0 }

          await this.#sleep(this.timing/2)
          res = this.field.put_flower(this.#brain)
          if (res === false) { this.assets.say(this.assets.texts.noplace,'div.speech'); return false; }
          await this.#sleep(this.timing/2) //}}}
        } else if (v == 'eat_carrot') { //{{{
          if (!(this.#hand === undefined || this.#hand == null)) {
            await this.#sleep(this.timing/2)
            this.field.eat()
            this.#eaten += this.#hand
            this.#hand = null
            $('div.field div.ui.hand img').hide()
            await this.#sleep(this.timing/2)
          } else if (this.field.has_carrot()) {
            await this.#sleep(this.timing/2)
            this.field.eat()
            res = this.field.get_carrot()
            if (res === false) { this.assets.say(this.assets.texts.noeat,'div.speech'); return false; }
            this.#eaten += res
            await this.#sleep(this.timing/2)
          } else {
            this.assets.say(this.assets.texts.noeat,'div.speech')
            return false;
          } //}}}
        } else if (v == 'eat_flower') { //{{{
          if (this.field.has_flower()) {
            await this.#sleep(this.timing/2)
            res = this.field.eat_flower()
            if (res === false) { this.assets.say(this.assets.texts.noeat,'div.speech'); return false; }
            await this.#sleep(this.timing/2)
          } else {
            this.assets.say(this.assets.texts.noeat,'div.speech')
            return false;
          } //}}}
        } else if (v == 'memorize_carrot') { //{{{
          if (this.field.has_carrot()) {
            await this.#sleep(this.timing/2)
            res = this.field.check_carrot()
            if (res === false) { this.assets.say(this.assets.texts.nosee,'div.speech'); return false; }
            $('div.field div.ui.brain .type').hide()
            $('div.field div.ui.brain .text').text(res)
            this.#brain = res
            this.#steps_active = false
            await this.#sleep(this.timing/2)
          } else {
            this.assets.say(this.assets.texts.nosee,'div.speech')
            return false;
          } //}}}
        } else if (v == 'memorize_position') { //{{{
          await this.#sleep(this.timing/2)
          res = this.field.state_bunny[0] + ',' + this.field.state_bunny[1] + ' ' + this.field.state_bunny[2]
          $('div.field div.ui.brain .type').hide()
          $('div.field div.ui.brain .type.location').show()
          $('div.field div.ui.brain .text').text(res)
          this.#brain = this.field.state_bunny.join(',')
          this.#steps_active = false
          await this.#sleep(this.timing/2) //}}}
        } else if (v == 'memorize_steps') { //{{{
          await this.#sleep(this.timing/2)
          $('div.field div.ui.brain .type').hide()
          $('div.field div.ui.brain .type.steps').show()
          this.#brain = 0
          $('div.field div.ui.brain .text').text(this.#brain)
          this.#steps_active = true
          await this.#sleep(this.timing/2) //}}}
        } else if (v == 'memorize_flower') { //{{{
          if (this.field.has_flower()) {
            res = this.field.check_flower()
            if (res === false) { this.assets.say(this.assets.texts.nosee,'div.speech'); return false; }
            if (res.type == 'number') {
              await this.#sleep(this.timing/2)
              $('div.field div.ui.brain .type').hide()
              $('div.field div.ui.brain .text').text(res.value)
              this.#brain = res.value
              this.#steps_active = false
              await this.#sleep(this.timing/2)
            } else if (res.type == 'position') {
              let pos = res.x + ',' + res.y + ' ' + res.face
              $('div.field div.ui.brain .type').hide()
              $('div.field div.ui.brain .type.location').show()
              $('div.field div.ui.brain .text').text(pos)
              this.#brain = res.x + ',' + res.y + ',' + res.face
              this.#steps_active = false
              await this.#sleep(this.timing/2)
            }
          } else {
            this.assets.say(this.assets.texts.nosee,'div.speech')
            return false;
          } //}}}
        } else if (v == 'break') { //{{{
          await this.#sleep(this.timing/2)
          return 'leave' //}}}
        } else if (v == 'fast') { //{{{
          document.dispatchEvent(this.#speed_fast)
          this.timing = 0
          this.field.timing = 0
          this.assets.mute = true //}}}
        } else if (v == 'normal') { //{{{
          document.dispatchEvent(this.#speed_normal)
          this.timing = this.default_timing
          this.field.timing = this.default_timing
          this.assets.mute = false //}}}
        } else if (v == 'pause') { //{{{
          document.dispatchEvent(this.#speed_pause)
          this.#pause = true
          if (this.#pause) { await new Promise(resolve => { this.#continue = resolve}) }
          //}}}
        } else if (v.match(/^execute/)) { //{{{
          await this.#sleep(this.timing/2)
          let pid = parseInt(v[7])
          let it = this.editor.get_item_by_pid(pid)
          res = await this.#walk_rec(it.first)
          if (res === false || res == 'leave') { return res; }
        } //}}}
      }

      if (typeof(v) == 'object' && v != null) {
        switch (v.item) {
          case 'jump': //{{{
            this.#jump_back.push(JSON.stringify(this.field.state_bunny))
            let [wx,wy] = v.target.split(',')
            res = await this.field.jump(parseInt(wx),parseInt(wy),this.field.check_dir(wx,wy))
            if (res === false) { this.assets.say(this.assets.texts.nostep,'div.speech'); return false }
            break //}}}
          case 'loop': //{{{
            res = true
            while (res === true) {
              res = await this.#walk_rec(v.first)
              if (res === false) { return res; }
            }
            break //}}}
          case 'if_carrot': //{{{
            await this.#sleep(this.timing/2)
            if (this.field.has_carrot()) {
              res = await this.#walk_rec(v.first)
              if (res === false || res == 'leave') { return res; }
            } else {
              res = await this.#walk_rec(v.second)
              if (res === false || res == 'leave') { return res; }
            }
            break //}}}
           case 'if_flower': //{{{
            await this.#sleep(this.timing/2)
            if (this.field.has_flower()) {
              res = await this.#walk_rec(v.first)
              if (res === false || res == 'leave') { return res; }
            } else {
              res = await this.#walk_rec(v.second)
              if (res === false || res == 'leave') { return res; }
            }
            break //}}}
          case 'if_hole': //{{{
            await this.#sleep(this.timing/2)
            if (this.field.is_hole()) {
              res = await this.#walk_rec(v.first)
              if (res === false || res == 'leave') { return res; }
            } else {
              res = await this.#walk_rec(v.second)
              if (res === false || res == 'leave') { return res; }
            }
            break //}}}
          case 'if_empty': //{{{
            await this.#sleep(this.timing/2)
            if (this.field.is_empty()) {
              res = await this.#walk_rec(v.first)
              if (res === false || res == 'leave') { return res; }
            } else {
              res = await this.#walk_rec(v.second)
              if (res === false || res == 'leave') { return res; }
            }
            break //}}}
          case 'if_jump': //{{{
            await this.#sleep(this.timing/2)

            if (this.#brain === undefined || this.#brain == null) {
              this.assets.say(this.assets.texts.brainempty,'div.speech')
              return false
            }

            if (this.#brain.toString().match(/\d+,\d+,[NEWS]/)) {
              let [wx,wy,wface] = this.#brain.split(',')
              if (this.field.jump_possible(wx,wy,wface)) {
                res = await this.#walk_rec(v.first)
                if (res === false || res == 'leave') { return res; }
              } else {
                res = await this.#walk_rec(v.second)
                if (res === false || res == 'leave') { return res; }
              }
            }
            else if (this.#brain.toString().match(/\d+/)) {
              res = await this.field.jump_forward(this.#brain)
              if (this.field.jump_forward_possible(wx,wy,wface)) {
                res = await this.#walk_rec(v.first)
                if (res === false || res == 'leave') { return res; }
              } else {
                res = await this.#walk_rec(v.second)
                if (res === false || res == 'leave') { return res; }
              }
            }
             break //}}}
          case 'if_hold': //{{{
            await this.#sleep(this.timing/2)
            if (!(this.#hand === undefined || this.#hand == null)) {
              res = await this.#walk_rec(v.first)
              if (res === false || res == 'leave') { return res; }
            } else {
              res = await this.#walk_rec(v.second)
              if (res === false || res == 'leave') { return res; }
            }
            break //}}}
          case 'if_same': //{{{
            await this.#sleep(this.timing/2)
            if (this.field.has_carrot() || this.field.has_flower()) {
              let cf = this.field.check_flower()
              let cc = this.field.check_carrot()
              if (!(this.#hand === undefined || this.#hand == null)) {
                if (cc !== false) {
                  this.#cmps_count += 1
                  document.dispatchEvent(this.#changed_cmps)
                }
                if ((cc !== false && this.#hand == cc) || (cf !== false && this.#hand == cf.value)) {
                  res = await this.#walk_rec(v.first)
                  if (res === false || res == 'leave') { return res; }
                } else {
                  res = await this.#walk_rec(v.second)
                  if (res === false || res == 'leave') { return res; }
                }
              } else if (!(this.#brain === undefined || this.#brain == null)) {
                if (cc !== false) {
                  this.#cmps_count += 1
                  document.dispatchEvent(this.#changed_cmps)
                }
                if ((cc !== false && this.#brain == cc) || (cf !== false && this.#brain == cf.value)) {
                  res = await this.#walk_rec(v.first)
                  if (res === false || res == 'leave') { return res; }
                } else {
                  res = await this.#walk_rec(v.second)
                  if (res === false || res == 'leave') { return res; }
                }
              } else {
                this.assets.say(this.assets.texts.nocompare,'div.speech')
                return false;
              }
            } else {
              this.assets.say(this.assets.texts.nocompareto,'div.speech')
              return false;
            }
            break //}}}
          case 'if_smaller': //{{{
            await this.#sleep(this.timing/2)
            if (this.field.has_carrot() || this.field.has_flower()) {
              let cf = this.field.check_flower()
              let cc = this.field.check_carrot()
              if (!(this.#hand === undefined || this.#hand == null)) {
                if (cc !== false) {
                  this.#cmps_count += 1
                  document.dispatchEvent(this.#changed_cmps)
                }
                if ((cc !== false && this.#hand < cc) || (cf !== false && this.#hand < cf.value)) {
                  res = await this.#walk_rec(v.first)
                  if (res === false || res == 'leave') { return res; }
                } else {
                  res = await this.#walk_rec(v.second)
                  if (res === false || res == 'leave') { return res; }
                }
              } else if (!(this.#brain === undefined || this.#brain == null)) {
                if (cc !== false) {
                  this.#cmps_count += 1
                  document.dispatchEvent(this.#changed_cmps)
                }
                if ((cc !== false && this.#brain < cc) || (cf !== false && this.#brain < cf.value)) {
                  res = await this.#walk_rec(v.first)
                  if (res === false || res == 'leave') { return res; }
                } else {
                  res = await this.#walk_rec(v.second)
                  if (res === false || res == 'leave') { return res; }
                }
              } else {
                this.assets.say(this.assets.texts.nocompare,'div.speech')
                return false;
              }
            } else {
              this.assets.say(this.assets.texts.nocompareto,'div.speech')
              return false;
            }
            break //}}}
          case 'if_bigger': //{{{
            await this.#sleep(this.timing/2)
            if (this.field.has_carrot() || this.field.has_flower()) {
              let cf = this.field.check_flower()
              let cc = this.field.check_carrot()
              if (!(this.#hand === undefined || this.#hand == null)) {
                if (cc !== false) {
                  this.#cmps_count += 1
                  document.dispatchEvent(this.#changed_cmps)
                }
                if ((cc !== false && this.#hand > cc) || (cf !== false && this.#hand > cf.value)) {
                  res = await this.#walk_rec(v.first)
                  if (res === false || res == 'leave') { return res; }
                } else {
                  res = await this.#walk_rec(v.second)
                  if (res === false || res == 'leave') { return res; }
                }
              } else if (!(this.#brain === undefined || this.#brain == null)) {
                if (cc !== false) {
                  this.#cmps_count += 1
                  document.dispatchEvent(this.#changed_cmps)
                }
                if ((cc !== false && this.#brain > cc) || (cf !== false && this.#brain > cf.value)) {
                  res = await this.#walk_rec(v.first)
                  if (res === false || res == 'leave') { return res; }
                } else {
                  res = await this.#walk_rec(v.second)
                  if (res === false || res == 'leave') { return res; }
                }
              } else {
                this.assets.say(this.assets.texts.nocompare,'div.speech')
                return false;
              }
            } else {
              this.assets.say(this.assets.texts.nocompareto,'div.speech')
              return false;
            }
            break //}}}
        }
      }

      if (typeof(v) == null) {
        return true
      }

    }
    if (it.length == 0) {
      return 'continue'
    } else {
      return true
    }
  } //}} }
  async walk() { //{{{
    this.walking = true
    let res = await this.#walk_rec(this.editor.program)
    this.assets.mute = false
    if (res == true) {
      $('button.speed').hide()
      if (this.field.carrots.join('') == this.#eaten) {
        $('div.program svg g[element-group=drop] g[element-type=here]').removeClass('active')
        document.dispatchEvent(this.#success)
      } else {
        this.assets.say(this.assets.texts.fail,'div.speech')
        document.dispatchEvent(this.#nosuccess)
      }
    } else {
      document.dispatchEvent(this.#nosuccess)
      $('button.speed').hide()
    }
    if (this.walking) {
      $('button.control img').addClass('important')
      this.walking = false;
    } else {
      this.stop()
      this.field.reset_full()
    }
  } //}}}

  speed_control() {
    if (this.#pause) {
      if (this.#continue != null) {
        this.#continue()
        this.#continue = null
      }
      this.#pause = false
      if (this.timing > 0) {
        document.dispatchEvent(this.#speed_normal)
      } else {
        document.dispatchEvent(this.#speed_fast)
      }
    } else if (this.timing == 0) {
      document.dispatchEvent(this.#speed_normal)
      this.timing = this.default_timing
      this.field.timing = this.default_timing
      this.assets.mute = false
    } else {
      document.dispatchEvent(this.#speed_fast)
      this.timing = 0
      this.field.timing = 0
      this.assets.mute = true
    }
  }

  step_count() { return this.#step_count }
  cmps_count() { return this.#cmps_count }
  ins_count() { return this.#ins_count }

  trigger_stop() { //{{{
    if (this.walking) {
      this.walking = false
    } else {
      this.stop()
      this.field.reset_full()
    }
  } //}}}
  stop() { //{{{
    this.#brain = null
    this.#hand = null
    this.#steps_active = false
    this.#eaten = ''
    this.assets.say_reset('div.speech')
    this.#step_count = 0
    this.#cmps_count = 0
    this.#ins_count = 0
    this.timing = this.default_timing
    this.field.timing = this.default_timing
    this.assets.mute = false
    this.#pause = false
    document.dispatchEvent(this.#changed_ins)
    document.dispatchEvent(this.#changed_steps)
    document.dispatchEvent(this.#changed_cmps)
    $('div.program svg g[element-group=drop] g[element-type=here]').removeClass('active')
    $('div.field div.ui.brain .type').hide()
    $('div.field div.ui.brain .text').text('')
    $('div.field div.ui.hand img').hide()
    if (this.#continue != null) {
      this.#continue()
      this.#continue = null
    }
  } //}}}
}
