'use strict';
(function () {
  const $tpl = $('.template-settings')

  const form = {
    'transfer_max': {
      'type': 'number',
      'label': 'transfer.max',
      'description': 'transfer.max.description',
      'defaultValue': 3
    }
  }

  const loadForm = function () {
    gl.socket.send('getSettings', null, function (settings) {
      const $form = $tpl.find('.form')
      $form.html('')
      gl.form.create($form, 'settings', form, function (formData) {
        gl.socket.send('saveSettings', formData, function () {
          gl.note(gl.t('saved'), 'success')
        })
      }, function () {
        loadForm()
      }, settings)
    })
  }
  loadForm()

  $tpl.on('click', '.theme-toggle', function () {
      console.log("clicked")
    gl.loadTheme(gl.storage.get('theme') === 'dark' ? 'light' : 'dark')
  })

})()
