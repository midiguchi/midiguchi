
var M = require('./midi_util')
var mapNote = require('./map_note')

module.exports = function transpose(input, transposition) {
  return mapNote(input, function(note, add) {
    note.key += add
  }, [transposition])
}


