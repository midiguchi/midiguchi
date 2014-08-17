
var M = require('./midi_util')
var mapNote = require('./map_note')

module.exports = function transpose(transposition) {
  return mapNote(function(notes) {
    return notes.zip(notes.map(transposition), function(note, add) {
      note.key += add
      return note
    })
  })
}


