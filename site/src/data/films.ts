export const FILMS = {
  overview: {
    name: 'Cortex + Neuron',
    title: 'A live engine, recorded as it ran.',
    description:
      'Cortex and Neuron, recorded from the live research engine and narrated: a define run, the runs under one line, a meaning changed, a receipt played back, and a project held across sessions. Research and engineering by James Huson.',
    duration: 111,
  },
  cortex: {
    name: 'Cortex',
    title: 'Pick up the thread.',
    description:
      'Cortex is James Huson’s research system for persistent memory in LLM work: a project’s scope, checkpoints, time and reports, held in a live engine so a new session starts from the state of the work.',
    duration: 61,
    eyebrow: 'Persistent context for AI work',
    summary:
      'A new AI session should not mean starting the project over. Cortex holds a project’s scope, its checkpoints and what each session reported, with time, so the next session starts from the state of the work rather than a transcript.',
    question: 'How do you keep AI work connected across sessions?',
    approach:
      'A project is told to the engine in plain lines: its scope, a checkpoint, what is expected of it, and where it stands. Each session reports what it did as a line, and the engine reads it against what it already holds. A report said twice is not stored twice; it is the same memory with a new time. The film is a screen recording of those lines being typed into the engine.',
    skills: ['Context architecture', 'Evidence and provenance', 'Workflow design', 'Evaluation'],
    engineering:
      'A native kernel holding state, time and memory; project and checkpoint lines; session reports judged against the held state; lean hand-offs that give the next session the current task; and checks that distinguish a reported result from a verified one.',
    status:
      'Working research system under active development. The film shows the engine as it ran on a copy of its memory; it does not establish general reliability or autonomous verification.',
    transcript: [
      [
        '00:00',
        'Cortex is memory for work: state, time and grounding, held in a live engine, so that a new session does not start the project over.',
      ],
      ['00:11', 'A project is told to it in plain lines.'],
      [
        '00:15',
        'Its scope. A checkpoint. What is expected of that checkpoint. And where it stands today. Each line is a run, with its own time.',
      ],
      [
        '00:31',
        'Each session reports what it did, as a line, and the engine reads it against what it already holds.',
      ],
      [
        '00:40',
        'Say a thing twice, and it is not stored twice. It is the same memory, with a new time.',
      ],
      [
        '00:48',
        'The next session starts from the state of the work, not from a transcript. Cortex. Research and engineering by James Huson. exnulla dot com.',
      ],
    ] as [string, string][],
  },
  neuron: {
    name: 'Neuron',
    title: 'See the connections.',
    description:
      'Neuron is James Huson’s research engine for symbolic computing: words, their meanings and relationships laid into a live graph, with every run recorded and playable.',
    duration: 84,
    eyebrow: 'Experimental symbolic computing',
    summary:
      'Every point in the graph is a word the engine knows; every line is a connection it made for itself. Ask it to define a word it has never been given and it reads its sources and works the word in, along with every word it met on the way. Ask again, and nothing runs.',
    question: 'What becomes possible when you can inspect the process?',
    approach:
      'One typed line starts a run, and a tree of runs underneath it: the engine asking its own questions and answering them. Learning happens once and takes its time; recall is immediate. A meaning can be told and changed in a single line. Every run leaves a receipt, the path it took through the graph, and any run can be played back hop by hop. The film is a screen recording of the engine doing exactly that.',
    skills: ['Systems architecture', 'Native development', 'Data modeling', 'Visualization'],
    engineering:
      'A native C kernel, source-backed definitions, recorded runs with receipts, and a browser stage for watching the graph as it changes.',
    status:
      'Experimental research under active development. General language understanding and autonomous invention remain research goals. The film shows the engine as it ran on a copy of its memory.',
    transcript: [
      [
        '00:00',
        'Neuron is a live engine. Every point is a word it knows. Every line is a connection it has made for itself.',
      ],
      ['00:10', 'Ask it to define a word it has never been given.'],
      [
        '00:15',
        'It reads its sources, and works the word into the graph, along with every word it met on the way. Twenty-nine runs. Thirteen new words. Two seconds.',
      ],
      [
        '00:28',
        'One typed line, and a tree of runs underneath it: the engine asking its own questions, and answering them, without being told to.',
      ],
      [
        '00:37',
        'Ask the same thing again, and nothing runs. It already knows. Learning happens once, and takes its time. Recall is immediate.',
      ],
      ['00:49', 'A meaning is not fixed.'],
      ['00:54', 'It can be told, and it can be changed, in a single line.'],
      ['00:59', 'Every run leaves a receipt: the path it took through the graph.'],
      ['01:06', 'Any run can be played back, hop by hop, and every hop can be read.'],
      ['01:15', 'Neuron. Research and engineering by James Huson. exnulla dot com.'],
    ] as [string, string][],
  },
};

export type FilmId = keyof typeof FILMS;
export const PUBLIC_ORIGIN = 'https://www.exnulla.com';
export const FILM_PUBLISHED = '2026-11-10T18:30:00-06:00';
