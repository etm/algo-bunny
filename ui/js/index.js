function fs() {
  var element = document.documentElement;
  if      (element.requestFullscreen)       element.requestFullscreen();
  else if (element.mozRequestFullScreen)    element.mozRequestFullScreen();
  else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
  else if (element.msRequestFullscreen)     element.msRequestFullscreen();
}

$(document).ready(()=>{
  $('form').submit(false)
  if ($.cookie('username')) {
    $('input').val($.cookie('username'))
  }
  if ($.cookie('language') === undefined) {
    if (navigator.language == 'en' || navigator.language == 'de') {
      $.cookie('language',navigator.language,{ expires : 365, path: "/;SameSite=Lax", secure: true})
      document.location = 'index_' + navigator.language + '.html'
    }
  }
  $('.language a').click((e)=>{
    $.cookie('language',$(e.target).attr('lang'),{ expires : 365, path: "/;SameSite=Lax", secure: true})
  })
  $('button').click(()=>{
    let assets  = new Assets
    let name = $('input').val()
    assets.say($('div.speech').attr('data-prefix') + name,$('div.speech'))
    $.cookie('username',name,{ expires : 365, path: "/;SameSite=Lax", secure: true})
  })
})
