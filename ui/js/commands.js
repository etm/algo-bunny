function Commands() {
  var self = this;

  this.items = {};
  this.placeholders = {};

  function load_svg(url,item,i) {
    return $.ajax({
      type: "GET",
      dataType: "xml",
      url: url
    }).then(function(res) {
      item[i] = $(res.documentElement).find('> g');
    });
  }

  this.load = function() { //{{{
    let promises = [];
    _.each(self.placeholders,(item) => {
        item.graphics = {};
        promises.push(load_svg(item.icon,        item.graphics, "icon"       ));
    });
    _.each(self.items,(item) => {
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

  this.items.forward = { /*{{{*/
    'type': 'simple',
    'label': 'Forward',
    'desc': 'I take a step in the direction I am facing. I hope I don\'t fall into a hole, step on a carrot or a flower.',
    'icon': 'commands/forward.svg'
  }; /*}}}*/
  this.items.left = { /*{{{*/
    'type': 'simple',
    'label': 'Turn Left',
    'desc': 'I turn left.',
    'icon': 'commands/left.svg'
  }; /*}}}*/
  this.items.right = { /*{{{*/
    'type': 'simple',
    'label': 'Turn Right',
    'desc': 'I turn right.',
    'icon': 'commands/right.svg'
  }; /*}}}*/
  this.items.step_left = { /*{{{*/
    'type': 'simple',
    'label': 'Sidestep Left',
    'desc': 'I take a step to the left without turning.',
    'icon': 'commands/step_left.svg'
  }; /*}}}*/
  this.items.step_right = { /*{{{*/
    'type': 'simple',
    'label': 'Sidestep Right',
    'desc': 'I take a step to the right without turning.',
    'icon': 'commands/step_right.svg'
  }; /*}}}*/
  this.items.jump = { /*{{{*/
    'type': 'position',
    'label': 'Jump',
    'desc': 'I jump to a position on the field. After placing this command, drag a tile onto it to set the position.',
    'icon': 'commands/jump.svg'
   }; /*}}}*/
  this.items.jump_back = { /*{{{*/
    'type': 'simple',
    'label': 'Jump Back',
    'desc': 'I jump to the origin of the last jump. I automatically remember my last jump, because jumps are exiting.',
    'icon': 'commands/jump.svg'
   }; /*}}}*/

  this.items.get_carrot = { /*{{{*/
    'type': 'simple',
    'label': 'Get Carrot',
    'desc': 'I pick up the delicious carrot from in front of me - and hold it.',
    'icon': 'commands/get_carrot.svg'
  }; /*}}}*/
  this.items.put_carrot = { /*{{{*/
    'type': 'simple',
    'label': 'Plant Carrot',
    'desc': 'I plant the carrot I hold in front of me (if there is space).<p>If there is already a carrot in front of me I swap it with the one I am holding.',
    'icon': 'commands/put_carrot.svg'
  }; /*}}}*/
  this.items.put_flower = { /*{{{*/
    'type': 'simple',
    'label': 'Plant Flower',
    'desc': 'I plant a flower in front of me (if there is space).<p>A red flower reminds me of memorized number. A blue flower reminds me of a memorized position on the field.',
    'icon': 'commands/put_flower.svg'
  }; /*}}}*/
  this.items.eat_carrot = { /*{{{*/
    'type': 'simple',
    'label': 'Eat Carrot',
    'desc': 'I eat the carrot I hold or the one in front of me.',
    'icon': 'commands/eat_carrot.svg'
  }; /*}}}*/
  this.items.eat_flower = { /*{{{*/
    'type': 'simple',
    'label': 'Eat Flower',
    'desc': 'I eat the flower in front of me.',
    'icon': 'commands/eat_flower.svg'
  }; /*}}}*/

  this.items.loop = { /*{{{*/
    'type': 'complex_one',
    'label': 'Repeat',
    'desc': 'I do something repeatedly. Please tell me when to stop.',
    'icon': 'commands/loop.svg',
    'first': 'commands/loop/top.svg',
    'first_icon': 'commands/loop/y.svg',
    'middle': 'commands/loop/middle.svg',
    'end': 'commands/loop/end.svg'
  }; /*}}}*/
  this.items.break = { /*{{{*/
    'type': 'simple',
    'label': 'Stop',
    'desc': 'I stop doing what i was repeatedly doing.',
    'icon': 'commands/break.svg'
  }; /*}}}*/

  this.items.if_carrot = { /*{{{*/
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
  this.items.if_empty = { /*{{{*/
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
  this.items.if_flower = { /*{{{*/
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
  this.items.if_hole = { /*{{{*/
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
  this.items.if_same = { /*{{{*/
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
  this.items.if_smaller = { /*{{{*/
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
  this.items.if_bigger = { /*{{{*/
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

  this.items.memorize_carrot = { /*{{{*/
    'type': 'simple',
    'label': 'Memorize Carrot Size',
    'desc': 'I memorize the size of the carrot in front of me.',
    'icon': 'commands/memorize_carrot.svg'
  }; /*}}}*/
  this.items.memorize_steps = { /*{{{*/
    'type': 'simple',
    'label': 'Memorize Steps or Reset',
    'desc': 'I memorize the number of steps I will take from now on.',
    'icon': 'commands/memorize_steps.svg'
  }; /*}}}*/
  this.items.memorize_position = { /*{{{*/
    'type': 'simple',
    'label': 'Memorize Position',
    'desc': 'I memorize my current position.',
    'icon': 'commands/memorize_position.svg'
  }; /*}}}*/
  this.items.memorize_flower = { /*{{{*/
    'type': 'simple',
    'label': 'Memorize Flower Size or Jump',
    'desc': 'I memorize the flower in front of me.<p>If it\'s a red flower I memorize its size. If it\'s a blue flower I immediately jump to the position it reminds me of.',
    'icon': 'commands/memorize_flower.svg'
  }; /*}}}*/

  this.items.execute = { /*{{{*/
    'type': 'simple',
    'label': 'Do Something',
    'desc': 'I do something you told me to do.',
    'icon': 'commands/execute.svg'
  }; /*}}}*/
}
