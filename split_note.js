
var M = require('./midi_util')

function isNotNote(event) { return !M.isNote(event) }

module.exports = function splitNote(callback) {
  return function(input) {
    return callback(input.filter(M.isNote), input.filter(isNotNote))
  }
}
