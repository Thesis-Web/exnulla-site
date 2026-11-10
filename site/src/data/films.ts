export const FILMS = {
  overview: {
    name: 'Cortex + Neuron',
    title: 'Keep context. Make connections.',
    description:
      'An illustrative introduction to Cortex, persistent context for AI work, and Neuron, an experimental symbolic computing engine. Research and engineering by James Huson.',
    duration: 24,
  },
  cortex: {
    name: 'Cortex',
    title: 'Pick up the thread.',
    description:
      'Cortex is James Huson’s experimental persistent memory system for LLM work: project scope, time, evidence, and the next step carried across sessions.',
    duration: 18,
    eyebrow: 'Persistent context for AI work',
    summary:
      'A new AI session should not mean starting the project over. Cortex explores how to carry project state, evidence, and direction from one session to the next.',
    question: 'How do you keep AI work connected across sessions?',
    approach:
      'Cortex brings project scope, checkpoints, observations, and their supporting evidence into a persistent record. A focused handoff gives the next session the current task and the context needed to continue.',
    skills: ['Context architecture', 'Evidence and provenance', 'Workflow design', 'Evaluation'],
    engineering:
      'Project and checkpoint modeling, evidence-linked records, session handoffs, and checks that distinguish a reported result from verified completion.',
    status:
      'Working research system under active development. The film illustrates the workflow; it does not establish general reliability or autonomous verification.',
    transcript: [
      ['00:00', 'Cortex. Pick up the thread. Persistent context for AI work.'],
      ['00:06', 'New session. Same direction. Scope, evidence, next step.'],
      [
        '00:12',
        'Keep the work connected. Project state. Time. Grounding. Research and engineering by James Huson.',
      ],
    ],
  },
  neuron: {
    name: 'Neuron',
    title: 'See the connections.',
    description:
      'Neuron is James Huson’s experimental symbolic computing engine, exploring how definitions, relationships, and execution can be represented and inspected.',
    duration: 18,
    eyebrow: 'Experimental symbolic computing',
    summary:
      'Computation has a process behind its output. Neuron explores how symbols, relationships, and execution can become visible, inspectable parts of that process.',
    question: 'What becomes possible when you can inspect the process?',
    approach:
      'Neuron represents symbols and their relationships in a working engine. Its development view makes activity and recorded runs visible, connecting the work on language and definitions to the mechanics of execution.',
    skills: ['Systems architecture', 'Native development', 'Data modeling', 'Visualization'],
    engineering:
      'A native C kernel, Python tooling, source-backed definitions, recorded execution, and a browser visualization for inspecting the system.',
    status:
      'Experimental research under active development. General language understanding and autonomous invention remain research goals. The film’s graph is illustrative.',
    transcript: [
      ['00:00', 'Neuron. See the connections. Experimental symbolic computing.'],
      ['00:06', 'Follow the process. Symbols, relationships, execution.'],
      [
        '00:12',
        'Make computation visible. Explore the process behind the output. Research and engineering by James Huson.',
      ],
    ],
  },
} as const;

export type FilmId = keyof typeof FILMS;
export const PUBLIC_ORIGIN = 'https://www.exnulla.com';
export const FILM_PUBLISHED = '2026-11-10T15:30:00-06:00';
