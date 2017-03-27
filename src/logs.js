'use strict'

const db = require('./db')

const logs = {}

/**
 * Get all log messages
 * @return []
 */
logs.get = function () {
  const logs = db.get('logs').cloneDeep().value()
  if (!logs.messages) {
    return []
  }
  return logs.messages
}

/**
 * Log a message
 * @param {string} server
 * @param {string} message
 * @param {object=} params
 * @param {string=} type
 */
logs.log = function (server, message, params, type) {
  const logsDb = db.get('logs').cloneDeep().value()
  if (!logsDb.messages) {
    logsDb.messages = []
  }

  logsDb.messages = logsDb.messages.slice(-100)
  const msg = {
    'server': server,
    'time': new Date(),
    'message': message,
    'params': params,
    'type': type || 'info'
  }
  logsDb.messages.push(msg)
  db.get('logs').set('messages', logsDb.messages).write()
  // send to all listeners
  for (let i = 0; i < logs.listeners.length; i++) {
    logs.listeners[i].send('log', msg)
  }
}

/**
 * Log an error message
 * @param {string} server
 * @param {Error} err
 */
logs.logError = function (server, err) {
  logs.log(server, err.message, null, 'error')
}

/**
 * The websocket users that listen for new log messages
 * @type {WebSocketUser[]}
 */
logs.listeners = []

module.exports = logs
