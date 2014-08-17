
var splitNote = require('./split_note')

module.exports = function processNote(callback) {
  return splitNote(function(notes, others) {
    return others.merge(callback(notes))
  })
}
