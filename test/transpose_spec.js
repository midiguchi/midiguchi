
var Bacon = require('baconjs')
var assert = require('assert')
var inspect = require('util').inspect

function config(callback) {
  var input = new Bacon.Bus()
  var output = new Bacon.Bus()
  var queue = []
  output.onValue(queue, 'push')
  callback(input, output)
  return {
    in: function(message) {
      input.push(message)
      return this
    },
    out: function(expected, reason) {
      var actual = queue.shift()
      assert.deepEqual(actual, expected, reason +
        ' (' + inspect(actual) + ' should be ' + inspect(expected) + ')')
      return this
    },
    tap: function(fun) {
      fun()
      return this
    }
  }
}

var transpose = require('../').transpose

describe('transpose', function() {

  it('should transpose notes, and ignore other events', function() {
    config(function(input, output) {
      output.plug(transpose(input, 1))
    }).in([0x90, 0x40, 0x50])
      .out([0x90, 0x41, 0x50])
      .in([0x70, 0x41, 0x50])
      .out([0x70, 0x41, 0x50])
  })

  it('should release the right note after parameter has changed', function() {
    var transposition = new Bacon.Bus()
    config(function(input, output) {
      output.plug(transpose(input, transposition.toProperty(3)))
    }).in([0x90, 0x40, 0x50])
      .out([0x90, 0x43, 0x50])
      .tap(function() { transposition.push(12) })
      .in([0x90, 0x40, 0x00])
      .out([0x80, 0x43, 0x50], 'should turn off same note')
      .in([0x90, 0x40, 0x30])
      .out([0x90, 0x4C, 0x30], 'should turn on new note')
      .in([0x80, 0x40, 0x30])
      .out([0x80, 0x4C, 0x30], 'should turn off same note')
  })

})
