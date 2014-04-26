
var M = require('./midi_util')

function isNotNote(event) { return !M.isNote(event) }

module.exports = function splitNote(input, callback) {
  return callback(input.filter(M.isNote), input.filter(isNotNote))
}
