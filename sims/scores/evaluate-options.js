/* Evaluate options - freeze the criteria, gather material on each option,
   compare, and recommend to a decider who was never in the room.
   Source: .../patterns/evaluate-options.md   Status: draft v1, untested */

WPSim.register('evaluate-options', {
  title: 'Evaluate options',
  tagline: 'Freeze the criteria before anyone researches, gather material about each option, compare against the criteria only, and recommend to a decider who was never in the room.',
  shape: 'work pattern · frame, gather, compare, recommend',
  hue: 'signal',
  doc: 'https://github.com/jeffrschneider/agentworkpatterns/blob/main/patterns/evaluate-options.md',
  blurb: 'The requester writes the question and the criteria and freezes both before anyone looks at an option. Researchers claim board jobs and bring back material rather than opinions. One pen builds the comparison out of that material, and the recommendation goes to a decider who never joined a room. Two of the four phases happen in no room at all.',
  status: 'draft v1 · untested',
  statusKind: 'planned',
  grade: 'open through gather; the decider never joins',
  problem: 'Three vendors are on the table, and whoever chooses has to be able to defend the choice six months from now.',
  contract: {
    inputs: [
      'the question, and the criteria to answer it by, both frozen before any research starts',
      'a decider who sets the question and stays outside the work'
    ],
    membership: 'Open through gather, because the jobs sit on a board. Compare has one pen. The decider never joins: their distance from the research is what makes the recommendation worth reading.',
    outputs: [
      'a recommendation naming a choice, with the comparison under it',
      'the frozen criteria, the board record, and every comparison line traced to a criterion'
    ]
  },
  outcome: {
    result: 'a recommendation for vendor 2, with the comparison it rests on',
    record: 'the criteria at v1 and v2, the board, and the comparison',
    open: 'one cell scored "insufficient information" — vendor 3 publishes no uptime figures',
    note: 'The board and the synthesis room are ordinary agentcollab patterns. The work pattern supplied the rest: it froze the criteria before the research, kept the jobs asking for material rather than verdicts, left the unanswerable cell visibly empty, and kept the decider outside every room.'
  },
  rooms: [
    { x0: 40, y0: 44, x1: 300, y1: 272, label: 'room · gather — work-board' },
    { x0: 380, y0: 44, x1: 640, y1: 272, label: 'room · compare — rolling-synthesis' }
  ],
  zones: [
    { x: 52, y: 296, label: 'no room · frame' },
    { x: 470, y: 296, label: 'no room · recommend' }
  ],
  cast: [
    { id: 'rq', title: 'Requester', mono: 'RQ', role: 'sets the question', kind: 'chair', at: [0.13, 1.0] },
    { id: 'ev', title: 'Evaluator', mono: 'EV', role: 'holds the pen', kind: 'pen', at: [0.21, 0.10] },
    { id: 'g1', title: 'Researcher A', mono: 'RA', role: 'claims a job', kind: 'peer', at: [0.09, 0.38] },
    { id: 'g2', title: 'Researcher B', mono: 'RB', role: 'claims a job', kind: 'peer', at: [0.33, 0.38] },
    { id: 'dc', title: 'Decider', mono: 'DC', role: 'never joins a room', kind: 'object', s: 'out', at: [0.87, 1.0] }
  ],
  props: [
    { id: 'crit', type: 'card', kind: 'the criteria', label: 'not written yet', at: [0.38, 0.98], w: 150 },
    { id: 'bd', type: 'card', kind: 'the board', label: 'no jobs yet', at: [0.21, 0.66], w: 124 },
    { id: 'cmp', type: 'artifact', kind: 'the comparison', label: 'nothing yet', at: [0.79, 0.66], w: 132 }
  ],
  steps: [
    {
      phase: 'Frame — no room', say: 'rq', to: 'crit', k: 'pen',
      wire: 'question + four criteria',
      log: 'QUESTION: which of three vendors do we build on? CRITERIA: four of them, written before anyone looks at a vendor.',
      prop: { crit: { label: 'four criteria' } },
      note: 'The requester writes the question and the criteria first. This is the same discipline as a bake-off brief, applied to options instead of contestants: criteria written after the research starts inherit the research’s biases.'
    },
    {
      phase: 'Frame — no room', say: 'rq', to: 'crit', k: 'pen',
      wire: 'FROZEN',
      log: 'The criteria are frozen. Every job on the board will cite them.',
      bump: { crit: 'v1' },
      prop: { crit: { frozen: true, label: 'frozen · four criteria' } },
      note: 'Freezing is what makes the comparison defensible later. Every line in it will trace to a criterion that existed before anyone had a favourite.'
    },
    {
      phase: 'Gather — a work board', say: 'ev', to: 'room', k: 'broadcast',
      wire: 'BOARD OPEN · 12 jobs',
      log: 'BOARD OPEN: one job per vendor per criterion, each job citing the frozen criteria.',
      prop: { bd: { label: '12 jobs open' } },
      note: 'The gather phase convenes agentcollab’s work-board. The jobs ask for material — facts, measurements, quotes, caveats — and not for opinions about which vendor should win.'
    },
    {
      phase: 'Gather — a work board', say: 'g1', to: 'bd', k: 'direct',
      wire: 'claims five',
      log: 'Researcher A claims five jobs.',
      set: { g1: 'working' },
      prop: { bd: { label: '7 open' } }
    },
    {
      phase: 'Gather — a work board', say: 'g2', to: 'bd', k: 'direct',
      wire: 'claims seven',
      log: 'Researcher B claims the rest.',
      set: { g2: 'working' },
      prop: { bd: { label: 'all claimed' } },
      note: 'Nobody was assigned an option. Who researches which vendor is decided by who is free, which is safe here because the jobs ask for material and not for judgement.'
    },
    {
      phase: 'A criterion nobody can answer', say: 'g2', to: 'bd', k: 'direct',
      wire: 'no material · vendor 3',
      log: 'Vendor 3 publishes nothing about uptime. The job comes back with no material rather than an estimate.',
      prop: { bd: { label: '1 job · no material' } },
      note: 'A criterion with no obtainable material is scored "insufficient information". It is never guessed and never quietly dropped, because a comparison with an invented number in it is worse than one with a hole.'
    },
    {
      phase: 'The criteria turn out wrong', say: 'rq', to: 'crit', k: 'pen',
      wire: 'criteria v2 · one changed',
      log: 'CRITERIA v2: one criterion was measuring the wrong thing. Only the jobs that cite it re-run.',
      bump: { crit: 'v2' },
      prop: { crit: { label: 'one criterion changed' } },
      note: 'Versioning the criteria works the way a bake-off withdraws and reissues its brief. The requester posts the change; the jobs it does not touch keep the material they already have.'
    },
    {
      phase: 'Compare — one pen', dur: 3200,
      log: '· the delivered material crosses into the comparison room',
      move: { ev: [0.79, 0.10], g1: [0.66, 0.38], g2: [0.93, 0.38] },
      set: { g1: 'idle', g2: 'idle' },
      prop: { bd: { label: '11 delivered, 1 empty' } },
      note: 'The compare phase convenes rolling-synthesis. One pen builds the comparison out of the delivered material and nothing else.'
    },
    {
      phase: 'Compare — one pen', say: 'ev', to: 'cmp', k: 'pen',
      wire: 'criterion by criterion',
      log: 'The comparison goes up one criterion at a time: three vendors against four criteria.',
      prop: { cmp: { label: '3 vendors × 4' } },
      note: 'Every line traces to a criterion. Nothing enters the comparison that was not asked for on the board, however interesting a researcher found it.'
    },
    {
      phase: 'Compare — one pen', say: 'ev', to: 'cmp', k: 'pen',
      wire: 'insufficient information',
      log: 'Vendor 3, uptime: insufficient information. The cell says so.',
      prop: { cmp: { label: 'one cell empty' } },
      note: 'The empty cell is part of the answer. A comparison that hides what could not be found is harder to trust than one that shows the hole.'
    },
    {
      phase: 'A tie', say: 'ev', to: 'cmp', k: 'pen',
      wire: 'a tie, and what breaks it',
      log: 'Vendors 1 and 2 tie on three of four criteria. The comparison reports the tie and names the smallest fact that would settle it.',
      prop: { cmp: { label: 'tie, on the record' } },
      note: 'Manufacturing a winner to look decisive hands the decider a coin flip dressed as analysis. The tie is reported as a tie, along with what would break it.'
    },
    {
      phase: 'Recommend — no room', dur: 3200,
      log: '· the evaluator leaves the room to write the recommendation',
      move: { ev: [0.62, 1.0] },
      set: { ev: 'working', g1: 'out', g2: 'out', dc: 'idle' },
      note: 'The last phase happens in no room. The recommendation is written on top of the comparison, and the decider it is written for has not been in a room at any point in this job.'
    },
    {
      phase: 'Recommend — no room', say: 'ev', to: 'dc', k: 'direct',
      wire: 'recommendation + comparison',
      log: 'RECOMMENDATION: vendor 2, on the criterion that breaks the tie. The comparison goes with it.',
      set: { ev: 'done', dc: 'done' },
      note: 'The recommendation names a choice, and the comparison travels with it so that the decider can disagree with reasons instead of on instinct. Whether they take it is their own job, not this one.'
    }
  ]
});
