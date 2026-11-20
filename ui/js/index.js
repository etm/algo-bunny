function fs() {
  var element = document.documentElement;
  if      (element.requestFullscreen)       element.requestFullscreen();
  else if (element.mozRequestFullScreen)    element.mozRequestFullScreen();
  else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
  else if (element.msRequestFullscreen)     element.msRequestFullscreen();
}

$(document).ready(()=>{
  $('form').submit(false)
  if (!Cookies.get('username')) {
    Cookies.set('username', $('input').val());
  }
  if (!Cookies.get('userid')) {
    Cookies.set('userid', $UUID(), { expires : 365, path: '/', sameSite: 'Lax', secure: true});
  }
  if (Cookies.get('username')) {
    $('input').val(Cookies.get('username'))
  }
  if (Cookies.get('language') === undefined) {
    if (navigator.language == 'en' || navigator.language == 'de') {
      Cookies.set('language',navigator.language,{ expires : 365, path: '/', sameSite: 'Lax', secure: true})
      document.location = 'index_' + navigator.language + '.html'
    }
  }
  $('.language a').click((e)=>{
    Cookies.set('language',$(e.target).attr('lang'),{ expires : 365, path: '/', sameSite: 'Lax', secure: true})
  })
  $('.instructor a').click((e)=>{
    let assets = new Assets
    let popups = (Cookies.get('popups') == 'off') ? 'on' : 'off'
    Cookies.set('popups',popups,{ expires : 365, path: '/', sameSite: 'Lax', secure: true})
    let instructor = (popups == 'off') ? 'on' : 'off'
    assets.say($(e.target).attr(instructor == 'on' ? 'data-say-on' : 'data-say-off'),$('div.speech'))
  })
  $('button').click(()=>{
    let assets  = new Assets
    let name = $('input').val()
    assets.say($('div.speech').attr('data-prefix') + name,$('div.speech'))
    Cookies.set('username',name,{ expires : 365, path: '/', sameSite: 'Lax', secure: true})
    $.ajax({
      type: 'POST',
      url: 'save_username.php'
    });
  })
})
