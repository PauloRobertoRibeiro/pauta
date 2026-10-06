import { cycleOf } from "@/lib/music/cycle"
import type { Clef, Meter, Naming, NoteInput, OctaveSystem, Pitch, Step } from "@/lib/music/types"

const B: Pitch = { step: "B", octave: 4 }

export type NoteLevel = {
  id: string
  name: string
  detail: string
  lesson: string
  clefs: Clef[]
  range: Partial<Record<Clef, { min: Pitch; max: Pitch }>>
  /** Key signatures as fifths. Positive is sharps. */
  keys: number[]
  accidentals: boolean
}

export type RhythmLevel = {
  id: string
  name: string
  detail: string
  lesson: string
  meters: Meter[]
  /** Allowed durations in quarter-note lengths. */
  durations: number[]
  rests: boolean
}

export type ChantSyllable = { text: string; frac: number }

export type PolyExercise = {
  id: string
  kind: "polirritmo" | "cruzado"
  ratio: string
  title: string
  summary: string
  where: string
  steps: string[]
  chant?: ChantSyllable[]
  meter: Meter
  measures: number
  /** Felt pulses in one cycle. BPM multiplies this. */
  pulses: number
  pulseName: string
  foot: "a" | "b"
  voices: [
    { name: string; countLabel: string; notes: NoteInput[] },
    { name: string; countLabel: string; notes: NoteInput[] },
  ]
}

function p(step: Step, octave: number): Pitch {
  return { step, octave }
}

function notes(count: number, duration: NoteInput["duration"], extra?: Partial<NoteInput>): NoteInput[] {
  return Array.from({ length: count }, () => ({
    pitch: B,
    duration,
    ...extra,
  }))
}

function tuplet(count: number, duration: NoteInput["duration"], actual: number, normal: number, group: string): NoteInput[] {
  return notes(count, duration, { tuplet: { actual, normal, group } })
}

function pattern(hits: number[], duration: NoteInput["duration"] = "8"): NoteInput[] {
  return hits.map((hit) =>
    hit
      ? { pitch: B, duration }
      : { rest: true, duration },
  )
}

export const NOTE_LEVELS: NoteLevel[] = [
  {
    id: "sol-centro",
    name: "Clave de sol",
    detail: "As cinco linhas, sem suplementares",
    lesson:
      "Na clave de sol, a linha do meio é si. As linhas, de baixo para cima: mi, sol, si, ré, fá. Os espaços: fá, lá, dó, mi. Diga o nome antes de procurar a tecla.",
    clefs: ["treble"],
    range: { treble: { min: p("E", 4), max: p("F", 5) } },
    keys: [0],
    accidentals: false,
  },
  {
    id: "sol-linhas",
    name: "Linhas suplementares",
    detail: "Dó central até o dó de cima",
    lesson:
      "O dó central mora na primeira linha suplementar abaixo da clave de sol. Cada linha extra é uma nota de linha; o espaço entre elas também conta. Conte a partir da última linha da pauta, sem pular.",
    clefs: ["treble"],
    range: { treble: { min: p("A", 3), max: p("C", 6) } },
    keys: [0],
    accidentals: false,
  },
  {
    id: "fa-centro",
    name: "Clave de fá",
    detail: "A pauta grave, do sol ao lá",
    lesson:
      "A clave de fá marca o fá na quarta linha. Os dois pontos abraçam essa linha. Linhas, de baixo para cima: sol, si, ré, fá, lá. É outra pauta, não a de sol deslocada.",
    clefs: ["bass"],
    range: { bass: { min: p("G", 2), max: p("A", 3) } },
    keys: [0],
    accidentals: false,
  },
  {
    id: "fa-linhas",
    name: "Fá com suplementares",
    detail: "Do dó grave ao mi central",
    lesson:
      "O dó central, na clave de fá, fica na primeira linha suplementar acima da pauta. É a mesma tecla da linha suplementar de baixo na clave de sol.",
    clefs: ["bass"],
    range: { bass: { min: p("C", 2), max: p("E", 4) } },
    keys: [0],
    accidentals: false,
  },
  {
    id: "claves",
    name: "As duas claves",
    detail: "A clave muda sem avisar",
    lesson:
      "Olhe a clave antes da nota. O mesmo lugar na pauta é outra nota quando a clave troca. O dó central é a ponte entre as duas.",
    clefs: ["treble", "bass"],
    range: {
      treble: { min: p("C", 4), max: p("A", 5) },
      bass: { min: p("E", 2), max: p("C", 4) },
    },
    keys: [0],
    accidentals: false,
  },
  {
    id: "acidentes",
    name: "Sustenidos e bemóis",
    detail: "Acidentes na frente da nota",
    lesson:
      "O sustenido sobe meio tom. O bemol desce meio tom. O acidente vale para aquela nota, naquela oitava, até o fim do compasso — aqui cada nota vem sozinha, então leia o sinal que está escrito.",
    clefs: ["treble"],
    range: { treble: { min: p("C", 4), max: p("A", 5) } },
    keys: [0],
    accidentals: true,
  },
  {
    id: "armaduras",
    name: "Armaduras",
    detail: "Sol, ré, lá, fá, si bemol e mi bemol",
    lesson:
      "A armadura vale a peça inteira. Em sol maior todo fá soa sustenido, mesmo sem o sinal na nota. O solfejo daqui é fixo: a nota continua se chamando fá, e o som é fá sustenido.",
    clefs: ["treble"],
    range: { treble: { min: p("E", 4), max: p("F", 5) } },
    keys: [1, 2, 3, -1, -2, -3],
    accidentals: false,
  },
]

