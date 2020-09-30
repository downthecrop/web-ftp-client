'use strict';
(function () {
  const $box = $('.template-login .box')
  gl.socket.send('getSystemStatus', null, function (data) {
    if (!data.installed) {
      $box.find('.well').toggleClass('hidden')
    }
  })
  const $form = gl.form.create($box.children('.form'), 'login', {
    'username': {'type': 'text', 'label': 'username', 'required': false},
    'password': {'type': 'password', 'label': 'password', 'required': false},
    'remember': {'type': 'switch', 'label': 'login.remember'}
  }, 
  function (formData) {
    gl.socket.send('loginFormSubmit', formData, function (userData) {
      if (!userData) {
        gl.note('login.failed', 'danger')
      } else {
        gl.userData = userData
        gl.storage.set('login.id', userData.id, !formData.remember)
        gl.storage.set('login.hash', userData.loginHash, !formData.remember)
        gl.tpl.loadInto('main', '#wrapper')
      }
    })
  })
  $form.find('input.form-control').val('admin')
  $form.find('.submit-form').click()
})()