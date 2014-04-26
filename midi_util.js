
function check(count, callback) {
  return function(event) {
    if (event.length == count) return callback.apply(null, event)
    return false
  }
}

exports.isNoteOff = check(3, function(a, b, c) { return (a & 0xF0) == 0x80 })
exports.isNoteOn  = check(3, function(a, b, c) { return (a & 0xF0) == 0x90 })

exports.channel  = function(event) { return event[0] & 0x0F }
exports.key      = function(event) { return event[1] }
exports.velocity = function(event) { return event[2] }