export const RHYTHM_LEVELS: RhythmLevel[] = [
  {
    id: "seminimas",
    name: "Semínimas",
    detail: "O pulso, uma nota por tempo",
    lesson:
      "A semínima é a cabeça preta com haste. Em 2/4, 3/4 e 4/4 ela vale um pulso. Bata o pé no metrónomo e faça a mão coincidir com o pé.",
    meters: [
      { beats: 4, beatValue: 4 },
      { beats: 3, beatValue: 4 },
      { beats: 2, beatValue: 4 },
    ],
    durations: [1],
    rests: false,
  },
  {
    id: "brancas",
    name: "Brancas e semibreves",
    detail: "Notas que duram mais de um pulso",
    lesson:
      "A mínima dura dois pulsos. A semibreve dura quatro. O ponto ainda não entrou: segure o som e só solte quando o valor acabar. O pé não para.",
    meters: [
      { beats: 4, beatValue: 4 },
      { beats: 3, beatValue: 4 },
    ],
    durations: [1, 2, 4],
    rests: false,
  },
  {
    id: "colcheias",
    name: "Colcheias",
    detail: "Dois sons em cada pulso",
    lesson:
      "A colcheia divide o pulso em dois. Fale “um-e, dois-e”. Aqui as colcheias aparecem com bandeiras individuais; também podem ser agrupadas por barras. O valor é o mesmo.",
    meters: [
      { beats: 4, beatValue: 4 },
      { beats: 3, beatValue: 4 },
      { beats: 2, beatValue: 4 },
    ],
    durations: [0.5, 1, 2],
    rests: false,
  },
  {
    id: "pausas",
    name: "Pausas",
    detail: "O silêncio tem figura",
    lesson:
      "Pausa não é buraco: é tempo contado. A pausa de semínima parece um risco ondulado; a de colcheia é um gancho; a de mínima senta na linha do meio. Tire a mão e deixe o pé seguir.",
    meters: [
      { beats: 4, beatValue: 4 },
      { beats: 3, beatValue: 4 },
    ],
    durations: [0.5, 1, 2],
    rests: true,
  },
  {
    id: "pontos",
    name: "Notas pontuadas",
    detail: "O ponto soma metade do valor",
    lesson:
      "O ponto de aumento fica à direita da cabeça e soma metade do valor da figura. Semínima pontuada = um pulso e meio. Mínima pontuada = três pulsos. Sinta o pulso que fica no meio do valor longo.",
    meters: [
      { beats: 4, beatValue: 4 },
      { beats: 3, beatValue: 4 },
    ],
    durations: [0.5, 1, 1.5, 2, 3],
    rests: false,
  },
  {
    id: "semicolcheias",
    name: "Semicolcheias",
    detail: "Quatro sons no pulso",
    lesson:
      "A semicolcheia tem duas bandeiras, ou duas barras quando vem em grupo. Fale “um-e-a-e” bem igual. Se a última do grupo sair correndo, desacelere o pulso, não a nota.",
    meters: [
      { beats: 4, beatValue: 4 },
      { beats: 2, beatValue: 4 },
    ],
    durations: [0.25, 0.5, 1],
    rests: false,
  },
  {
    id: "composto",
    name: "Compasso 6/8",
    detail: "O pulso é a semínima pontuada",
    lesson:
      "6/8 tem seis colcheias, mas o pé marca dois pulsos. Cada pulso cabe uma semínima pontuada, ou três colcheias. Conte “um-lá-li, dois-lá-li”.",
    meters: [{ beats: 6, beatValue: 8 }],
    durations: [0.5, 1, 1.5],
    rests: false,
  },
]

