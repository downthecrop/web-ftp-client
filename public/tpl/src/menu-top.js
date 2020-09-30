'use strict';
(function () {
  const $tpl = $('.template-menu-top')

  $tpl.on('click', '.update-available', function () {
    const $body = $('<div>').append(gl.t('update.available.modal', systemStatus, true))
    $body.append('<h3>Changelog</h3>').append($('<div class="changelog">').html(systemStatus.changelog))
    gl.modalConfirm($body, function (result) {
      if (result === true) {
        gl.note('coreupdate.started')
        gl.socket.send('doCoreUpdate', null, function (result) {
          if (result === true) {

          } else {
            gl.note('coreupdate.error')
          }
        })
      }
    })
  }).on('click', '.theme-toggle', function () {
    gl.loadTheme(gl.storage.get('theme') === 'dark' ? 'light' : 'dark')
  })
})()