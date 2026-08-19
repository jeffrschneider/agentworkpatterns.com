/* Decide and announce - hear from everyone who holds a piece of the
   picture, have one agent decide, then tell everyone the same thing.
   Source: .../patterns/decide-and-announce.md   Status: draft v1, untested */

WPSim.register('decide-and-announce', {
  title: 'Decide and announce',
  tagline: 'Hear from everyone who holds a piece of the picture, have one agent decide, then tell everyone the same thing.',
  shape: 'work pattern · hear, decide, announce',
  hue: 'broadcast',
  doc: 'https://github.com/jeffrschneider/agentworkpatterns/blob/main/patterns/decide-and-announce.md',
  blurb: 'The owner posts a question and hears each agent once, decides alone with the answers in front of them, and then tells everyone the same thing at the same time. The decision itself happens in no room. The rooms exist to produce the record it was made on, and the record that it was made.',
  status: 'draft v1 · untested',
  statusKind: 'planned',
  grade: 'the owner’s seat never changes hands',
  problem: 'The release window collides with an audit, and one agent has to decide whether it moves.',
  contract: {
    inputs: [
      'a question, posted before anyone answers it',
      'the list of agents whose answers are required, and how long the owner waits for them'
    ],
    membership: 'Hear is not complete until the named agents have spoken. Announce is open, and a latecomer reads the minutes. The owner’s seat is the one that cannot change hands mid-job.',
    outputs: [
      'the decision, written with its reasons and announced identically to everyone',
      'the roll-call answers and the minutes of the announcement'
    ]
  },
  outcome: {
    result: 'the release window moves by one week, announced with its reasons',
    record: 'the roll-call answers, and the minutes of the announcement',
    open: 'Security’s objection, named in the announcement; Finance never answered',
    note: 'The roll call and the briefing are ordinary agentcollab patterns. The work pattern supplied the rest: it carried the answers to a phase with no room, made the owner write the decision down before the announce room opened, and required the dissent and the missing answer to be named out loud.'
  },
  rooms: [
    { x0: 40, y0: 44, x1: 288, y1: 336, label: 'room · hear — roll-call' },
    { x0: 392, y0: 44, x1: 640, y1: 336, label: 'room · announce — briefing' }
  ],
  zones: [
    { x: 300, y: 26, label: 'no room' },
    { x: 300, y: 38, label: 'the owner decides' }
  ],
  cast: [
    { id: 'ow', title: 'Owner', mono: 'OW', role: 'owns the decision', kind: 'chair', at: [0.21, 0.11] },
    { id: 'a1', title: 'Ops', mono: 'OP', role: 'holds a piece', kind: 'peer', at: [0.09, 0.47] },
    { id: 'a2', title: 'Security', mono: 'SE', role: 'holds a piece', kind: 'peer', at: [0.21, 0.64] },
    { id: 'a3', title: 'Finance', mono: 'FI', role: 'must answer', kind: 'peer', at: [0.33, 0.47] }
  ],
  props: [
    { id: 'rec', type: 'card', kind: 'the record', label: 'the question', at: [0.19, 0.92], w: 100 },
    { id: 'dec', type: 'artifact', kind: 'the decision', label: 'not written yet', at: [0.5, 0.93], w: 100 }
  ],
  steps: [
    {
      phase: 'Hear — a roll call', say: 'ow', to: 'room', k: 'broadcast',
      wire: 'QUESTION, posted first',
      log: 'CONVENED: roll-call. Does the release window move? Answer once; nobody rebuts anybody.',
      note: 'The first phase convenes agentcollab’s roll-call. The question goes up before any answer, so that every answer is an answer to the same question.'
    },
    {
      phase: 'Hear — a roll call', say: 'a1', to: 'rec', k: 'direct',
      wire: 'yes, and why',
      log: 'Ops: the window has to move. The migration lands inside it.',
      set: { a1: 'done' },
      prop: { rec: { label: '1 answer' } }
    },
    {
      phase: 'Hear — a roll call', say: 'a2', to: 'rec', k: 'direct',
      wire: 'no, and why',
      log: 'Security: the window cannot move. The audit closes on the same day.',
      set: { a2: 'done' },
      prop: { rec: { label: '2 answers, in conflict' } },
      note: 'The two answers conflict. In a roll call that is not something to settle in the room: nobody rebuts anybody, and the conflict goes into the record as it stands.'
    },
    {
      phase: 'An answer that never comes', dur: 3200,
      log: '· Finance is required to answer and has not; the wait the plan allows runs out',
      set: { a3: 'out' },
      prop: { rec: { label: '2 of 3 · Finance missing' } },
      note: 'The plan says how long the owner waits for a required answer and whether the decision may go ahead without it. Here it may, and the announcement will have to say whose input was missing.'
    },
    {
      phase: 'Decide — no room', dur: 3200,
      log: '· the record crosses into a phase with no room, and the owner decides alone',
      move: { ow: [0.5, 0.30] },
      set: { ow: 'working' },
      prop: { rec: { at: [0.5, 0.66] } },
      note: 'The decision itself happens in no room at all. The rooms exist to produce the record the decision is made on, and the record that it was made.'
    },
    {
      phase: 'Decide — no room', say: 'ow', to: 'dec', k: 'pen',
      wire: 'the decision, with reasons',
      log: 'DECISION: the window moves by one week. Reasons: the migration cannot be split, and the audit can be rescheduled.',
      prop: { dec: { label: 'written, with reasons' } },
      note: 'The owner writes the decision and its reasons down before opening the next room. Writing it first is what keeps announcing from turning into deciding out loud.'
    },
    {
      phase: 'Announce — a briefing', dur: 3200,
      log: '· the announce room opens, and everyone in it hears the same words at the same time',
      move: { ow: [0.79, 0.11], a1: [0.64, 0.42], a2: [0.79, 0.64] },
      set: { ow: 'floor', a1: 'muted', a2: 'muted' },
      prop: { dec: { at: [0.85, 0.92] } },
      note: 'The last phase convenes a briefing. The owner presents and the room listens, which is what keeps the decision from reaching anyone secondhand.'
    },
    {
      phase: 'Announce — a briefing', say: 'ow', to: 'room', k: 'broadcast',
      wire: 'the decision',
      log: 'The release window moves by one week, effective now, for the reasons on the record.',
      note: 'The announcement carries the reasons, not just the outcome. An agent who has to act on a decision usually needs to know what it was weighing.'
    },
    {
      phase: 'Announce — a briefing', say: 'ow', to: 'room', k: 'broadcast',
      wire: 'the dissent, named',
      log: 'Security advised against this. Its objection is in the minutes, attributed to it.',
      note: 'Naming the dissent is load-bearing. A decision that smooths over who disagreed is much harder to revisit later, and revisiting decisions is normal.'
    },
    {
      phase: 'Announce — a briefing', say: 'ow', to: 'room', k: 'broadcast',
      wire: 'the missing input',
      log: 'Finance was required to answer and did not. The decision went ahead without it.',
      note: 'The announcement says whose input never came, so a reader can weigh the decision knowing what it was missing.'
    },
    {
      phase: 'Announce — a briefing', say: 'ow', to: 'room', k: 'broadcast',
      wire: 'what changes, for whom',
      log: 'Standing instruction: releases hold until the migration reports clean.',
      set: { ow: 'done' },
      note: 'Most decisions change something standing, not just something today. That instruction outlives this job, so the plan lists it as an output rather than leaving it in the minutes.'
    }
  ]
});