const threeTwo: PolyExercise = {
  id: "3-2",
  kind: "polirritmo",
  ratio: "3:2",
  title: "3 contra 2",
  summary: "Três notas iguais no tempo de duas. É o polirritmo que abre a porta dos outros.",
  where: "Aparece em hemiólia, em muita percussão da diáspora africana e sempre que uma melodia em três caminha sobre um baixo em dois.",
  steps: [
    "Pé nas duas notas do mar. Devagar, quase parado.",
    "Diga o canto no tempo certo: as sílabas não são iguais, elas caem onde as notas caem.",
    "Mão âmbar nas três, com o pé ainda nas duas.",
    "Junte as mãos. O único encontro obrigatório é o começo do ciclo.",
  ],
  chant: [
    { text: "um", frac: 0 },
    { text: "lá", frac: 1 / 3 },
    { text: "dois", frac: 0.5 },
    { text: "li", frac: 2 / 3 },
  ],
  meter: { beats: 2, beatValue: 4 },
  measures: 1,
  pulses: 2,
  pulseName: "a semínima da voz de baixo",
  foot: "b",
  voices: [
    { name: "Âmbar", countLabel: "3", notes: tuplet(3, "q", 3, 2, "tres") },
    { name: "Mar", countLabel: "2", notes: notes(2, "q") },
  ],
}

