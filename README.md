
Midiguchi
=========

Midiguchi is a library to let you route and modify MIDI messages
in a very flexible way, thanks to [Bacon.js][].

It's inspired by [Midipipe](http://www.subtlesoft.square7.net/)
but more hacker-friendly.


What you can do with it:
------------------------

* Log MIDI messages from your MIDI input device.
* Route MIDI messages from an input port to output port.
* Transpose notes from your keyboard before it hits your DAW.
* Combine multiple MIDI inputs into one output.
* Perform arbitrary MIDI message manipulations, or even generate them.



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


Remapping Notes
---------------

Some keyboards with buttons doesn't support note remapping.
You can use Midiguchi to remap them to any key you want.

```coffee
mapping =
  38: 36
  40: 38
  41: 40
  43: 50
  45: 48
  47: 47
  48: 45
  50: 43

output.plug(midi.mapNote(input, mapping))
```


You can also use a function to remap notes.
This will map every note to random notes.

```coffee
mapping = (note) ->
  # note :: { channel, key, velocity }
  note.key = 36 + Math.floor(Math.random() * 49)
  return note
```


You can also return an array of notes, and they will be played as a chord.

```coffee
mapping = ({ channel, key, velocity }) ->
  note = (add) -> { channel, key: key + add, velocity }
  return [note(0), note(4), note(7)]
```


### Processing Note Events Separately from Other Events

Midiguchi has a `midi.splitNote` function that will split one stream into two:
one with note events, and the other without.

This is useful if you want to create some kind of "delay" effect.

In this example, when you hit any note, after 40 milliseconds,
it will also play the same note in the next offset.

This is done by transposing and adding a delay, and merge with original notes stream:

```coffee
result = midi.splitNote(input, (notes, others) ->
  notes2 = midi.transpose(notes.delay(40), 12)
  Bacon.mergeAll(notes, notes2, others)
)
output.plug(result)
```


A delay effect. Whatever you play, it will play with lower velocity 400ms later, for 3 times:

```coffee
changeVelocity = (multiplier) -> (event) ->
  event.velocity *= multiplier
  return event

delay = (stream) ->
  midi.mapNote(stream.delay(400), changeVelocity(0.7))

result = midi.splitNote(input, (notes, others) ->
  delay1 = delay(notes)
  delay2 = delay(delay1)
  delay3 = delay(delay2)
  Bacon.mergeAll(notes, delay1, delay2, delay3, others)
)

output.plug(result)
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


### midi.mapNote(stream, mapping)

Returns a stream with notes remapped.

See: Remapping notes.


### midi.mapNote(stream, mapper(event, values...), properties)

Returns a stream with notes remapped. Instead of using a fixed mapping,
you can map them using an arbitrary function.

You can also send Bacon.js properties into `properties` parameter,
and the current value will be sampled into `mapper`'s `values` parameter.

See: Remapping notes.


### midi.splitNote(stream, callback(notes, others))

Separates the stream into two streams:

1. Stream of note events, `notes`, and
2. Stream of other events, `others`.

Then calls the callback function, and returns whatever that function returns.

Usually, you would modify the notes stream, and merge it back with the others.

See: Processing Note Events Separately


### midi.processNote(stream, callback(notes))

Just like `midi.splitNote` but does not pass `others` to the callback
and merges the `others` back automatically.


### M = require('midiguchi/midi_util')

A utility for dealing with MIDI events.

These functions checks if an event is a note on, off, or any note event:

* M.isNoteOn(event)
* M.isNoteOff(event)
* M.isNote(event)


These functions receives a note event, and determines its...

* M.channel(event)
* M.key(event)
* M.velocity(event)


This function constructs a MIDI note event from the arguments:

* M.create.note(on, channel, key, velocity)
    * If `on` is true, you get a Note On event.
    * If `on` is false, you get a Note Off event.







[node-midi]: https://github.com/justinlatimer/node-midi
[baconjs]: https://github.com/baconjs/bacon.js
[MainStage]: http://www.apple.com/mainstage/



