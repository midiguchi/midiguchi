
var M = require('./midi_util')
var processNote = require('./process_note')
var Bacon = require('baconjs')
var util = require('util')

module.exports = function mapNote(callback) {

  // If callback is an object, it may be a mapping...
  if (typeof callback == 'object') callback = createCallback(callback)

  // Process only notes...
  return processNote(function(notes) {

    // map hash key to note-ids
    var noteIds = { }, nextNoteId = 1

    // map note-ids to note-infos
    var table = { }

    // separate the "on" and "off" events
    var events = notes.map(toEvent)
    var on  = events.filter(function(event) { return event.on })
    var off = events.filter(function(event) { return !event.on })

    // now give them note-ids
    on = on.map(function(event) {
      var id = event.noteId = noteIds[event.hashKey] = nextNoteId++
      event.info.id = id
      return event
    })
    off = off.map(function(event) {
      var id = event.noteId = noteIds[event.hashKey]
      delete noteIds[event.hashKey]
      return event
    })

    // pass the note informations through the stream
    var out = callback(on.map(function(event) {
      var id = event.noteId
      table[id] = [ ]
      return event.info
    }))
    var outOnMidi = out.flatMap(function(info) {
      var id = info.id
      if (!table[id]) return Bacon.never()
      table[id].push(toMidi(info, false))
      return Bacon.once(toMidi(info, true))
    })
    var outOffMidi = off.flatMap(function(event) {
      var id = event.noteId
      if (!table[id]) return Bacon.never()
      var offMidiEvents = table[id]
      return Bacon.fromArray(offMidiEvents)
    })

    // finally! ahh!
    return outOnMidi.merge(outOffMidi)

  })

  function toEvent(midi) {
    var on = !(M.isNoteOff(midi) || M.velocity(midi) == 0)
    var key = M.channel(midi) + '-' + M.key(midi)
    var event = { on: on, hashKey: key }
    if (on) {
      event.info = {
        channel: M.channel(midi),
        key: M.key(midi),
        velocity: M.velocity(midi)
      }
    }
    return event
  }

  function toMidi(info, on) {
    return M.create.note(on, info.channel, info.key, info.velocity)
  }

}

function createCallback(object) {
  return function(stream) {
    return stream.map(function(note) {
      if (object[note.key]) note.key = object[note.key]
      return note
    })
  }
}