export const POLY_EXERCISES: PolyExercise[] = [
  threeTwo,
  {
    id: "2-3",
    kind: "polirritmo",
    ratio: "2:3",
    title: "2 contra 3",
    summary: "O mesmo desenho, com o pé nas três. Duas semínimas pontuadas contra três semínimas.",
    where: "É a célula da hemiólia: dois grupos de três virando três grupos de dois, ou o contrário. Muito comum no fim de uma frase em 3/4.",
    steps: [
      "Pé nas três semínimas do mar. Conte um, dois, três.",
      "A voz âmbar segura até o meio do compasso: são duas notas longas, não três.",
      "Fale “um, dois, lá, três” nos encontros do ciclo.",
      "Quando estiver estável, alterne um ciclo de 2:3 com um ciclo de 3:2.",
    ],
    chant: [
      { text: "um", frac: 0 },
      { text: "dois", frac: 1 / 3 },
      { text: "lá", frac: 0.5 },
      { text: "três", frac: 2 / 3 },
    ],
    meter: { beats: 3, beatValue: 4 },
    measures: 1,
    pulses: 3,
    pulseName: "a semínima",
    foot: "b",
    voices: [
      {
        name: "Âmbar",
        countLabel: "2",
        notes: notes(2, "q", { dots: 1 }),
      },
      { name: "Mar", countLabel: "3", notes: notes(3, "q") },
    ],
  },
  {
    id: "3-2-pulso",
    kind: "polirritmo",
    ratio: "3:2",
    title: "3 contra 2 no pulso",
    summary: "Dentro de um único tempo: tercina de colcheia contra duas colcheias.",
    where: "É o 3:2 comprimido num pulso. Jazz, marcha e muito estudo de tercina contra divisão binária passam por aqui.",
    steps: [
      "O pé marca um pulso só, bem largo.",
      "A voz mar divide esse pulso em dois. Fale “tá-tá”.",
      "A voz âmbar divide o mesmo pulso em três. Fale “tá-ki-tá”.",
      "As duas começam juntas e só se reencontram no próximo pé.",
    ],
    chant: [
      { text: "um", frac: 0 },
      { text: "lá", frac: 1 / 3 },
      { text: "e", frac: 0.5 },
      { text: "li", frac: 2 / 3 },
    ],
    meter: { beats: 1, beatValue: 4 },
    measures: 1,
    pulses: 1,
    pulseName: "o pulso",
    foot: "b",
    voices: [
      { name: "Âmbar", countLabel: "3", notes: tuplet(3, "8", 3, 2, "tercina") },
      { name: "Mar", countLabel: "2", notes: notes(2, "8") },
    ],
  },
  {
    id: "4-3",
    kind: "polirritmo",
    ratio: "4:3",
    title: "4 contra 3",
    summary: "Quatro notas iguais no tempo de três. O pé fica nas três.",
    where: "Quartetos, estudos de Chopin e muita música em que a mão direita anda em quatro sobre um acompanhamento em três.",
    steps: [
      "Pé firme nas três. Não deixe o quatro puxar o pé.",
      "Aprenda o quatro sozinho, igual, preenchendo o compasso inteiro.",
      "O canto tem seis sílabas. Elas não cabem numa divisão regular: cante olhando a régua.",
      "Suba o andamento só quando o primeiro tempo das duas vozes estiver colado.",
    ],
    chant: [
      { text: "já", frac: 0 },
      { text: "che", frac: 0.25 },
      { text: "gou", frac: 1 / 3 },
      { text: "a", frac: 0.5 },
      { text: "ho", frac: 2 / 3 },
      { text: "ra", frac: 0.75 },
    ],
    meter: { beats: 3, beatValue: 4 },
    measures: 1,
    pulses: 3,
    pulseName: "a semínima",
    foot: "b",
    voices: [
      { name: "Âmbar", countLabel: "4", notes: tuplet(4, "q", 4, 3, "quatro") },
      { name: "Mar", countLabel: "3", notes: notes(3, "q") },
    ],
  },
  {
    id: "3-4",
    kind: "polirritmo",
    ratio: "3:4",
    title: "3 contra 4",
    summary: "Três mínimas em quiáltera contra quatro semínimas. O pé fica nas quatro.",
    where: "É o 4:3 visto do outro lado. Útil quando a melodia é lenta e o acompanhamento corre em quatro.",
    steps: [
      "Pé nas quatro semínimas, sem acento no dois e no quatro.",
      "A voz âmbar são três notas longas. Cada uma dura mais que um pulso.",
      "Elas só se encontram no tempo um.",
      "Se a terceira nota antecipar, você está fazendo tercina de semínima. Volte ao pé.",
    ],
    meter: { beats: 4, beatValue: 4 },
    measures: 1,
    pulses: 4,
    pulseName: "a semínima",
    foot: "b",
    voices: [
      { name: "Âmbar", countLabel: "3", notes: tuplet(3, "h", 3, 2, "minimas") },
      { name: "Mar", countLabel: "4", notes: notes(4, "q") },
    ],
  },
  {
    id: "5-4",
    kind: "polirritmo",
    ratio: "5:4",
    title: "5 contra 4",
    summary: "Cinco notas iguais num compasso de quatro. A quintina contra o pulso.",
    where: "Estudos do século XX, improvisação e qualquer lugar em que cinco quer caber num compasso quadrado sem virar pressa.",
    steps: [
      "Pé nas quatro, andamento baixo.",
      "Fale cinco sílabas iguais até o pé fechar o ciclo: “tá-tá-tá-tá-tá”.",
      "A primeira e o pé começam juntos. Nenhuma outra das cinco cai no pé.",
      "Grave na orelha o espaço logo antes do próximo tempo um. É ali que a quinta nota mora.",
    ],
    meter: { beats: 4, beatValue: 4 },
    measures: 1,
    pulses: 4,
    pulseName: "a semínima",
    foot: "b",
    voices: [
      { name: "Âmbar", countLabel: "5", notes: tuplet(5, "q", 5, 4, "cinco") },
      { name: "Mar", countLabel: "4", notes: notes(4, "q") },
    ],
  },
  {
    id: "5-3",
    kind: "polirritmo",
    ratio: "5:3",
    title: "5 contra 3",
    summary: "Cinco contra três, no mesmo compasso. Menos famoso, e um ótimo teste de paciência.",
    where: "Menos comum no repertório inicial, e exatamente por isso um bom laboratório: se o 5:3 fecha, o 3:2 já não assusta.",
    steps: [
      "Escolha o mar (três) como pé e não negocie.",
      "Toque o cinco sozinho por vários ciclos, bem igual.",
      "Entre com as duas vozes só no tempo um, nunca no meio.",
      "Se perder, pare no próximo tempo um. Não tente consertar no meio do ciclo.",
    ],
    meter: { beats: 3, beatValue: 4 },
    measures: 1,
    pulses: 3,
    pulseName: "a semínima",
    foot: "b",
    voices: [
      { name: "Âmbar", countLabel: "5", notes: tuplet(5, "q", 5, 3, "cinco-tres") },
      { name: "Mar", countLabel: "3", notes: notes(3, "q") },
    ],
  },
  {
    id: "tresillo",
    kind: "cruzado",
    ratio: "3+3+2",
    title: "Tresillo",
    summary: "Não é divisão igual. São dois grupos de três colcheias e um de duas, contra quatro pulsos.",
    where: "Base de habanera, de muita música afro-cubana e de células que o choro e o samba também reconhecem. O acento atrasado é o charme.",
    steps: [
      "Pé nas quatro semínimas, seco.",
      "A voz âmbar: longa, longa, curta. Semínima pontuada, semínima pontuada, semínima.",
      "O segundo ataque cai no “e” do dois, não no três.",
      "Quando o pé não mexer para encontrar a mão, o ritmo cruzado está estável.",
    ],
    meter: { beats: 4, beatValue: 4 },
    measures: 1,
    pulses: 4,
    pulseName: "a semínima",
    foot: "b",
    voices: [
      { name: "Âmbar", countLabel: "3+3+2", notes: [...notes(2, "q", { dots: 1 }), ...notes(1, "q")] },
      { name: "Mar", countLabel: "4", notes: notes(4, "q") },
    ],
  },
  {
    id: "clave-32",
    kind: "cruzado",
    ratio: "3–2",
    title: "Clave son 3-2",
    summary: "Dois compassos. O lado de três vem primeiro. A clave aqui é um ritmo, não a clave da pauta.",
    where: "A espinha de boa parte da música afro-cubana. Ouvir onde a clave NÃO toca importa tanto quanto ouvir onde ela toca.",
    steps: [
      "Pé nas semínimas, oito pulsos, dois compassos.",
      "Lado de três: no um, no “e” do dois, e no quatro.",
      "Lado de dois: no dois e no três do compasso seguinte.",
      "Cante a clave e mantenha o pé constante. Quem acelera é quase sempre a mão.",
    ],
    meter: { beats: 4, beatValue: 4 },
    measures: 2,
    pulses: 8,
    pulseName: "a semínima",
    foot: "b",
    voices: [
      { name: "Âmbar", countLabel: "clave", notes: pattern([1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0]) },
      { name: "Mar", countLabel: "pulso", notes: notes(8, "q") },
    ],
  },
  {
    id: "clave-23",
    kind: "cruzado",
    ratio: "2–3",
    title: "Clave son 2-3",
    summary: "A mesma clave, começando pelo lado de dois. Trocar o lado muda a frase inteira.",
    where: "Muitas músicas entram pelo lado de dois. Trate como outro ritmo, não como o anterior deslocado no feeling.",
    steps: [
      "Pé nas semínimas, do começo ao fim.",
      "Primeiro compasso: ataques no dois e no três.",
      "Segundo compasso: um, “e” do dois, e quatro.",
      "Alterne 3-2 e 2-3 só depois que cada um fechar sozinho.",
    ],
    meter: { beats: 4, beatValue: 4 },
    measures: 2,
    pulses: 8,
    pulseName: "a semínima",
    foot: "b",
    voices: [
      { name: "Âmbar", countLabel: "clave", notes: pattern([0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]) },
      { name: "Mar", countLabel: "pulso", notes: notes(8, "q") },
    ],
  },
]

export function exerciseHits(exercise: PolyExercise) {
  return {
    a: cycleOf(exercise.voices[0].notes),
    b: cycleOf(exercise.voices[1].notes),
  }
}

export function noteLevel(id: string) {
  return NOTE_LEVELS.find((level) => level.id === id) ?? NOTE_LEVELS[0]
}

export function rhythmLevel(id: string) {
  return RHYTHM_LEVELS.find((level) => level.id === id) ?? RHYTHM_LEVELS[0]
}

export function polyExercise(id: string) {
  return POLY_EXERCISES.find((exercise) => exercise.id === id) ?? POLY_EXERCISES[0]
}

export const OCTAVE_HELP: Record<OctaveSystem, string> = {
  franco: "Dó central = 3. É a contagem mais usada no solfejo em português.",
  scientific: "Dó central = 4. É a contagem científica, comum em MIDI e em partitura internacional.",
}

export const NAMING_HELP: Record<Naming, string> = {
  solfege: "Solfejo fixo: dó é a nota dó, em qualquer tonalidade.",
  letter: "Letras: C D E F G A B. O dó é C.",
}
