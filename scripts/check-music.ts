import { NOTE_LEVELS, POLY_EXERCISES, RHYTHM_LEVELS, exerciseHits } from "../lib/music/catalog"
import { engrave } from "../lib/music/engrave"
import { diatonic, staffStep, toMidi } from "../lib/music/pitch"
import { barQuarters, generateBar, soundingQuarters, seededRandom, quarterSeconds } from "../lib/music/rhythm"
import { scoreTaps } from "../lib/music/score-taps"

import { randomReadingNote } from "../lib/music/reading"
import { validProgress } from "../lib/progress-validation"
import { EMPTY_PROGRESS } from "../lib/progress"

let failed = 0
let checks = 0

function check(name: string, ok: boolean) {
  checks++
  if (!ok) {
    failed += 1
    console.error("fail", name)
  }
}

check("middle C", toMidi({ step: "C", octave: 4 }) === 60)
check("F sharp", toMidi({ step: "F", octave: 4, accidental: "sharp" }) === 66)
check("treble middle C ledger", staffStep({ step: "C", octave: 4 }, "treble") === -2)
check("bass F3", staffStep({ step: "F", octave: 3 }, "bass") === 6)
check("diatonic roundtrip", diatonic({ step: "B", octave: 3 }) === 27)

for (const level of RHYTHM_LEVELS) {
  for (let index = 0; index < 200; index += 1) {
    for (const meter of level.meters) {
      const events = generateBar(level.durations, meter, level.rests, seededRandom(`${level.id}-${index}-${meter.beats}`))
      const total = events.reduce((sum, event) => sum + event.quarters, 0)
      const expected = barQuarters(meter)
      check(`${level.id} compasso completo`, Math.abs(total - expected) < 0.0001)
      check(`${level.id} figuras permitidas`, events.every(e => level.durations.includes(e.quarters)))
      if (!events.some((event) => !event.rest)) check(`${level.id} has a note`, false)
    }
  }
}

for (const exercise of POLY_EXERCISES) {
  const hits = exerciseHits(exercise)
  const expected = barQuarters(exercise.meter) * exercise.measures
  check(`${exercise.id} voice A`, Math.abs(hits.a.total - expected) < 0.02)
  check(`${exercise.id} voice B`, Math.abs(hits.b.total - expected) < 0.02)
  check(`${exercise.id} hits`, hits.a.hits.length > 0 && hits.b.hits.length > 0)
  const layout = engrave({
    clef: "treble",
    time: exercise.meter,
    notes: exercise.voices[0].notes,
    measureQuarters: exercise.measures > 1 ? barQuarters(exercise.meter) : null,
  })
  check(`${exercise.id} engraving`, layout.width > 40 && layout.height > 40 && layout.glyphs.length > 0)
}

const triplet = soundingQuarters({ duration: "q", tuplet: { actual: 3, normal: 2, group: "t" } })
check("triplet quarter", Math.abs(triplet - 2 / 3) < 0.001)

const score = scoreTaps([0, 1, 2], [0.02, 1.2, 2.01], 0.08)
check("tap score", score.onTime === 2 && score.accuracy < 1)

for (const level of NOTE_LEVELS) {
  for (let i = 0; i < 300; i++) {
    const note = randomReadingNote(level, null, seededRandom(`${level.id}-${i}`))
    const range = level.range[note.clef]!
    check('reading range ' + level.id, diatonic(note.written) >= diatonic(range.min) && diatonic(note.written) <= diatonic(range.max))
    check('reading clef ' + level.id, level.clefs.includes(note.clef))
    const layout = engrave({clef: note.clef, fifths: note.fifths, notes: [{pitch:note.written, accidental:note.written.accidental, duration:'q'}]})
    check('glyph bounds', layout.glyphs.every(g => g.y >= 0 && g.y < layout.height))
    check('head bounds', layout.heads.every(h => h.y > 0 && h.y < layout.height))
  }
}
check('do not steal next correct tap', scoreTaps([0,.1], [.075], .06).onTime === 1)
check('exact taps', scoreTaps([0,.5,1],[0,.5,1],.08).accuracy === 1)
check('silence', scoreTaps([0,.5],[],.08).accuracy === 0)
check('extras penalized', scoreTaps([0],[0,.5],.08).accuracy === .5)
check('double dotted quarter', soundingQuarters({duration:'q',dots:2}) === 1.75)
check('6/8 BPM', Math.abs(quarterSeconds(60,{beats:6,beatValue:8}) - 2/3) < 1e-9)
check('2/2 BPM', quarterSeconds(60,{beats:2,beatValue:2}) === .5)
check('valid backup', validProgress(structuredClone(EMPTY_PROGRESS)))
for (const invalid of [null,{}, {...structuredClone(EMPTY_PROGRESS),lastHref:'https://example.com'}, {...structuredClone(EMPTY_PROGRESS),notes:{...EMPTY_PROGRESS.notes,answered:'bad'}}]) check('reject damaged backup', !validProgress(invalid))

if (failed > 0) {
  console.error(`${failed} checks failed`)
  process.exit(1)
}

console.log(`${checks} verificações musicais e de dados: OK`)
