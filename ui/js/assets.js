function Assets() {
  var self = this

  this.mute = false

  this.field = {}

  this.say_timeout
  this.say_duration = 8000

  this.oneliners = []

  function load_svg(url,item,i) { //{{{
    return $.ajax({
      type: "GET",
      dataType: "xml",
      url: url
    }).then(function(res) {
      if (i) {
        item[i] = $(res.documentElement).find('> g');
      } else {
        item.push($(res.documentElement).find('> g'));
      }
    });
  } //}}}

  this.play_audio = function(it) { //{{{
    if (!this.mute) {
      it.currentTime = 0
      it.play()
    }
  } //}}}

  this.load = function() { //{{{
    let promises = [];
    Object.values(self.audio).forEach((item) => {
      item.sounds = []
      Object.values(item.locations).forEach((l) => {
        item.sounds.push(new Audio(l))
      })
    })
    Object.values(self.tiles).forEach((item) => {
      item.graphics = [];
      Object.values(item.locations).forEach((l) => {
        promises.push(load_svg(l,item.graphics));
      });
    });
    Object.values(self.placeholders).forEach((item) => {
      item.graphics = {};
      promises.push(load_svg(item.icon,        item.graphics, "icon"       ));
    });
    Object.values(self.commands).forEach((item) => {
      if (item.type == 'simple' || item.type == 'position') {
        item.graphics = {};
        promises.push(load_svg(item.icon,        item.graphics, "icon"       ));
      }
      if (item.type == 'complex_one' || item.type == 'execute') {
        item.graphics = {};
        promises.push(load_svg(item.icon,        item.graphics, "icon"       ));
        promises.push(load_svg(item.first,       item.graphics, "first"      ));
        promises.push(load_svg(item.first_icon,  item.graphics, "first_icon" ));
        promises.push(load_svg(item.middle,      item.graphics, "middle"     ));
        promises.push(load_svg(item.end,         item.graphics, "end"        ));
      }
      if (item.type == 'complex_two') {
        item.graphics = {};
        promises.push(load_svg(item.icon,        item.graphics, "icon"       ));
        promises.push(load_svg(item.first,       item.graphics, "first"      ));
        promises.push(load_svg(item.first_icon,  item.graphics, "first_icon" ));
        promises.push(load_svg(item.middle,      item.graphics, "middle"     ));
        promises.push(load_svg(item.second,      item.graphics, "second"     ));
        promises.push(load_svg(item.second_icon, item.graphics, "second_icon"));
        promises.push(load_svg(item.end,         item.graphics, "end"        ));
      }
    });
    return Promise.all(promises);
  }; //}}}

  this.say_reset = function(target) { //{{{
    if (self.say_timeout) {
      clearTimeout(self.say_timeout)
    }
    $(target).hide()
  } //}}}
  this.say = function(text,target) { //{{{
    if (this.say_timeout) {
      clearTimeout(this.say_timeout);
    }
    $(target).html(text);
    $(target).show();
    this.say_timeout = setTimeout(()=>{$(target).hide();},this.say_duration);
  } //}}}
  this.oneliner = function(target) { //{{{
    if (this.oneliners.length == 0) { this.oneliners = JSON.parse(JSON.stringify(this.raw_oneliners)) }
    let ol =  this.oneliners.sample()
    this.oneliners = this.oneliners.remove(ol)
    this.say(ol,target)
  } //}}}

  /*------------------------*/

  this.audio = {} //{{{
  this.audio.boing = { //{{{
    'locations': [ 'sounds/boing.mp3' ]
  } //}}}
  this.audio.eat = { //{{{
    'locations': [ 'sounds/eat.mp3' ]
  } //}}}
  this.audio.interact = { //{{{
    'locations': [ 'sounds/interact.mp3' ]
  } //}}}
  this.audio.ohno = { //{{{
    'locations': [ 'sounds/ohno.mp3' ]
  } //}}}
  this.audio.yay = { //{{{
    'locations': [ 'sounds/yay.mp3' ]
  } //}}}
  this.audio.no = { //{{{
    'locations': [ 'sounds/no.mp3' ]
  } //}}}
  //}}}


  this.texts = {} //{{{
  this.texts.nostep = "I don't want to step on carrots, flowers or magic! Falling into holes is also not an option."
  this.texts.neverjump = "I can't remember any jumps. To infinity and beyond then?"
  this.texts.noget = "There is no carrot!"
  this.texts.alreadyhold = "I already hold a carrot! I would eat it. Please let me eat it. My precious."
  this.texts.noplace = "There is already something there!"
  this.texts.nocarrot = "I have no carrot. This is an existential crisis!"
  this.texts.brainempty = "My brain is empty."
  this.texts.noeat = "There is nothing to eat! How dare you!"
  this.texts.nosee = "There is nothing to see? I am bored."
  this.texts.nocompare = "I neither have a carrot, nor have I remembered any sizes! This is hopeless!"
  this.texts.nocompareto = "There has to be something in front of me to do fancy size comparisons!"
  this.texts.fail = "All this work, still no success :-("
  this.texts.faultylevel = "Uh oh, level is b0rked :-/"
  this.texts.delete = "To delete an instruction, click on it!"
  this.texts.again = "Play it again to win!"
  this.texts.hurra = 'Victory'
  this.texts.victory_text_title = 'Name of Level:'
  this.texts.victory_text_steps = 'Steps taken:'
  this.texts.victory_text_cmps = 'Carrot Comparisons:'
  this.texts.victory_text_cisc = 'Length of CISC:'
  this.texts.victory_text_ins = 'Instructions evaluated:'
  this.texts.victory_text_explanation = "\
    Refine your code and try again or explore other levels by <strong>closing the browser tab</strong>.\
    <p></p>\
    The lower your numbers, the better your solution. Compare your numbers to the numbers of\
    your friends! Depending on the level \"Steps taken\", or \"Carrot Comparisons\"\
    are more important. \"Length of CISC\" is always a good way to judge the elegance of your solution,\
    if the Steps/Comparisons are similar to your friends'. \"Instructions evaluated\" is the least important metric,\
    but can be a decider."
  this.texts.victory_text_reference_rank = 'Our results were:'
  this.texts.stats_steps = 'Steps'
  this.texts.stats_cmps = 'Carrot Cmps'
  this.texts.stats_ins = 'Instructions'
  this.texts.stats_cisc = 'CISC Length'
  this.texts.stats_success = 'Success'
  this.texts.mission = 'Mission'
  this.texts.control = 'Go / Reset'
  this.texts.speed = 'Current Speed'
  this.texts.save = 'Save Instructions'
  this.texts.load = 'Load Instructions'
  //}}}

  /*------------------------*/

  this.raw_oneliners = [ //{{{
    "I love the smell of carrots in the morning.", // apocalypse now
    "Show me the carrots.", // jerry maguire
    "To carrots and beyond.", // star trek
    "Go ahead, make my day.", // dirty harry
    "Here's looking at you, carrot.", // casablanca
    "Yippie-ki-yay, carrot.", // die hard
    "I'm the king of the carrots.", // titanic
    "The greatest teacher, carrot is.", // star wars
    "If you're nothing without the carrot, then you shouldn't have it.", // spider man
    "I am serious, and don't call me carrot.", // airplane!
    "The carrot abides.", // the big lebowski
    "You're gonna need a bigger carrot.", // jaws
    "May the carrot be with you.", // star wars
    "A carrot is a carrot, but they call it 'la carotte'.", // pulp fiction
    "Leave the flower. Take the carrots.", // the godfather
    "Keep your friends close, but your carrots closer.", // the godfather
    "This is not 'Nom. This is carrot gathering. There is rules.", // the big lebowski
    "You had me at carrot.", // jerry maguire
    "Flowers? Where we're going, we don't need flowers.", // back to the future
    "I'm having a carrot for dinner.", // silence of the lambs
    "We'll always have carrots.", // casablanca
    "I think this is the beginning of a beautiful carrot gathering.", // casablanca
    "Round up the usual carrots.", // casablanca
    "Mama always said life is like a carrot. You never know what you're gonna get.", // forest gump
    "A carrot, for lack of a better word, is good.", // wall street (1987)
    "As God is my witness, I'll never be hungry again.", // gone with the wind
    "Carrots, my dear Watson.", // sherlock holmes
    "Soylent Orange is carrots.", // soylent green
    "My carrot!", // lotr
    "I feel the need, the need for carrots.", // top gun
    "Carpe diem. Seize the carrot. Make your lives extraordinary.", // club of dead poets
    "A million carrots isn't cool. You know what's cool? A billion carrots.", // social network
    "Nobody puts carrot in a corner.", // dirty dancing
    "You want the carrot? You can't handle the carrot!", // a few good men
    "Play it again, carrot." // casablanca
  ] //}}}

  /*------------------------*/

  this.placeholders = {} //{{{
  this.placeholders.add = { /*{{{*/
    'label': 'Add',
    'desc': 'Drag here to add.',
    'icon': 'commands/add.svg'
  }; /*}}}*/
  this.placeholders.below = { /*{{{*/
    'label': 'Add Below',
    'desc': 'Drag here to add.',
    'icon': 'commands/below.svg'
  }; /*}}}*/
  this.placeholders.here = { /*{{{*/
    'label': 'Here',
    'desc': 'Which instruction is executed',
    'icon': 'commands/this.svg'
  }; /*}}}*/
  this.placeholders.delete = { /*{{{*/
    'label': 'Delete',
    'desc': 'Click to delete instruction.',
    'icon': 'commands/delete.svg'
  }; /*}}}*/
  this.placeholders.bunny = { /*{{{*/
    'label': 'Bunny',
    'desc': 'I am Bunny. Algo Bunny.',
    'icon': 'assets/start.svg'
  }; /*}}}*/
  //}}}

  /*------------------------*/

  this.tiles = {} //{{{
  this.tiles.normal = { /*{{{*/
    'locations': [
      'assets/tile1.svg',
      'assets/tile2.svg',
      'assets/tile3.svg',
      'assets/tile4.svg'
    ]
  }; /*}}}*/
  this.tiles.grass = { /*{{{*/
    'locations': [
      'assets/grass1.svg',
      'assets/grass2.svg',
      'assets/grass3.svg',
      'assets/grass4.svg',
      'assets/grass5.svg',
      'assets/grass6.svg'
    ]
  }; /*}}}*/
  this.tiles.carrot = { /*{{{*/
    'locations': [
      'assets/carrot.svg',
    ]
  }; /*}}}*/
  this.tiles.flower_blue = { /*{{{*/
    'locations': [
      'assets/flower_blue.svg',
    ]
  }; /*}}}*/
  this.tiles.flower_red = { /*{{{*/
    'locations': [
      'assets/flower_red.svg',
    ]
  }; /*}}}*/
  this.tiles.flower_math = { /*{{{*/
    'locations': [
      'assets/flower_math1.svg',
      'assets/flower_math2.svg',
      'assets/flower_math3.svg'
    ]
  }; /*}}}*/
  this.tiles.bunny_n = { /*{{{*/
    'locations': [
      'assets/rabbit_west.svg',
    ]
  }; /*}}}*/
  this.tiles.bunny_s = { /*{{{*/
    'locations': [
      'assets/rabbit_east.svg',
    ]
  }; /*}}}*/
  this.tiles.bunny_e = { /*{{{*/
    'locations': [
      'assets/rabbit_south.svg',
    ]
  }; /*}}}*/
  this.tiles.bunny_w = { /*{{{*/
    'locations': [
      'assets/rabbit_north.svg',
    ]
  }; /*}}}*/
  this.tiles.plus = { /*{{{*/
    'locations': [
      'assets/plus.svg',
    ]
  }; /*}}}*/
  this.tiles.minus = { /*{{{*/
    'locations': [
      'assets/minus.svg',
    ]
  }; /*}}}*/
  this.tiles.times = { /*{{{*/
    'locations': [
      'assets/times.svg',
    ]
  }; /*}}}*/
  this.tiles.div = { /*{{{*/
    'locations': [
      'assets/div.svg',
    ]
  }; /*}}}*/
  this.tiles.north = { /*{{{*/
    'locations': [
      'assets/arrow_N.svg',
    ]
  }; /*}}}*/
  this.tiles.south = { /*{{{*/
    'locations': [
      'assets/arrow_S.svg',
    ]
  }; /*}}}*/
  this.tiles.east = { /*{{{*/
    'locations': [
      'assets/arrow_E.svg',
    ]
  }; /*}}}*/
  this.tiles.west = { /*{{{*/
    'locations': [
      'assets/arrow_W.svg',
    ]
  }; /*}}}*/
  //}}}

  /*------------------------*/

  this.commands = {} //{{{
  this.commands.forward = { /*{{{*/
    'type': 'simple',
    'label': 'Forward',
    'desc': 'I take a step in the direction I am facing. I hope I don\'t fall into a hole, step on a carrot or a flower.',
    'icon': 'commands/forward.svg'
  }; /*}}}*/
  this.commands.back = { /*{{{*/
    'type': 'simple',
    'label': 'Back',
    'desc': 'I take a step back. I hope I don\'t fall into a hole, step on a carrot or a flower.',
    'icon': 'commands/back.svg'
  }; /*}}}*/
  this.commands.left = { /*{{{*/
    'type': 'simple',
    'label': 'Turn Left',
    'desc': 'I turn left.',
    'icon': 'commands/left.svg'
  }; /*}}}*/
  this.commands.right = { /*{{{*/
    'type': 'simple',
    'label': 'Turn Right',
    'desc': 'I turn right.',
    'icon': 'commands/right.svg'
  }; /*}}}*/
  this.commands.random = { /*{{{*/
    'type': 'simple',
    'label': 'Turn Random',
    'desc': 'I turn in a random direction.',
    'icon': 'commands/random.svg'
  }; /*}}}*/
  this.commands.step_left = { /*{{{*/
    'type': 'simple',
    'label': 'Sidestep Left',
    'desc': 'I take a step to the left without turning.',
    'icon': 'commands/step_left.svg'
  }; /*}}}*/
  this.commands.step_right = { /*{{{*/
    'type': 'simple',
    'label': 'Sidestep Right',
    'desc': 'I take a step to the right without turning.',
    'icon': 'commands/step_right.svg'
  }; /*}}}*/
  this.commands.jump = { /*{{{*/
    'type': 'position',
    'label': 'Jump',
    'desc': 'I jump to a position on the field. After placing this command, drag a tile onto it to set the position.',
    'icon': 'commands/jump.svg'
   }; /*}}}*/
  this.commands.jump_brain = { /*{{{*/
    'type': 'simple',
    'label': 'Jump',
    'desc': 'I jump to the location I remember in my big brain. If I just remember a number, I move as many steps in the direction I face.',
    'icon': 'commands/jump_brain.svg'
   }; /*}}}*/
  this.commands.jump_back = { /*{{{*/
    'type': 'simple',
    'label': 'Jump Back',
    'desc': 'I jump to the origin of the last jump. I automatically remember my last jump, because jumps are exiting.',
    'icon': 'commands/jump_back.svg'
   }; /*}}}*/

  this.commands.get_carrot = { /*{{{*/
    'type': 'simple',
    'label': 'Get Carrot',
    'desc': 'I pick up the delicious carrot from in front of me - and hold it.',
    'icon': 'commands/get_carrot.svg'
  }; /*}}}*/
  this.commands.put_carrot = { /*{{{*/
    'type': 'simple',
    'label': 'Plant Carrot',
    'desc': 'I plant the carrot I hold in front of me (if there is space).<p>If there is already a carrot in front of me I swap it with the one I am holding.',
    'icon': 'commands/put_carrot.svg'
  }; /*}}}*/
  this.commands.put_flower = { /*{{{*/
    'type': 'simple',
    'label': 'Plant Flower',
    'desc': 'I plant a flower in front of me (if there is space).<p>A red flower reminds me of memorized number. A blue flower reminds me of a memorized position on the field.',
    'icon': 'commands/put_flower.svg'
  }; /*}}}*/
  this.commands.eat_carrot = { /*{{{*/
    'type': 'simple',
    'label': 'Eat Carrot',
    'desc': 'I eat the carrot I hold or the one in front of me.',
    'icon': 'commands/eat_carrot.svg'
  }; /*}}}*/
  this.commands.eat_flower = { /*{{{*/
    'type': 'simple',
    'label': 'Eat Flower',
    'desc': 'I eat the flower in front of me.',
    'icon': 'commands/eat_flower.svg'
  }; /*}}}*/

  this.commands.loop  = { /*{{{*/
    'type': 'complex_one',
    'label': 'Repeat',
    'desc': 'I do something repeatedly. Please tell me when to stop.',
    'icon': 'commands/loop.svg',
    'first': 'commands/loop/top.svg',
    'first_icon': 'commands/loop/y.svg',
    'middle': 'commands/loop/middle.svg',
    'end': 'commands/loop/end.svg'
  }; /*}}}*/
  this.commands.break = { /*{{{*/
    'type': 'simple',
    'label': 'Stop',
    'desc': 'I stop doing what i was repeatedly doing.',
    'icon': 'commands/break.svg'
  }; /*}}}*/

  this.commands.if_carrot = { /*{{{*/
    'type': 'complex_two',
    'label': 'Check If Carrot',
    'desc': 'I check if there is a carrot in front of me.',
    'icon': 'commands/if_carrot.svg',
    'first': 'commands/if_carrot/top.svg',
    'first_icon': 'commands/if_carrot/y.svg',
    'middle': 'commands/if_carrot/middle.svg',
    'second': 'commands/if_carrot/else.svg',
    'second_icon': 'commands/if_carrot/n.svg',
    'end': 'commands/if_carrot/end.svg'
  }; /*}}}*/
  this.commands.if_empty = { /*{{{*/
    'type': 'complex_two',
    'label': 'Check If Empty',
    'desc': 'I check if there is only grass in front of me.',
    'icon': 'commands/if_empty.svg',
    'first': 'commands/if_empty/top.svg',
    'first_icon': 'commands/if_empty/y.svg',
    'middle': 'commands/if_empty/middle.svg',
    'second': 'commands/if_empty/else.svg',
    'second_icon': 'commands/if_empty/n.svg',
    'end': 'commands/if_empty/end.svg'
  }; /*}}}*/
  this.commands.if_flower = { /*{{{*/
    'type': 'complex_two',
    'label': 'Check If Flower',
    'desc': 'I check if there is any flower in front of me.',
    'icon': 'commands/if_flower.svg',
    'first': 'commands/if_flower/top.svg',
    'first_icon': 'commands/if_flower/y.svg',
    'middle': 'commands/if_flower/middle.svg',
    'second': 'commands/if_flower/else.svg',
    'second_icon': 'commands/if_flower/n.svg',
    'end': 'commands/if_flower/end.svg'
  }; /*}}}*/
  this.commands.if_hole = { /*{{{*/
    'type': 'complex_two',
    'label': 'Check If Hole',
    'desc': 'I check if there is a hole in front of me.',
    'icon': 'commands/if_hole.svg',
    'first': 'commands/if_hole/top.svg',
    'first_icon': 'commands/if_hole/y.svg',
    'middle': 'commands/if_hole/middle.svg',
    'second': 'commands/if_hole/else.svg',
    'second_icon': 'commands/if_hole/n.svg',
    'end': 'commands/if_hole/end.svg'
  }; /*}}}*/
  this.commands.if_hold = { /*{{{*/
    'type': 'complex_two',
    'label': 'Check Carrot In Hand',
    'desc': 'I check if I hold a carrot in my hand.',
    'icon': 'commands/if_hold.svg',
    'first': 'commands/if_hold/top.svg',
    'first_icon': 'commands/if_hold/y.svg',
    'middle': 'commands/if_hold/middle.svg',
    'second': 'commands/if_hold/else.svg',
    'second_icon': 'commands/if_hold/n.svg',
    'end': 'commands/if_hold/end.svg'
  }; /*}}}*/
  this.commands.if_same = { /*{{{*/
    'type': 'complex_two',
    'label': 'Check If Equal',
    'desc': '<strong>Same:</strong> I can compare the thing I hold in my hand or remember in my brain with the flower or carrot in front of me.<p>Each carrot has a size between 1 and 9. Each flower containes a number or a coordinate.',
    'icon': 'commands/if_same.svg',
    'first': 'commands/if_same/top.svg',
    'first_icon': 'commands/if_same/y.svg',
    'middle': 'commands/if_same/middle.svg',
    'second': 'commands/if_same/else.svg',
    'second_icon': 'commands/if_same/n.svg',
    'end': 'commands/if_same/end.svg'
  }; /*}}}*/
  this.commands.if_smaller = { /*{{{*/
    'type': 'complex_two',
    'label': 'Check If Smaller',
    'desc': '<strong>Smaller:</strong> I can compare the thing I hold in my hand or remember in my brain with the flower or carrot in front of me.<p>Each carrot has a size between 1 and 9. Each flower containes a number or a coordinate.',
    'icon': 'commands/if_smaller.svg',
    'first': 'commands/if_smaller/top.svg',
    'first_icon': 'commands/if_smaller/y.svg',
    'middle': 'commands/if_smaller/middle.svg',
    'second': 'commands/if_smaller/else.svg',
    'second_icon': 'commands/if_smaller/n.svg',
    'end': 'commands/if_smaller/end.svg'
  }; /*}}}*/
  this.commands.if_bigger = { /*{{{*/
    'type': 'complex_two',
    'label': 'Check If Bigger',
    'desc': '<strong>Bigger:</strong> I can compare the thing I hold in my hand or remember in my brain with the flower or carrot in front of me.<p>Each carrot has a size between 1 and 9. Each flower containes a number or a coordinate.',
    'icon': 'commands/if_bigger.svg',
    'first': 'commands/if_bigger/top.svg',
    'first_icon': 'commands/if_bigger/y.svg',
    'middle': 'commands/if_bigger/middle.svg',
    'second': 'commands/if_bigger/else.svg',
    'second_icon': 'commands/if_bigger/n.svg',
    'end': 'commands/if_bigger/end.svg'
  }; /*}}}*/
  this.commands.if_jump = { /*{{{*/
    'type': 'complex_two',
    'label': 'Check If Jump Is Possible',
    'desc': 'I check if can jump to the location I memorized.',
    'icon': 'commands/if_jump.svg',
    'first': 'commands/if_jump/top.svg',
    'first_icon': 'commands/if_jump/y.svg',
    'middle': 'commands/if_jump/middle.svg',
    'second': 'commands/if_jump/else.svg',
    'second_icon': 'commands/if_jump/n.svg',
    'end': 'commands/if_jump/end.svg'
  }; /*}}}*/

  this.commands.memorize_carrot = { /*{{{*/
    'type': 'simple',
    'label': 'Memorize Carrot Size',
    'desc': 'I memorize the size of the carrot in front of me.',
    'icon': 'commands/memorize_carrot.svg'
  }; /*}}}*/
  this.commands.memorize_steps = { /*{{{*/
    'type': 'simple',
    'label': 'Memorize Steps or Reset',
    'desc': 'I memorize the number of steps I will take from now on.',
    'icon': 'commands/memorize_steps.svg'
  }; /*}}}*/
  this.commands.memorize_position = { /*{{{*/
    'type': 'simple',
    'label': 'Memorize Position',
    'desc': 'I memorize my current position.',
    'icon': 'commands/memorize_position.svg'
  }; /*}}}*/
  this.commands.memorize_flower = { /*{{{*/
    'type': 'simple',
    'label': 'Memorize Flower Size or Location',
    'desc': 'I memorize the flower in front of me.<p>If it\'s a red flower I memorize its size. If it\'s a blue flower I memorize the saved location.',
    'icon': 'commands/memorize_flower.svg'
  }; /*}}}*/

  this.commands.execute = { /*{{{*/
    'type': 'execute',
    'label': 'Instruction Group',
    'desc': 'I learn to do multiple things in a group.',
    'icon': 'commands/execute_start.svg',
    'first': 'commands/execute/top.svg',
    'first_icon': 'commands/execute/y.svg',
    'middle': 'commands/execute/middle.svg',
    'end': 'commands/execute/end.svg'
  }; /*}}}*/
  this.commands.execute1 = { /*{{{*/
    'type': 'simple',
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
    'icon': 'commands/execute1.svg'
  }; /*}}}*/
  this.commands.execute2 = { /*{{{*/
    'type': 'simple',
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
    'icon': 'commands/execute2.svg'
  }; /*}}}*/
  this.commands.execute3 = { /*{{{*/
    'type': 'simple',
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
    'icon': 'commands/execute3.svg'
  }; /*}}}*/
  this.commands.execute4 = { /*{{{*/
    'type': 'simple',
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
    'icon': 'commands/execute4.svg'
  }; /*}}}*/
  this.commands.execute5 = { /*{{{*/
    'type': 'simple',
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
    'icon': 'commands/execute5.svg'
  }; /*}}}*/
  this.commands.execute6 = { /*{{{*/
    'type': 'simple',
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
    'icon': 'commands/execute6.svg'
  }; /*}}}*/
  this.commands.execute7 = {  /*{{{*/
    'type': 'simple',
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
    'icon': 'commands/execute7.svg'
  }; /*}}}*/
  this.commands.execute8 = { /*{{{*/
    'type': 'simple',
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
    'icon': 'commands/execute8.svg'
  }; /*}}}*/
  this.commands.execute9 = { /*{{{*/
    'type': 'simple',
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
    'icon': 'commands/execute9.svg'
  }; /*}}}*/

  this.commands.fast = { /*{{{*/
    'type': 'simple',
    'label': 'Move Fast',
    'desc': 'I am speed ... jackrabbit.',
    'icon': 'commands/fast.svg'
  }; /*}}}*/
  this.commands.normal = { /*{{{*/
    'type': 'simple',
    'label': 'Move Normal',
    'desc': 'Super pursuit mode ... off.',
    'icon': 'commands/normal.svg'
  }; /*}}}*/
  this.commands.pause = { /*{{{*/
    'type': 'simple',
    'label': 'Pause Here',
    'desc': 'I give up. I pause here, and debug myself.',
    'icon': 'commands/pause.svg'
  }; /*}}}*/
  //}}}

  this.lang = {}

  /*------------------------*/
  /* German                 */
  /*------------------------*/
  this.lang['de'] = {}

  this.lang['de'].texts = {} //{{{
  this.lang['de'].texts.nostep = "I will nicht auf Karotten, Blumen oder Magie steigen! Ich will auch nicht in ein Loch fallen."
  this.lang['de'].texts.neverjump = "Ich kann mich an keine Sprünge erinnern. Soll ich also in die Unendlichkeit und noch viel weiter springen?"
  this.lang['de'].texts.noget = "There is no carrot!"
  this.lang['de'].texts.alreadyhold = "I halte schon eine Karotte in meiner Pfote! I könnte sie essen. Bitte lass mich sie essen. Mein Schatz."
  this.lang['de'].texts.noplace = "Da ist schon was!"
  this.lang['de'].texts.nocarrot = "I habe keine Karotte. Das versetzt mich in eine existentielle Krise!"
  this.lang['de'].texts.brainempty = "My Gehirn ist leer."
  this.lang['de'].texts.noeat = "Hier gibts nix zu essen! Grrrrrr!"
  this.lang['de'].texts.nosee = "Hier gibts nix zu sehen? I bin gelangweilt."
  this.lang['de'].texts.nocompare = "I hab weder eine Karotte noch kann ich mich an die Größe eine Karotte erinnern! Es ist sinnlos!"
  this.lang['de'].texts.nocompareto = "Auf dem Feld vor mir muss was sein, damit ich einen Größenvergleich machen kann!"
  this.lang['de'].texts.fail = "So viel Arbeit, und immer noch nicht geschafft :-("
  this.lang['de'].texts.faultylevel = "Oh oh, das Level ist k4putt :-/"
  this.lang['de'].texts.delete = "Um eine Anweisung zu löschen, klick einfach drauf!"
  this.lang['de'].texts.again = "Lass mich das einfach nochmal machen, wenn du gewinnen willst!"
  this.lang['de'].texts.hurra = 'Hurra!'
  this.lang['de'].texts.victory_text_title = 'Name des Levels:'
  this.lang['de'].texts.victory_text_steps = 'Schritte:'
  this.lang['de'].texts.victory_text_cmps = 'Karottenvergleiche:'
  this.lang['de'].texts.victory_text_cisc = 'CISC Länge:'
  this.lang['de'].texts.victory_text_ins = 'Ausgeführte Anweisungen:'
  this.lang['de'].texts.victory_text_explanation = "\
    Mach deinen Code besser und versuchs nochmal, oder probier andere Levels indem du <strong>diesen Browser Tab schließt</strong>.\
    <p></p>\
    Je niedriger die Zahlen sind, desto besser ist die Lösung. Vergleiche\
    deine Zahlen mit den Zahlen deiner Freunde! Je nach Level sind \"Schritte\"\
    oder \"Karottenvergleiche\" wichtiger. Die \"CISC Länge\" ist immer ein gutes\
    Mittel, um die Eleganz deiner Lösung zu beurteilen, sollten\
    Schritte/Karottenvergleiche ähnlich sein wie bei deinen Freunden.\
    \"Ausgeführte Anweisungen\" sind die am wenigsten wichtige Kennzahl, können\
    aber auch verwendet werden um zu entscheiden welche Lösung gut ist."
  this.lang['de'].texts.victory_text_reference_rank = 'Ein gutes Vergleichsergebnis ist:'
  this.lang['de'].texts.stats_steps = 'Schritte'
  this.lang['de'].texts.stats_cmps = 'Vergleiche'
  this.lang['de'].texts.stats_ins = 'Anweisungen'
  this.lang['de'].texts.stats_cisc = 'CISC Länge'
  this.lang['de'].texts.stats_success = 'Erfolg'
  this.lang['de'].texts.mission = 'Mission'
  this.lang['de'].texts.control = 'Los / Reset'
  this.lang['de'].texts.speed = 'Aktuelle Geschwindigkeit'
  this.lang['de'].texts.save = 'Speichern'
  this.lang['de'].texts.load = 'Laden'
  //}}}

  this.lang['de'].raw_oneliners = [ //{{{
    "Ich liebe den Geruch von Karotten am Morgen.",
    "Möge die Karotte mit dir sein.",
    "Zu den Karotten, und noch viel weiter.",
    "Blumen? Wo wir hingehen brauchen wir keine Blumen."
  ] //}}}

  // no need to translate because we currently only use the icons
  this.lang['de'].placeholders = {}

  this.lang['de'].commands = {} //{{{
  this.lang['de'].commands.forward = { /*{{{*/
    'label': 'Schritt nach vor',
    'desc': 'Ich hüpfe einen Schritt in die Richtung in die ich schaue. I hoffe ich falle in kein Loch und steige auf keine Karotte oder Blume.'
  }; /*}}}*/
  this.lang['de'].commands.back = { /*{{{*/
    'label': 'Schritt zurück',
    'desc': 'Ich hüpfe einen Schritt zurück. Ich hoffe ich falle in kein Loch und steige auf keine Karotte oder Blume.'
  }; /*}}}*/
  this.lang['de'].commands.left = { /*{{{*/
    'label': 'Linksdrehung',
    'desc': 'Ich dreh mich nach links.'
  }; /*}}}*/
  this.lang['de'].commands.right = { /*{{{*/
    'label': 'Rechtsdrehung',
    'desc': 'Ich drehe mich nach rechts.'
  }; /*}}}*/
  this.lang['de'].commands.random = { /*{{{*/
    'label': 'Zufallsdrehung',
    'desc': 'Ich drehe mich in eine zufällige Richtung.'
  }; /*}}}*/
  this.lang['de'].commands.step_left = { /*{{{*/
    'label': 'Schritt nach Links',
    'desc': 'Ich hüpfe seitlich nach links ohne mich zu drehen.'
  }; /*}}}*/
  this.lang['de'].commands.step_right = { /*{{{*/
    'label': 'Schritt nach Rechts',
    'desc': 'Ich hüpfe seitlich nach rechts ohne mich zu drehen.'
  }; /*}}}*/
  this.lang['de'].commands.jump = { /*{{{*/
    'label': 'Sprung',
    'desc': 'Ich springe zu einem anderen Feld. Ziehe das Feld auf das ich springen soll auf diese Anweisung.'
   }; /*}}}*/
  this.lang['de'].commands.jump_brain = { /*{{{*/
    'label': 'Sprung',
    'desc': 'Ich springe zum Feld das ich mir in meinem großen Gehirn gemerkt habe. Falls ich mir gerade eine Zahl merke springe ich soviele Felder in die Richtung in die ich gerade schaue.'
   }; /*}}}*/
  this.lang['de'].commands.jump_back = { /*{{{*/
    'label': 'Rücksprung',
    'desc': 'Ich springe dahin woher ich gekommen bin. Ich merk mir immer woher ich gekommen bin, weil Sprünge so aufregend sind.'
   }; /*}}}*/

  this.lang['de'].commands.get_carrot = { /*{{{*/
    'label': 'Karotte nehmen',
    'desc': 'Ich nehme die leckere Karotte auf dem Feld vor mir - und halte sie einfach nur :-/'
  }; /*}}}*/
  this.lang['de'].commands.put_carrot = { /*{{{*/
    'label': 'Karotte pflanzen',
    'desc': 'Ich planze die Karotte die ich gerade halte auf das Feld vor mir (falls Platz ist).<p>Wenn da schon eine Karotte ist, dann tausche ich die Karotten.'
  }; /*}}}*/
  this.lang['de'].commands.put_flower = { /*{{{*/
    'label': 'Blume planzen',
    'desc': 'Ich pflanze eine Blume auf das Feld vor mir (falls Platz ist).<p>Eine rote Blume erinnert mich an die Zahl die ich mir gerade merke. Eine blaue Blume erinnert mich an ein Feld zu dem ich springen kann das ich mir gerade merke.'
  }; /*}}}*/
  this.lang['de'].commands.eat_carrot = { /*{{{*/
    'label': 'Essen',
    'desc': 'Ich esse Karotte die ich gerade halte oder die auf dem Feld vor mir steht. Endlich!'
  }; /*}}}*/
  this.lang['de'].commands.eat_flower = { /*{{{*/
    'label': 'Essen',
    'desc': 'Ich esse die Blume auf dem Feld vor mir.'
  }; /*}}}*/

  this.lang['de'].commands.loop  = { /*{{{*/
    'label': 'Schleife',
    'desc': 'Ich mach etwas wieder und wieder und wieder. Sag mir wann ich aufhören soll.'
  }; /*}}}*/
  this.lang['de'].commands.break = { /*{{{*/
    'label': 'Stop',
    'desc': 'I höre mit der aktuelle Schleife auf.'
  }; /*}}}*/

  this.lang['de'].commands.if_carrot = { /*{{{*/
    'label': 'Wenn Karotte',
    'desc': 'Ich checke ob auf dem Feld vor mit eine Karotte steht.'
  }; /*}}}*/
  this.lang['de'].commands.if_empty = { /*{{{*/
    'label': 'Wenn Gras',
    'desc': 'Ich checke ob das Feld vor mir leer ist.'
  }; /*}}}*/
  this.lang['de'].commands.if_flower = { /*{{{*/
    'label': 'Wenn Blume',
    'desc': 'Ich checke ob auf dem Feld vor mir eine Blume wächst.'
  }; /*}}}*/
  this.lang['de'].commands.if_hole = { /*{{{*/
    'label': 'Wenn Loch',
    'desc': 'Ich checke ob vor mir ein Loch ist.'
  }; /*}}}*/
  this.lang['de'].commands.if_hold = { /*{{{*/
    'label': 'Check Carrot In Hand',
    'desc': 'I check if I hold a carrot in my hand.',
  }; /*}}}*/
  this.lang['de'].commands.if_same = { /*{{{*/
    'label': 'Check If Equal',
    'desc': '<strong>Same:</strong> I can compare the thing I hold in my hand or remember in my brain with the flower or carrot in front of me.<p>Each carrot has a size between 1 and 9. Each flower containes a number or a coordinate.',
  }; /*}}}*/
  this.lang['de'].commands.if_smaller = { /*{{{*/
    'label': 'Check If Smaller',
    'desc': '<strong>Smaller:</strong> I can compare the thing I hold in my hand or remember in my brain with the flower or carrot in front of me.<p>Each carrot has a size between 1 and 9. Each flower containes a number or a coordinate.',
  }; /*}}}*/
  this.lang['de'].commands.if_bigger = { /*{{{*/
    'label': 'Check If Bigger',
    'desc': '<strong>Bigger:</strong> I can compare the thing I hold in my hand or remember in my brain with the flower or carrot in front of me.<p>Each carrot has a size between 1 and 9. Each flower containes a number or a coordinate.',
  }; /*}}}*/
  this.lang['de'].commands.if_jump = { /*{{{*/
    'label': 'Check If Jump Is Possible',
    'desc': 'I check if can jump to the location I memorized.',
  }; /*}}}*/

  this.lang['de'].commands.memorize_carrot = { /*{{{*/
    'label': 'Memorize Carrot Size',
    'desc': 'I memorize the size of the carrot in front of me.',
  }; /*}}}*/
  this.lang['de'].commands.memorize_steps = { /*{{{*/
    'label': 'Memorize Steps or Reset',
    'desc': 'I memorize the number of steps I will take from now on.',
  }; /*}}}*/
  this.lang['de'].commands.memorize_position = { /*{{{*/
    'label': 'Memorize Position',
    'desc': 'I memorize my current position.',
  }; /*}}}*/
  this.lang['de'].commands.memorize_flower = { /*{{{*/
    'label': 'Memorize Flower Size or Location',
    'desc': 'I memorize the flower in front of me.<p>If it\'s a red flower I memorize its size. If it\'s a blue flower I memorize the saved location.',
  }; /*}}}*/

  this.lang['de'].commands.execute = { /*{{{*/
    'label': 'Gruppe',
    'desc': 'Eine Gruppe von Anweisungen die ich machen kann wann immer du willst.',
  }; /*}}}*/
  this.lang['de'].commands.execute1 = { /*{{{*/
    'label': 'Gruppe',
    'desc': 'Ich mach die Gruppe von Anweisungen so wie du sie mitgeteilt hast.',
  }; /*}}}*/
  this.lang['de'].commands.execute2 = { /*{{{*/
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
  }; /*}}}*/
  this.lang['de'].commands.execute3 = { /*{{{*/
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
  }; /*}}}*/
  this.lang['de'].commands.execute4 = { /*{{{*/
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
  }; /*}}}*/
  this.lang['de'].commands.execute5 = { /*{{{*/
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
  }; /*}}}*/
  this.lang['de'].commands.execute6 = { /*{{{*/
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
  }; /*}}}*/
  this.lang['de'].commands.execute7 = {  /*{{{*/
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
  }; /*}}}*/
  this.lang['de'].commands.execute8 = { /*{{{*/
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
  }; /*}}}*/
  this.lang['de'].commands.execute9 = { /*{{{*/
    'label': 'Do Something',
    'desc': 'I do multiple things you told me to do.',
  }; /*}}}*/

  this.lang['de'].commands.fast = { /*{{{*/
    'label': 'Move Fast',
    'desc': 'I am speed ... jackrabbit.',
  }; /*}}}*/
  this.lang['de'].commands.normal = { /*{{{*/
    'label': 'Move Normal',
    'desc': 'Super pursuit mode ... off.',
  }; /*}}}*/
  this.lang['de'].commands.pause = { /*{{{*/
    'label': 'Pause Here',
    'desc': 'I give up. I pause here, and debug myself.',
  }; /*}}}*/
  //}}}

  /*------------------------*/
  /* Load Translation       */
  /*------------------------*/

  if ($.cookie('language')) {
    let lang = $.cookie('language')
    if (this.lang[lang]) {
      this.raw_oneliners = this.lang[lang].raw_oneliners
      for (const k in this.lang[lang].placeholders) {
        this.placeholders[k].label = this.lang[lang].placeholders[k].label
        this.placeholders[k].desc = this.lang[lang].placeholders[k].desc
      }
      for (const k in this.lang[lang].commands) {
        this.commands[k].label = this.lang[lang].commands[k].label
        this.commands[k].desc = this.lang[lang].commands[k].desc
      }
      for (const k in this.lang[lang].texts) {
        this.texts[k] = this.lang[lang].texts[k]
      }
    }
  }

}
