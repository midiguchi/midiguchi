
var M = require('./midi_util')
var Bacon = require('baconjs')
var util = require('util')

module.exports = function transpose(input, callback, properties) {

  // For any properties to sample...
  properties = properties || []
  properties = properties.map(function(property) {
    return input.map(property)
  })

  // If callback is an object, it may be a mapping...
  if (typeof callback == 'object') callback = createCallback(callback)

  // A table of mapping from input note to output notes.
  var table = { }

  return Bacon.zipWith([input].concat(properties), function(event) {
    if (M.isNoteOn(event) || M.isNoteOff(event)) {
      return handle.apply(null, arguments)
    }
    return [event]
  }).flatMap(Bacon.fromArray)

  function handle(event) {

    var on = !(M.isNoteOff(event) || M.velocity(event) == 0)
    var key = M.channel(event) + '-' + M.key(event)

    var result

    if (on) {
      var input = {
            channel: M.channel(event),
            key: M.key(event),
            velocity: M.velocity(event)
          }
      result = callback.apply(null, [input].concat([].slice.call(arguments, 1)))
      if (!result) result = input
      if (!util.isArray(result)) result = [result]
      table[key] = result
    } else {
      result = table[key]
      delete table[key]
      if (!result) result = []
    }

    return toEvents(result, on)

  }

  function toEvents(result, on) {
    return result.map(function(note) {
      return M.create.note(on, note.channel, note.key, note.velocity)
    })
  }

}

function createCallback(object) {
  return function(note) {
    if (object[note.key]) note.key = object[note.key]
  }
}











