/* Divide and integrate - cut a deliverable into jobs anyone can claim,
   then have one agent weave the results into a whole.
   Source: .../patterns/divide-and-integrate.md */

WPSim.register('divide-and-integrate', {
  title: 'Divide and integrate',
  tagline: 'Cut a deliverable into jobs anyone can claim, then have one agent weave the delivered material into a whole.',
  shape: 'work pattern · cut, claim, weave',
  hue: 'signal',
  doc: 'https://github.com/jeffrschneider/agentworkpatterns/blob/main/patterns/divide-and-integrate.md',
  blurb: 'The convener cuts the deliverable into jobs and posts them on a board. Workers claim what they can and deliver material against the job ids. One agent then holds the pen and builds the whole thing out of what came back. Nobody is assigned anything, so this is the pattern to reach for when you cannot predict who will be available.',
  grade: 'open all the way through produce',
  problem: 'A quarterly report has to be written, and there is no telling which agents will be free this week.',
  contract: {
    inputs: [
      'a deliverable that can be cut into jobs that do not need to know about each other',
      'one agent who can hold the whole deliverable in their head'
    ],
    membership: 'Open through produce: whoever claims a job first gets it. In integrate one agent holds the pen, and feeders come and go.',
    outputs: [
      'the integrated deliverable',
      'the board record: what was asked, claimed, delivered, and left open'
    ]
  },
  outcome: {
    result: 'the report, integrated by one pen out of four jobs of material',
    record: 'the board, and the synthesis room',
    open: 'nothing — the unclaimed job was re-cut, and the gap became a follow-up job',
    note: 'The board and the synthesis room are ordinary agentcollab patterns. The work pattern supplied the rest: it wrote jobs that asked for material rather than prose, gave the board a deadline, and sent the missing piece back to the board instead of chasing the worker who left.'
  },
  rooms: [
    { x0: 40, y0: 44, x1: 270, y1: 336, label: 'room · produce — work-board' },
    { x0: 410, y0: 44, x1: 640, y1: 336, label: 'room · integrate — rolling-synthesis' }
  ],
  zones: [
    { x: 292, y: 26, label: 'no room' },
    { x: 292, y: 38, label: 'divide, then deliver' }
  ],
  cast: [
    { id: 'cv', title: 'Convener', mono: 'CV', role: 'cuts the work', kind: 'chair', at: [0.5, 0.11] },
    { id: 'w1', title: 'Worker A', mono: 'WA', role: 'claims a job', kind: 'peer', at: [0.07, 0.47] },
    { id: 'w2', title: 'Worker B', mono: 'WB', role: 'claims a job', kind: 'peer', at: [0.19, 0.64] },
    { id: 'w3', title: 'Worker C', mono: 'WC', role: 'claims a job', kind: 'peer', at: [0.31, 0.47] },
    { id: 'sy', title: 'Synthesizer', mono: 'SY', role: 'holds the pen', kind: 'pen', at: [0.81, 0.14] }
  ],
  props: [
    { id: 'bd', type: 'card', kind: 'the job list', label: 'not written yet', at: [0.5, 0.92], w: 128 },
    { id: 'whole', type: 'artifact', kind: 'the deliverable', label: 'nothing yet', at: [0.81, 0.92], w: 138 }
  ],
  steps: [
    {
      phase: 'Divide — no room', say: 'cv', to: 'bd', k: 'pen',
      wire: 'three jobs',
      log: 'JOB LIST: three jobs, cut so that none of them needs to know what the others are doing.',
      prop: { bd: { label: 'jobs 1–3' } },
      note: 'The convener cuts the deliverable into jobs before any room opens. Nobody is assigned anything, so each job has to be written well enough that a worker can pick it up and start without asking a question.'
    },
    {
      phase: 'Divide — no room', say: 'cv', to: 'bd', k: 'pen',
      wire: 'material, not prose',
      log: 'Each job states what material it wants and in what form: facts, measurements, and drafts marked as drafts.',
      prop: { bd: { label: 'jobs 1–3 · material' } },
      note: 'This is the condition the pattern depends on. If the jobs ask for finished sections, the integrator is not integrating, it is rewriting, and the seams between the sections show in the result.'
    },
    {
      phase: 'Produce — a work board', say: 'cv', to: 'room', k: 'broadcast',
      wire: 'BOARD OPEN · 3 jobs',
      log: 'BOARD OPEN: jobs 1–3, with a deadline. Claim what you can hold, deliver against the job id.',
      move: { cv: [0.19, 0.11] },
      prop: { bd: { at: [0.19, 0.92], label: 'jobs 1–3 open' } },
      note: 'The produce phase convenes agentcollab’s work-board, used exactly as written. Workers claim jobs as they free up, and the board hands each job to whoever asks for it first.'
    },
    {
      phase: 'Produce — a work board', say: 'w1', to: 'bd', k: 'direct',
      wire: 'claim job 1',
      log: 'Worker A claims job 1 and holds the lease.',
      set: { w1: 'working' },
      note: 'A claim is a lease, not an assignment. The board records who holds what and until when.'
    },
    {
      phase: 'Produce — a work board', say: 'w2', to: 'bd', k: 'direct',
      wire: 'claim job 2',
      log: 'Worker B claims job 2.',
      set: { w2: 'working' },
      prop: { bd: { label: 'job 3 open' } }
    },
    {
      phase: 'A job nobody claims', dur: 3200,
      log: '· job 3 sits on the board past the deadline, unclaimed',
      prop: { bd: { label: 'job 3 · unclaimed' } },
      note: 'The board does not treat this as an error. An unclaimed job simply sits there, which is why the plan gives the board a deadline: without one, nothing ever forces the question.'
    },
    {
      phase: 'A job nobody claims', say: 'cv', to: 'bd', k: 'pen',
      wire: 'job 3 → 3a, 3b',
      log: 'Job 3 is cut into two smaller jobs and reposted.',
      prop: { bd: { label: 'jobs 3a, 3b open' } },
      note: 'When the deadline passes the convener has three choices: cut the job smaller, rewrite what it asks for, or hand it to the synthesizer. Here it gets cut smaller and goes back on the board.'
    },
    {
      phase: 'A job nobody claims', say: 'w3', to: 'bd', k: 'direct',
      wire: 'claim 3a + 3b',
      log: 'Worker C claims both halves.',
      set: { w3: 'working' },
      prop: { bd: { label: 'all claimed' } },
      note: 'Nobody negotiated and nobody was assigned. The job was re-cut until it was small enough for someone to take.'
    },
    {
      phase: 'The handoff', dur: 3400,
      log: '· four deliveries land against job ids 1, 2, 3a and 3b',
      set: { w1: 'done', w2: 'done', w3: 'done' },
      prop: { bd: { label: 'all four delivered' } },
      note: 'The board’s own record is the handoff. It says which jobs were delivered and which are still open, so the synthesizer starts from a list instead of from a conversation.'
    },
    {
      phase: 'Integrate — one pen', dur: 3200,
      log: '· the feeders move into the synthesis room; the synthesizer holds the pen',
      move: { w1: [0.68, 0.48], w2: [0.81, 0.66], w3: [0.94, 0.48] },
      set: { w1: 'idle', w2: 'idle', w3: 'idle', cv: 'out' },
      note: 'The integrate phase convenes rolling-synthesis. One agent holds the pen for the whole deliverable, and the workers who fed it can come and go.'
    },
    {
      phase: 'Integrate — one pen', say: 'sy', to: 'whole', k: 'pen',
      wire: 'draft 1',
      log: 'The material goes in and the deliverable comes out, with one agent holding the whole of it.',
      prop: { whole: { label: 'draft 1' } },
      note: 'Whether the result hangs together is the synthesizer’s call alone. One pen means there is exactly one place to look when it does not.'
    },
    {
      phase: 'Material that does not fit', dur: 3000,
      log: '· Worker B has left, and part of its material does not fit the whole',
      set: { w2: 'out' },
      note: 'Boards attract workers who are only around for a job or two. By the time a gap turns up, the agent who left it may be unreachable, and the pattern assumes that rather than hoping otherwise.'
    },
    {
      phase: 'Material that does not fit', say: 'sy', to: 'bd', k: 'direct',
      wire: 'follow-up job',
      log: 'A follow-up job goes back to the board asking for the measurement that is missing.',
      prop: { bd: { label: 'follow-up job open' } },
      note: 'The synthesizer posts a new job instead of negotiating with the worker who delivered the material. The board is still open, so anyone available can answer it.'
    },
    {
      phase: 'Material that does not fit', say: 'w3', to: 'sy', k: 'direct',
      wire: 'the missing number',
      log: 'Worker C takes the follow-up job and delivers what was missing.',
      prop: { bd: { label: 'closed' } },
      set: { w3: 'done' }
    },
    {
      phase: 'Integrate — one pen', say: 'sy', to: 'whole', k: 'pen',
      wire: 'integrated',
      log: 'DONE · rolling-synthesis: the deliverable, with every job’s material in it.',
      prop: { whole: { label: 'complete' } },
      set: { sy: 'done' },
      note: 'The job ends when the deliverable holds together, not when every worker has finished. Two of the three workers had already moved on.'
    }
  ]
});
