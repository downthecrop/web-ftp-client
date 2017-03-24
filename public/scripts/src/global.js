'use strict'

/**
 * The global object
 * @type {object}
 */
var gl = {}

/**
 * Show/Hide loading indicator
 * @param {boolean} flag
 */
gl.loading = function (flag) {
  $('.loader').toggleClass('hidden', !flag)
}

/**
 * Show a note message on top
 * @param {string} message
 * @param {string=} type
 * @param {number=} delay
 */
gl.note = function (message, type, delay) {
  if (delay === -1) delay = 99999999
  $.notify({
    'message': gl.t(message)
  }, {
    'type': typeof type === 'undefined' ? 'info' : type,
    placement: {
      from: 'top',
      align: 'center'
    },
    'delay': delay || 5000
  })
}

/**
 * Get depth object value, write like foo[bar][etc]
 * @param {object} object
 * @param {string} key
 * @returns {*|undefined}
 */
gl.getObjectValue = function (object, key) {
  var spl = key.split('[')
  var o = object
  for (var i = 0; i < spl.length; i++) {
    var keySplit = spl[i].replace(/\]$/g, '')
    if (typeof o[keySplit] === 'undefined') return undefined
    o = o[keySplit]
  }
  return o
}

$(function () {
  if (typeof window.WebSocket === 'undefined') {
    gl.note('Your browser is not supported in this application (Outdated Browser). Please upgrade to the newest version')
    return
  }
  var body = $('body')
  var hasTouch = ('ontouchstart' in window || (typeof window.DocumentTouch !== 'undefined' && document instanceof window.DocumentTouch)) === true
  body.addClass(hasTouch ? 'no-touch' : 'touch')

  // bind tooltips
  $(document).tooltip({
    'selector': '[data-tooltip]',
    'container': 'body',
    'html': true,
    'title': function () {
      return gl.t($(this).attr('data-tooltip'))
    }
  }).on('inserted.bs.tooltip', function (ev) {
    // hide if we are on mobile touch device
    if (hasTouch) {
      setTimeout(function () {
        $(ev.target).trigger('mouseout')
      }, 1000)
    }
  })

  // replace language html placeholders
  gl.lang.replaceInHtml(body)

  // template load trigger
  $(document).on('click', '.template-load-trigger[data-template]', function () {
    gl.tpl.loadInto($(this).attr('data-template'), $(this).attr('data-container'))
  })

  // tab delete trigger
  $(document).on('click', '.splitbox-tabs .glyphicon-remove', function (ev) {
    ev.stopPropagation()
    gl.splitbox.tabDelete($(this).closest('li'))
  })

  // tab load trigger
  $(document).on('click', '.tab-load-trigger[data-template]', function () {
    gl.splitbox.tabAdd($(this).attr('data-template')).trigger('click')
  })

  // tab click trigger
  $(document).on('click', '.splitbox-tabs li', function (ev) {
    ev.preventDefault()
    gl.splitbox.tabClick($(this))
  })

  // socket connection
  gl.socket.connect(function () {
    gl.socket.send('initializeFrontend', {
      'loginData': {
        'id': gl.storage.get('login.id'),
        'hash': gl.storage.get('login.hash')
      }
    }, function (data) {
      if (!data) {
        gl.tpl.loadInto('login', '#wrapper', function () {
          gl.loading(false)
        })
      } else {
        gl.tpl.loadInto('main', '#wrapper', function () {
          gl.loading(false)
        })
      }
    })
  })
})