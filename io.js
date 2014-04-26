

var midi = require('midi')
var Bacon = require('baconjs')

function MidiPort(Port, Stream) {

  var out = { }

  function getPortNames(io) {
    var out = []
        count = io.getPortCount()
    for (var i = 0; i < count; i ++) {
      out.push(io.getPortName(i))
    }
    return out
  }
  
  Object.defineProperty(out, 'ports', {
    get: function() {
      var io = new Port()
      var out = getPortNames(io)
      io.closePort()
      return out
    }
  })

  out.open = function(number) {
    var port = new Port()
    if (typeof number == 'string') {
      var name = number
      number = getPortNames(port).indexOf(name)
      if (number == -1) throw new Error("Cannot find port: " + name)
    }
    port.openPort(number)
    return Stream(port)
  }
  
  out.virtual = function(name) {
    var port = new Port()
    port.openVirtualPort(name)
    return Stream(port)
  }

  return out

}

exports.input = MidiPort(midi.input, function InputEventStream(port) {
  return Bacon.fromBinder(function(sink) {
    function listener(deltaTime, message) {
      sink(new Bacon.Next(message))
    }
    port.on('message', listener)
    return function() {
      port.removeListener('message', listener)
      port.closePort()
    }
  })
})

exports.output = MidiPort(midi.output, function OutputBus(port) {
  var bus = new Bacon.Bus()
  bus.onValue(function(message) {
    port.sendMessage(message)
  })
  bus.onEnd(function() {
    port.closePort()
  })
  return bus
})












