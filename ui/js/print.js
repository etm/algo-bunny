document.addEventListener('contextmenu', event => event.preventDefault())

$(document).ready(async function() {
  let assets  = new Assets
  await assets.load()

  let editor = new Editor($('div.program svg'), assets, 'current')
  editor.render()

  $('button.load').click(ev=>{
    document.getElementById('loadinstructions').click()
  })
  $("input[name=loadinstructions]").change(ev=>{
    if (typeof window.FileReader !== 'function') {
      alert('FileReader not yet supportet')
      return
    }
    var files = $('#loadinstructions').get(0).files
    var reader = new FileReader()
    reader.onload = function(){
      editor.program = JSON.parse(reader.result)
      editor.render()
      document.getElementById('fuckchrome').reset()
      editor.get_pids().forEach(pid => {
        $('div.elements img[data-type=execute' + pid + ']').show()
      })
      $('div.field div.stats .cisc .value').text(editor.cisc_length())
    }
    reader.onerror = function(){ console.log('error reading file'); loading = false; }
    reader.onabort = function(){ console.log('abort reading file'); loading = false; }
    reader.readAsText(files[0])
  })
})
