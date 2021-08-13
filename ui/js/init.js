var one_liners = [
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
  "They call it carotte witch cheese.",
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
  "A Carrot, for lack of a better word, is good.",
  "As God is my witness, I'll never be hungry again.",
  "Carrots, my dear Watson.",
  "Soylent Orange is carrots.",
  "My carrot!",
  "I feel the need, the need for carrots.",
  "Carpe diem. Seize the carrot. Make your lives extraordinary.",
  "A million carrots isn't cool. You know what's cool? A billion carrots."
];

$(document).ready(async function() {
  let commands  = new Commands;
  await commands.load();

  let restrictions = [];

  $('div.elements img').each((_,ele) => {
    let iname = $(ele).attr('data-type');
    let item = commands.items[iname];
    $(ele).attr('title',item.label);
    if (restrictions.length == 0) {
      $(ele).show();
    } else {
      if (restrictions.includes(iname)) {
        $(ele).show();
      }
    }
  });

  let editor = new Editor($('div.program svg'), commands);
  editor.render();


  let one_liner = one_liners[Math.floor(Math.random()*one_liners.length)];
  $('div.speech').text(one_liner);
  $('div.speech').show();
  setTimeout(()=>{$('div.speech').hide();},5000);
   $
});

