'use strict'

const path = require('path')
const db = require(path.join(__dirname, '../db'))

const action = {}

/**
 * Require user
 * @type {boolean}
 */
action.requireUser = true

/**
 * Execute the action
 * @param {WebSocketUser} user
 * @param {*} message
 * @param {function} callback
 */
action.execute = function (user, message, callback) {
    db.get('splitboxtabs').get('tabs').set(user.userData.id, message).write()
    callback()
}

module.exports = action
