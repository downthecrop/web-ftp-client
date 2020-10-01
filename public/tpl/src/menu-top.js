'use strict';
(function () {
  const $tpl = $('.template-menu-top')
  let systemStatus = null

  // interval to check for new version
  const getSystemStatus = function () {
    gl.socket.send('getSystemStatus', null, function (data) {
      if (data.latestVersion) {
        systemStatus = data
        $tpl.find('.version').text('v' + data.currentVersion)
      }
    })
  }()
  
  $tpl.on('click', '.theme-toggle', function () {
    gl.loadTheme(gl.storage.get('theme') === 'dark' ? 'light' : 'dark')
  }).on('display-about', function () {
    const $body = $('<div>')
    $body.append(gl.t('about.modal'))
    $body.append($('<h3>').text(gl.t('about.tools')))
    $body.append(
      $('<ul>')
        .append('<li><a href="http://getbootstrap.com" target="_blank" rel="nofollow">Bootstrap (Frontend Framework)</a>')
        .append('<li><a href="http://bootswatch.com" target="_blank" rel="nofollow">Bootswatch Themes</a>')
        .append('<li><a href="https://nodejs.org" target="_blank" rel="nofollow">NodeJS (Backend)</a>')
        .append('<li><a href="http://expressjs.com" target="_blank" rel="nofollow">ExpressJS (Http Server)</a>')
        .append('<li><a href="https://github.com/mscdex/node-ftp" target="_blank" rel="nofollow">Node FTP Client</a>')
        .append('<li><a href="https://github.com/mscdex/ssh2" target="_blank" rel="nofollow">Node SSH Client</a>')
        .append('<li><a href="https://github.com/typicode/lowdb" target="_blank" rel="nofollow">Lowdb Database</a>')
        .append('<li><a href="https://github.com/websockets/ws" target="_blank" rel="nofollow">Node Websocket</a>')
    )
    $body.append($('<h3>').text('Changelog'))
    $body.append($('<div class="changelog">').html(systemStatus.changelog))
    gl.modal(gl.t('about'), $body, null, function () {

    })
  })
})()