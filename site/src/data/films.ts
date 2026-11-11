export const FILMS = {
  overview: {
    name: 'Cortex + Neuron',
    title: 'A live engine, recorded as it ran.',
    description:
      'Cortex and Neuron, recorded from the live research engine and narrated: a define run, the runs under one line, a meaning changed, a receipt played back, and a project held across sessions. Research and engineering by James Huson.',
    duration: 80,
  },
  cortex: {
    name: 'Cortex',
    title: 'Pick up the thread.',
    description:
      'Cortex is James Huson’s research system for persistent memory in LLM work: a project’s scope, checkpoints, time and reports, held in a live engine so a new session starts from the state of the work.',
    duration: 72,
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
      ['00:00', "This is Cortex. It's memory for work. When I sit down with a new session, it doesn't start the project over. It starts from where the work actually is."],
      ['00:09', 'I tell it about a project in plain lines. First, what the project is.'],
      ['00:15', 'Then a checkpoint: a piece of the work with a clear edge.'],
      ['00:21', 'What I expect to be true when that checkpoint is done.'],
      ['00:27', "And where it stands today. Each of those lines is a run of its own, with its own time. Nothing here is a document. It's all state."],
      ['00:36', 'As a session works, it reports what it did, as a line, and Cortex reads it against what it already holds.'],
      ['00:44', "Now I say the same thing twice. It isn't stored twice. It's the same memory with a new time on it, and that is how it tells time passing from new information."],
      ['00:54', 'When the checkpoint is done, I say so, and the state moves. The history stays.'],
      ['01:01', 'The next session opens the project and finds the state, the time, and the grounding. Nothing to re-read. Cortex, by James Huson, at exnulla dot com.'],
    ] as [string, string][]
  },
  neuron: {
    name: 'Neuron',
    title: 'See the connections.',
    description:
      'Neuron is James Huson’s research engine for symbolic computing: words, their meanings and relationships laid into a live graph, with every run recorded and playable.',
    duration: 79,
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
      ['00:00', "This is Neuron. I won't tell you how it works, but I can show you what it does. Every point is a word. Every line is a relationship it formed on its own."],
      ['00:10', "I'll start with a word it has never been given."],
      ['00:14', 'The line I typed is the primary run. Underneath it, the engine spawns its own secondary runs, one for every thing it had to understand on the way. Those are the counts.'],
      ['00:25', 'Now a different word.'],
      ['00:28', 'Look at the last row. Every question has a shape, and the first time it meets a new one it works out a formula. Here the formula was already there, so it used it again.'],
      ['00:38', "A meaning isn't fixed."],
      ['00:42', 'I can tell it, in one line, that a word means something else, and the relationships move with it. No retraining, no rebuild. Just a change of state, with a time on it.'],
      ['00:52', 'Ask for the word again and it answers from memory. The run it did is still there, as a receipt.'],
      ['00:59', "So let's play it back. This is the path through the graph, hop by hop. Every hop is readable, which means every answer can be audited. Learning happens at build time. This is runtime, and it's quick."],
      ['01:11', "That's Neuron. Research and engineering by James Huson, at exnulla dot com."],
    ] as [string, string][]
  },
};

export type FilmId = keyof typeof FILMS;
export const PUBLIC_ORIGIN = 'https://www.exnulla.com';
export const FILM_PUBLISHED = '2026-11-10T18:30:00-06:00';
