
var M = require('./midi_util')

module.exports = function transpose(input, transposition) {

  // A table of mapping between active notes to transposed notes.
  var table = { }

  return input.zip(input.map(transposition), function(event, transposition) {
    if (event.length == 3) {
      if (M.isNoteOn(event) || M.isNoteOff(event)) {
        return handle(event, transposition)
      }
    }
    return event
  })

  function handle(event, transposition) {

    var on = !(M.isNoteOff(event) && M.velocity(event) > 0)
    var key = M.channel(event) + '-' + M.key(event)
    var transposed = (M.key(event) + transposition) & 0x7F

    if (on) {
      table[key] = transposed
    } else {
      if (key in table) {
        transposed = table[key]
        delete table[key]
      }
    }

    return [event[0], transposed, event[2]]

  }

}


