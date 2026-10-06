export type HitVoice = "a" | "b" | "metro"

type Scheduled = AudioScheduledSourceNode

class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private live: Scheduled[] = []

  async unlock() {
    const ctx = this.context()
    if (ctx.state === "suspended") await ctx.resume()
    return ctx
  }

  context() {
    if (!this.ctx) {
      const ctx = new AudioContext()
      const master = ctx.createGain()
      master.gain.value = 0.85
      master.connect(ctx.destination)
      const length = Math.floor(ctx.sampleRate * 0.25)
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1
      this.ctx = ctx
      this.master = master
      this.noise = buffer
    }
    return this.ctx
  }

  now() {
    return this.context().currentTime
  }

  stopAll() {
    for (const node of this.live) {
      try {
        node.stop()
      } catch {
        /* already stopped */
      }
    }
    this.live = []
  }

  toneAt(midi: number, time: number, duration = 0.55) {
    const ctx = this.context()
    const master = this.master
    if (!master) return
    const start = Math.max(time, ctx.currentTime)
    const freq = 440 * 2 ** ((midi - 69) / 12)
    const osc = ctx.createOscillator()
    const overtone = ctx.createOscillator()
    const gain = ctx.createGain()
    const overtoneGain = ctx.createGain()
    osc.type = "triangle"
    overtone.type = "sine"
    osc.frequency.setValueAtTime(freq, start)
    overtone.frequency.setValueAtTime(freq * 2, start)
    overtoneGain.gain.value = 0.18
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.22, start + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(gain)
    overtone.connect(overtoneGain)
    overtoneGain.connect(gain)
    gain.connect(master)
    osc.start(start)
    overtone.start(start)
    osc.stop(start + duration + 0.03)
    overtone.stop(start + duration + 0.03)
    this.keep(osc)
    this.keep(overtone)
  }

  hitAt(time: number, voice: HitVoice) {
    const ctx = this.context()
    const master = this.master
    const noise = this.noise
    if (!master || !noise) return
    const start = Math.max(time, ctx.currentTime)
    const profile = {
      a: { freq: 1680, dur: 0.07, gain: 0.28, filter: 1900 },
      b: { freq: 640, dur: 0.09, gain: 0.32, filter: 900 },
      metro: { freq: 240, dur: 0.045, gain: 0.16, filter: 700 },
    }[voice]

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = voice === "b" ? "square" : "triangle"
    osc.frequency.setValueAtTime(profile.freq, start)
    osc.frequency.exponentialRampToValueAtTime(Math.max(80, profile.freq * 0.45), start + profile.dur)
    gain.gain.setValueAtTime(profile.gain, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + profile.dur)
    osc.connect(gain)
    gain.connect(master)
    osc.start(start)
    osc.stop(start + profile.dur + 0.02)
    this.keep(osc)

    const source = ctx.createBufferSource()
    source.buffer = noise
    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(profile.filter, start)
    filter.Q.value = 4
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(voice === "metro" ? 0.08 : 0.16, start)
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.03)
    source.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(master)
    source.start(start)
    source.stop(start + 0.05)
    this.keep(source)
  }

  private keep(node: Scheduled) {
    this.live.push(node)
    node.onended = () => {
      this.live = this.live.filter((item) => item !== node)
    }
  }
}

export const audio = new AudioEngine()

export type LoopHandle = {
  stop: () => void
  start: number
  cycleSec: number
}

export async function startCycle(options: {
  hits: { voice: "a" | "b"; frac: number }[]
  cycleSec: number
  cycles: number
  countIn: number
  muteAfterCountIn?: "a" | "b" | null
  onDone?: () => void
}): Promise<LoopHandle> {
  const ctx = await audio.unlock()
  const start = ctx.currentTime + 0.12
  let next = 0
  let timer = 0
  let stopped = false

  const tick = () => {
    if (stopped) return
    const horizon = ctx.currentTime + 0.22
    while (next < options.cycles && start + next * options.cycleSec < horizon) {
      const origin = start + next * options.cycleSec
      const counting = next < options.countIn
      for (const hit of options.hits) {
        if (!counting && hit.voice === options.muteAfterCountIn) continue
        audio.hitAt(origin + hit.frac * options.cycleSec, hit.voice)
      }
      next += 1
    }
    if (Number.isFinite(options.cycles) && next >= options.cycles && ctx.currentTime >= start + options.cycles * options.cycleSec - 0.04) {
      stopped = true
      options.onDone?.()
      return
    }
    timer = window.setTimeout(tick, 40)
  }

  tick()

  return {
    start,
    cycleSec: options.cycleSec,
    stop() {
      stopped = true
      window.clearTimeout(timer)
      audio.stopAll()
    },
  }
}
