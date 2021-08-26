function Assets() {
  var self = this

  this.commands = {}
  this.field = {}
  this.placeholders = {}
  this.tiles = {}
  this.texts = {}
  this.audio = {}

  this.say_timeout
  this.say_duration = 8000


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
    new Audio(it).play()
  } //}}}

  this.load = function() { //{{{
    let promises = [];
    _.each(self.tiles,(item) => {
        item.graphics = [];
        _.each(item.locations,(l) => {
          promises.push(load_svg(l,item.graphics));
        });
    });
    _.each(self.placeholders,(item) => {
        item.graphics = {};
        promises.push(load_svg(item.icon,        item.graphics, "icon"       ));
    });
    _.each(self.commands,(item) => {
      if (item.type == 'simple' || item.type == 'position') {
        item.graphics = {};
        promises.push(load_svg(item.icon,        item.graphics, "icon"       ));
      }
      if (item.type == 'complex_one') {
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
    this.say(this.oneliners.sample(),target)
  } //}}}

  /*------------------------*/

  this.audio.boing = [ 'sounds/boing.mp3' ]
  this.audio.eat = [ 'sounds/eat.mp3' ]
  this.audio.interact = [ 'sounds/interact.mp3' ]
  this.audio.ohno =  [ 'sounds/ohno.mp3' ]

  this.texts.nostep = "I don't want to step on carrots, flowers or magic! Falling into holes is also not an option."
  this.texts.neverjump = "I never jumped before. To infinity and beyond?"
  this.texts.noget = "There is no carrot!"
  this.texts.alreadyhold = "I already hold a carrot! I would eat it. Please let me eat it. My precious."
  this.texts.noplace = "There is already something there!"
  this.texts.nocarrot = "I have no carrot. This is an existential crisis!"
  this.texts.brainempty = "My brain is empty."
  this.texts.noeat = "There is nothing to eat! How dare you!"
  this.texts.nosee = "There is nothing to see? I am bored."
  this.texts.fail = "All this work, still no success :-("
  this.texts.faultylevel = "Uh oh, level is b0rked :-/"

  /*------------------------*/

  this.oneliners = [ //{{{
    "I love the smell of carrots in the morning.",
    "Show me the carrots.",
    "To carrots and beyond.",
    "Go ahead, make my day.",
    "Here's looking at you, carrot.",
    "Yippie-ki-yay, carrot.",
    "I'm the king of the carrots.",
    "The greatest teacher, carrot is.",
    "If you're nothing without the carrot, then you shouldn't have it.",
    "I am serious, don't call me carrot.",
    "The carrot abides.",
    "You're gonna need a bigger carrot.",
    "May the carrot be with you.",
    "A carrot is a carrot, but they call it 'la carotte'.",
    "Leave the flower. Take the carrots.",
    "Keep your friends close, but your carrots closer.",
    "This is not 'Nam. This is carrot gathering. There is rules.",
    "You had me at carrot.",
    "Flowers? Where we're going, we don't need flowers.",
    "I'm having a carrot for dinner.",
    "We'll always have carrots.",
    "I think this is the beginning of a beautiful carrot gathering.",
    "Round up the usual carrots.",
    "Mama always said life is like a carrot. You never know what you're gonna get.",
    "A carrot, for lack of a better word, is good.",
    "As God is my witness, I'll never be hungry again.",
    "Carrots, my dear Watson.",
    "Soylent Orange is carrots.",
    "My carrot!",
    "I feel the need, the need for carrots.",
    "Carpe diem. Seize the carrot. Make your lives extraordinary.",
    "A million carrots isn't cool. You know what's cool? A billion carrots."
  ] //}}}

  /*------------------------*/

  this.placeholders.add = { /*{{{*/
    'label': 'Add',
    'desc': 'Drag here to add.',
    'icon': 'commands/add.svg'
  }; /*}}}*/
  this.placeholders.delete = { /*{{{*/
    'label': 'Delete',
    'desc': 'Delete.',
    'icon': 'commands/delete.svg'
  }; /*}}}*/
  this.placeholders.bunny = { /*{{{*/
    'label': 'Bunny',
    'desc': 'I am Bunny. Algo Bunny.',
    'icon': 'assets/start.svg'
  }; /*}}}*/

  /*------------------------*/

  this.tiles.normal = { /*{{{*/
    'locations': [
      'assets/tile1.svg',
      'assets/tile2.svg',
      'assets/tile3.svg',
      'assets/tile4.svg'
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

  /*------------------------*/

  this.commands.forward = { /*{{{*/
    'type': 'simple',
    'label': 'Forward',
    'desc': 'I take a step in the direction I am facing. I hope I don\'t fall into a hole, step on a carrot or a flower.',
    'icon': 'commands/forward.svg'
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

  this.commands.loop = { /*{{{*/
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
  this.commands.if_same = { /*{{{*/
    'type': 'complex_two',
    'label': 'Check If Equal',
    'desc': 'I check if the carrot I hold is the same size as the carrot (or flower) in front of me ...<p>... unless I memorized something in my big brain - then I always compare the number I memorized.',
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
    'desc': 'I check if the carrot I hold is smaller than the carrot (or flower) in front of me ...<p>... unless I memorized syyomething in my big brain - then I always compare the number I memorized.',
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
    'desc': 'I check if the carrot I hold is bigger than the carrot (or flower) in front of me ...<p> ... unless I memorized syyomething in my big brain - then I always compare the number I memorized.',
    'icon': 'commands/if_bigger.svg',
    'first': 'commands/if_bigger/top.svg',
    'first_icon': 'commands/if_bigger/y.svg',
    'middle': 'commands/if_bigger/middle.svg',
    'second': 'commands/if_bigger/else.svg',
    'second_icon': 'commands/if_bigger/n.svg',
    'end': 'commands/if_bigger/end.svg'
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
    'label': 'Memorize Flower Size or Jump',
    'desc': 'I memorize the flower in front of me.<p>If it\'s a red flower I memorize its size. If it\'s a blue flower I immediately jump to the position it reminds me of.',
    'icon': 'commands/memorize_flower.svg'
  }; /*}}}*/

  this.commands.execute = { /*{{{*/
    'type': 'simple',
    'label': 'Do Something',
    'desc': 'I do something you told me to do.',
    'icon': 'commands/execute.svg'
  }; /*}}}*/
}
