
var splitNote = require('./split_note')

module.exports = function processNote(input, callback) {
  return splitNote(input, function(notes, others) {
    return others.merge(callback(notes))
  })
}
