/* Collect and report - ask each named agent one question, merge the
   answers into a report, and deliver the same report to everyone.
   Source: .../patterns/collect-and-report.md   Status: draft v1, untested */

WPSim.register('collect-and-report', {
  title: 'Collect and report',
  tagline: 'Ask each named agent one question, merge the answers into a report, and deliver the same report to everyone who should see it.',
  shape: 'work pattern · ask, merge, deliver',
  hue: 'verify',
  doc: 'https://github.com/jeffrschneider/agentworkpatterns/blob/main/patterns/collect-and-report.md',
  blurb: 'The reporter asks one question, hears each named reporter once, and merges the answers into a document that keeps every claim attributed to the agent who made it. The audience is not the people who answered. This job usually runs on a schedule, and it ships on that schedule whether or not every answer arrived.',
  status: 'draft v1 · untested',
  statusKind: 'planned',
  grade: 'the named reporters must be accounted for; the audience is open',
  problem: 'A weekly status report is due, and three agents each hold a different piece of what happened.',
  contract: {
    inputs: [
      'one question, posted before any answer',
      'the roll: which agents are required to report, and how long to wait for them'
    ],
    membership: 'Hear is not complete until every named reporter has answered or been recorded missing. Deliver is open: observers cost nothing and a latecomer reads the minutes.',
    outputs: [
      'the report, delivered on schedule, every claim attributed',
      'the roll-call answers, including the ones that never came'
    ]
  },
  outcome: {
    result: 'the report, delivered on time with two of three answers in it',
    record: 'the roll-call answers and the report itself',
    open: 'Field recorded missing; one contradiction waiting on a decision',
    note: 'The roll call and the briefing are ordinary agentcollab patterns. The work pattern supplied the rest: it kept the attribution through the merge, named the reporter who never answered, recorded the contradiction instead of resolving it, and shipped on the day the schedule said.'
  },
  rooms: [
    { x0: 40, y0: 44, x1: 288, y1: 336, label: 'room · hear — roll-call' },
    { x0: 392, y0: 44, x1: 640, y1: 336, label: 'room · deliver — briefing' }
  ],
  zones: [
    { x: 300, y: 26, label: 'no room' },
    { x: 300, y: 38, label: 'the merge' }
  ],
  cast: [
    { id: 'rp', title: 'Reporter', mono: 'RP', role: 'asks, merges, delivers', kind: 'chair', at: [0.21, 0.11] },
    { id: 'r1', title: 'Build', mono: 'BL', role: 'on the roll', kind: 'peer', at: [0.09, 0.47] },
    { id: 'r2', title: 'Support', mono: 'SP', role: 'on the roll', kind: 'peer', at: [0.21, 0.64] },
    { id: 'r3', title: 'Field', mono: 'FD', role: 'on the roll', kind: 'peer', at: [0.33, 0.47] },
    { id: 'u1', title: 'Director', mono: 'DR', role: 'reads the report', kind: 'peer', s: 'out', at: [0.68, 0.47] },
    { id: 'u2', title: 'Planner', mono: 'PL', role: 'reads the report', kind: 'peer', s: 'out', at: [0.92, 0.47] }
  ],
  props: [
    { id: 'roll', type: 'card', kind: 'the roll', label: 'the question', at: [0.19, 0.92], w: 112 },
    { id: 'rep', type: 'artifact', kind: 'the report', label: 'not started', hidden: true, at: [0.5, 0.75], w: 100 }
  ],
  steps: [
    {
      phase: 'Hear — a roll call', say: 'rp', to: 'room', k: 'broadcast',
      wire: 'QUESTION, posted first',
      log: 'CONVENED: roll-call. What shipped this week, and what is at risk? Answer once; nobody comments on anyone else’s answer.',
      note: 'The question goes up before any answer, so that every answer is an answer to the same question. This phase convenes agentcollab’s roll-call, used exactly as written.'
    },
    {
      phase: 'Hear — a roll call', say: 'r1', to: 'roll', k: 'direct',
      wire: 'answer · Build',
      log: 'Build: two of three releases shipped. The third is waiting on a sign-off from Support.',
      set: { r1: 'done' },
      prop: { roll: { label: '1 of 3' } }
    },
    {
      phase: 'Hear — a roll call', say: 'r2', to: 'roll', k: 'direct',
      wire: 'answer · Support',
      log: 'Support: nothing is waiting on us. The third release was never sent for sign-off.',
      set: { r2: 'done' },
      prop: { roll: { label: '2 of 3' } },
      note: 'The two answers contradict each other. Nothing happens about that here: in a roll call each agent answers once, and the contradiction goes into the record as it stands.'
    },
    {
      phase: 'A reporter who does not answer', dur: 3200,
      log: '· Field is on the roll and has not answered; the wait the plan allows runs out',
      set: { r3: 'out' },
      prop: { roll: { label: '2 of 3 · Field missing' } },
      note: 'The plan says how long to wait. When the wait runs out the report names the missing input, because "no report from Field" is information and papering over it is not.'
    },
    {
      phase: 'Synthesize — no room', dur: 3200,
      log: '· the reporter leaves the room to merge the answers into one document',
      move: { rp: [0.5, 0.30] },
      set: { rp: 'working' },
      prop: { rep: { hidden: false, label: 'merging' } },
      note: 'The merge happens in no room at all. Merging means organizing and trimming, not rewriting.'
    },
    {
      phase: 'Synthesize — no room', say: 'rp', to: 'rep', k: 'pen',
      wire: 'attributed, line by line',
      log: 'Every line in the report carries the name of the agent who reported it.',
      prop: { rep: { label: 'attributed' } },
      note: 'Attribution is what makes the report usable afterwards. A reader who doubts a line knows exactly which agent to go and ask about it.'
    },
    {
      phase: 'Synthesize — no room', say: 'rp', to: 'rep', k: 'pen',
      wire: 'the contradiction, both sides',
      log: 'Build and Support disagree about the third release. Both statements go in, attributed to both.',
      prop: { rep: { label: 'contradiction in' } },
      note: 'The report records the contradiction rather than settling it. Settling it is a different job, usually a decide-and-announce, and this line is that job’s input.'
    },
    {
      phase: 'Deliver — a briefing', dur: 3200,
      log: '· the report ships on its schedule, and the audience is not the agents who answered',
      move: { rp: [0.79, 0.11] },
      set: { rp: 'floor', r1: 'out', r2: 'out', u1: 'muted', u2: 'muted' },
      prop: { rep: { at: [0.85, 0.92] } },
      note: 'The report goes out on time with the gap in it, rather than late and complete. On a recurring run that matters more than it looks: a report that slips whenever an answer is missing stops being something anyone can plan around.'
    },
    {
      phase: 'Deliver — a briefing', say: 'rp', to: 'room', k: 'broadcast',
      wire: 'the report, as written',
      log: 'CONVENED: briefing. The reporter reads the report; the room listens.',
      note: 'The deliver phase reads the report out. It does not rewrite it, and everyone who should see it sees the same words.'
    },
    {
      phase: 'Deliver — a briefing', say: 'rp', to: 'room', k: 'broadcast',
      wire: 'no report from Field',
      log: 'The report names the missing input in the place where it would have gone.',
      note: 'The audience learns what is missing at the same moment as what is known, instead of assuming the picture is complete.'
    },
    {
      phase: 'Deliver — a briefing', say: 'rp', to: 'room', k: 'broadcast',
      wire: 'the contradiction, attributed',
      log: 'Build and Support disagree; both statements are in the report with their names on them, and resolving it is a separate job.',
      set: { rp: 'done' },
      prop: { rep: { label: 'delivered' } },
      note: 'The job ends when the report has been delivered, not when the picture is tidy. Next week’s run starts from the same question.'
    }
  ]
});
