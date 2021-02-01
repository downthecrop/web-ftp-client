    'use strict';
(function () {
    const $tpl = $('.template-serverbrowser')
    var hiddenFlag = false
    const tabParams = gl.splitbox.tabActive.data('params')
    const $contextmenuLocal = $tpl.find('.contextmenu')
    const $contextmenuServer = $contextmenuLocal.clone()
    const $contextmenuBoth = $contextmenuLocal.clone()
    const $local = $tpl.children('.local')
    const $localDirectoryInput = $local.find('.input-directory input')
    const $server = $tpl.children('.server')
    const $serverDirectoryInput = $server.find('.input-directory input')

    // contextmenu build
    $tpl.append($contextmenuServer).append($contextmenuBoth)
    $contextmenuLocal.attr('data-id', 'local').find('.download, .download-queue').remove()
    $contextmenuServer.attr('data-id', 'server').find('.upload, .upload-queue').remove()
    $contextmenuBoth.attr('data-id', 'both').find('.entry').not('.create-directory').remove()

    const $contextmenu = $([$contextmenuLocal[0], $contextmenuServer[0], $contextmenuBoth[0]])

    const delta = 6;
    let currentX;
    let currentY;
    let drag = false
    var checkMouse;

    document.addEventListener('mousedown', function (event) {
        if (event.target.id === "dragable") {
            //Set Active to the clicked td element/span parent td
            if (event.target.tagName == "SPAN") {
                event.path[2].className += " active"
            } else {
                event.path[1].className += " active"
            }
            checkMouse = setInterval(clickOrDrag, 100, event);
        }
    });

    document.addEventListener('mousemove', (event) => {
        currentX = event.pageX
        currentY = event.pageY
    });

    function clickOrDrag(event) {
        let diffX = Math.abs(currentX - event.pageX);
        let diffY = Math.abs(currentY - event.pageY);

        if (diffX < delta && diffY < delta) {
            console.log("click")
            drag = false
        }
        else {
            console.log("drag")
            drag = true
        }
    }

    document.addEventListener('mouseup', function (event) {
        console.log(event.path)
        console.log(event.path[0].className)
        if (drag && (event.path[2].className === "entry"
            || event.path[1].className === "entry"
            || event.path[0].className === "right server")) {
            drag = false
            let elm

            //Tag mouse up element to get its file data
            if (event.target.tagName == "SPAN") {
                event.path[2].className += " dest"
                elm = 2
            } else if (event.path[1].className === "entry") {
                event.path[1].className += " dest"
                elm = 1
            }
            
            if (event.path[0].className != "right server"){
                let dragDest = $tpl.find("tr.entry.dest")
            }
            
            //console.log(dragDest.data('file'))

            let selected = $tpl.find("tr.entry.active")

            let files = []
            selected.each(function () {
                files.push($(this).data('file'))
            })

            gl.modalConfirm(gl.t('confirm.drag.files'), function (result) {
                if (result === true) {
                    gl.socket.send('addToTransferQueue', {
                        'localDirectory': $localDirectoryInput.val(),
                        'serverDirectory': $serverDirectoryInput.val(),
                        'files': files,
                        'mode': "upload",
                        'server': tabParams.server,
                        'recursive': true,
                        'forceTransfer': 1,
                        'filter': null,
                        'flat': null,
                        'replace': 'never'
                    })
                }
            })
            
        }
        clearInterval(checkMouse)
    })

    /**
     * Build the files into the given container
     * @param {string} type
     * @param {jQuery} $container
     * @param {[]} files
     */
    const truncate = (input) => input.length > 15 ? `${input.substring(0, 15)}...` : input;
    const buildFilelist = function (type, $container, files) {
        $container.html('')
        const $table = $tpl.find('.boilerplate.table-files').clone()
        $table.attr('data-id', type)
        const $tbody = $table.find('tbody')
        $table.removeClass('boilerplate')
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const mtime = new Date(file.mtime)
            const $tr = $table.find('tbody .boilerplate').clone()
            $tr.removeClass('boilerplate')
            let icon = (file.isDirectory ? 'directory' : 'file')
            $tr.find('.name').attr('data-sortvalue', (file.isDirectory ? 'a' : 'b') + file.filename)
            $tr.find('.name .icon').addClass('icon-' + icon)
            $tr.find('.name .text').text(truncate(file.filename))
            $tr.find('.name .text').attr('title', file.filename)
            $tr.find('.size').text(gl.humanFilesize(file.size)).attr('data-sortvalue', file.size)
            $tr.find('.permissions').text(file.permissions)
            $tr.find('.mtime').text(mtime.toLocaleString()).attr('data-sortvalue', mtime.getTime())
            $tbody.append($tr)
            $tr.data('file', file)
        }
        $container.append($table)
        $table.find('table').tablesorter({
            textExtraction: function (node) {
                let n = $(node)
                return (n.attr('data-sortvalue') || n.text()).toLowerCase()
            },
            'sortList': [[0, 0]]
        })
        $table.on('dblclick', 'tbody tr', function (ev) {
            ev.stopPropagation()
            if (type === 'local') {
                loadLocalDirectory($(this).data('file').path)
            }
            if (type === 'server') {
                loadServerDirectory($(this).data('file').path)
            }
        }).on('dblclick', '.directory-parent', function (ev) {
            ev.stopPropagation()
            if (type === 'local') {
                let v = $localDirectoryInput.val()
                v = v.replace(/\\/g, '/')
                let spl = v.split('/')
                if (spl.length > 1) {
                    spl.pop()
                    v = spl.join('/')
                    if (!v.match(/\//)) {
                        v += '/'
                    }
                    loadLocalDirectory(v)
                }
            }
            if (type === 'server') {
                let v = $serverDirectoryInput.val()
                let spl = v.split('/')
                if (spl.length > 1) {
                    spl.pop()
                    v = spl.join('/')
                    if (!v.length) {
                        v = '/'
                    }
                    loadServerDirectory(v)
                }
            }
        })
    }
    /**
     * Load a local directory
     * @param {string} directory
     */
    const loadLocalDirectory = function (directory) {
        gl.socket.send('getLocalFilelist', { 'server': tabParams.server, 'directory': directory }, function (data) {
            if (!data) {
                return
            }
            tabParams.localDirectory = data.currentDirectory
            if (hiddenFlag){
                let temp = []
                for (let i = 0; i < data.files.length; i += 1){
                    if(data.files[i].filename.charAt(0) != '.'){
                        temp.push(data.files[i])
                    }
                }
                data.files = temp
            }
            gl.splitbox.tabSave()
            $localDirectoryInput.val(data.currentDirectory)
            buildFilelist('local', $local.find('.files'), data.files)
        })
    }

    /**
     * Load server directory
     * @param {string} directory
     */
    const loadServerDirectory = function (directory) {
        gl.socket.send('getFtpFilelist', { 'server': tabParams.server, 'directory': directory }, function (data) {
            if (!data) {
                return
            }
            if (hiddenFlag){
                let temp = []
                for (let i = 0; i < data.files.length; i += 1){
                    if(data.files[i].filename.charAt(0) != '.'){
                        temp.push(data.files[i])
                    }
                }
                data.files = temp
            }
            tabParams.serverDirectory = data.currentDirectory
            gl.splitbox.tabSave()
            $serverDirectoryInput.val(data.currentDirectory)
            buildFilelist('server', $server.find('.files'), data.files)
        })
    }

    $localDirectoryInput.on('keyup', function (ev) {
        if (ev.key === 'Enter') {
            loadLocalDirectory(this.value)
        }
    })

    document.addEventListener('keydown', function(ev){
        if(ev.getModifierState("Control") && ev.key === 'h'){
            console.log("Control + H")
            hiddenFlag = !hiddenFlag
            if ($localDirectoryInput.val() != '')
                loadLocalDirectory($localDirectoryInput.val())
            if ($serverDirectoryInput.val() != '')
                loadServerDirectory($serverDirectoryInput.val())
        }
    })

    $serverDirectoryInput.on('keyup', function (ev) {
        if (ev.key === 'Enter') {
            loadServerDirectory(this.value)
        }
    })

    // bind to listen for some events
    gl.socket.bind(function (message) {
        let func = null
        let currentDir = null
        let update = false
        if (message.action === 'server-directory-update') {
            func = loadServerDirectory
            currentDir = $serverDirectoryInput.val()
        }
        if (message.action === 'local-directory-update') {
            func = loadLocalDirectory
            currentDir = $localDirectoryInput.val()
        }
        if (func) {
            for (let i = 0; i < message.message.messages.length; i++) {
                if (message.message.messages[i].directory === currentDir) {
                    update = true
                    break
                }
            }
            if (update) func(currentDir)
        }
    })

    $contextmenu.on('click', '.download, .download-queue, .upload, .upload-queue', function (ev) {
        const $currentCm = $(this).closest('.contextmenu')
        const $selectedFiles = $tpl.find('.' + $currentCm.attr('data-id')).find('tr.active')
        let files = []
        $selectedFiles.each(function () {
            files.push($(this).data('file'))
        })
        let filter = $currentCm.find('.filter input').val().trim()
        if (!filter.length) {
            filter = null
        }
        console.log($(this).attr('data-mode'))
        console.log($currentCm.find('.replace select').val())
        gl.socket.send('addToTransferQueue', {
            'localDirectory': $localDirectoryInput.val(),
            'serverDirectory': $serverDirectoryInput.val(),
            'files': files,
            'mode': $(this).attr('data-mode'),
            'server': tabParams.server,
            'recursive': true,
            'forceTransfer': $(this).attr('data-forceTransfer') === '1',
            'filter': filter,
            'flat': $currentCm.find('.flat select').val() === '1' ? '1' : null,
            'replace': $currentCm.find('.replace select').val()
        })
    }).on('click', '.remove', function (ev) {
        ev.stopPropagation()
        const $selectedFiles = $tpl.find('.' + $(this).closest('.contextmenu').attr('data-id')).find('tr.active')
        let files = []
        $selectedFiles.each(function () {
            files.push($(this).data('file'))
        })
        const params = {
            'mode': $(this).closest('.contextmenu').attr('data-id'),
            'files': files,
            'serverId': tabParams.server
        }
        gl.modalConfirm(gl.t('confirm.delete.files'), function (result) {
            if (result === true) {
                gl.socket.send('removeFiles', params, function () {
                    if (params.mode === 'local') {
                        loadLocalDirectory($localDirectoryInput.val())
                    }
                    if (params.mode === 'server') {
                        loadServerDirectory($serverDirectoryInput.val())
                    }
                })
            }
        })
    }).on('click', '.filter, .flat', function (ev) {
        ev.stopPropagation()
    }).on('click', '.replace', function (ev) {
        ev.stopPropagation()
    }).on('click', '.create-directory', function (ev) {
        ev.stopPropagation()
        const contextmenuId = $(this).closest('.contextmenu').attr('data-id')
        const $body = $('<div>')
        const directory = $tpl.find('.' + contextmenuId).find('.input-directory input').val()
        $body.append('<input type="text" class="form-control" data-translate-property="placeholder,create.directory.placeholder">')
        gl.modalConfirm($body, function (result) {
            if (result === true) {
                const v = $body.find('input').val()
                const params = {
                    'directoryName': v,
                    'type': contextmenuId,
                    'directory': directory,
                    'serverId': tabParams.server
                }
                gl.socket.send('createDirectory', params, function () {
                    if (params.type === 'local') {
                        loadLocalDirectory(params.directory)
                    }
                    if (params.type === 'server') {
                        loadServerDirectory(params.directory)
                    }
                })
            }
        })
    })

    $(document).on('contextmenu', '.server, .local', function (ev) {
        ev.stopPropagation()
        ev.preventDefault()
        $contextmenuBoth.attr('data-id', $(this).attr('data-id'))
        gl.showContextmenu($contextmenuBoth, ev)
    })

    loadServerDirectory(tabParams.serverDirectory)
    loadLocalDirectory(tabParams.localDirectory)
})()
