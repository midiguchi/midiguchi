
Midiguchi
=========

Midiguchi is a library to let you route and modify MIDI messages
in a very flexible way, thanks to [Bacon.js][].

It's inspired by [Midipipe](http://www.subtlesoft.square7.net/)
but more hacker-friendly.


Usage and Examples
------------------

```coffeescript
midi = require('midiguchi')
```

### List Input and Output Ports

```coffeescript
console.log(midi.input.ports)
console.log(midi.output.ports)
```


### MIDI Input Stream

A MIDI Input Stream is a Bacon.js EventStream from a MIDI port.
It will emit MIDI events.

```coffeescript
input = midi.input.open('nanoKEY2 KEYBOARD')
input = midi.input.open(0)
input = midi.input.virtual('Virtual Input Name')
```

This will log the MIDI messages sent from your keyboard:

```coffeescript
midi.input.open('nanoKEY2 KEYBOARD').log()

###
[ 144, 72, 76 ]
[ 128, 72, 64 ]
[ 144, 76, 80 ]
[ 128, 76, 64 ]
[ 144, 79, 127 ]
[ 128, 79, 64 ]
###
```


### MIDI Output Bus

A MIDI Output Bus is a Bacon.js Bus that you can plug EventStreams 

```coffeescript
output = midi.output.open('USB MIDI Interface')
output = midi.output.open(0)
output = midi.output.virtual('Virtual Input Name')
```


### MIDI Routing using Bus and EventStreams

This code will route MIDI events from my nanoKEY2 to my Chromatone.

```coffeescript
input = midi.input.open('nanoKEY2 KEYBOARD')
output = midi.output.open('USB MIDI Interface')
output.plug(input)
```


### Transposition

My nanoKEY2 cannot transpose notes.
But with Midiguchi this is very easy.

```coffeescript
midi = require('midiguchi')

input = midi.input.open('nanoKEY2 KEYBOARD')
transposed = midi.transpose(input, 3)

output = midi.output.open('USB MIDI Interface')
output.plug(transposed)
```

[transpose](transpose.js) is an example of a function.
It takes an EventStream
and returns another EventStream with transposed Note On/Off events.

You can plug it into the output, as before.



### Virtual Ports

According to [node-midi][]'s documentation,
you can open a virtual port to send MIDI messages into other applications.

As for me, I primarily use my MIDI keyboards with [MainStage][],
so I have to send the MIDI messages through a virtual output
and into MainStage's input.

```coffeescript
midi = require('midiguchi')

input = midi.input.open('nanoKEY2 KEYBOARD')
transposed = midi.transpose(input, 3)

output = midi.output.virtual('Midiguchi')
output.plug(transposed)
```


API
---

### Input and Output

```javascript
midi.input.ports
midi.input.open(number or name)
midi.input.virtual(name)

midi.output.ports
midi.output.open(number or name)
midi.output.virtual(name)
```


### midi.transpose(stream, transposition)

Returns a transposed version of the stream.
`transposition` can be a number or a Bacon.js Property.




[node-midi]: https://github.com/justinlatimer/node-midi
[baconjs]: https://github.com/baconjs/bacon.js
[MainStage]: http://www.apple.com/mainstage/



