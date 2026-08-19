/* Train and certify - teach a group of agents some material, then score
   each one against a standard.
   Source: .../patterns/train-and-certify.md   Status: draft v1, untested */

WPSim.register('train-and-certify', {
  title: 'Train and certify',
  tagline: 'Teach a group of agents some material, then score each one against a published standard. Everyone can pass.',
  shape: 'work pattern · teach, then examine',
  hue: 'verify',
  doc: 'https://github.com/jeffrschneider/agentworkpatterns/blob/main/patterns/train-and-certify.md',
  blurb: 'Two rooms and the stretch between them. The teach phase is a plain agentcollab briefing; the certify phase scores each trainee against a frozen standard. What this pattern owns is the handoff, the roster freeze, and what happens when someone fails.',
  status: 'draft v1 · untested',
  statusKind: 'planned',
  grade: 'open through teach, frozen at the criteria',
  problem: 'Three ops agents must learn the new release process and prove they know it before any of them touches production.',
  contract: {
    inputs: [
      'the material the trainer will present, in order',
      'a standard to score against — written from the minutes, frozen before the exam'
    ],
    membership: 'Anyone can join the cohort until the criteria are published, by reading the minutes. After that the roster is frozen until the scores post.',
    outputs: [
      'a score for each trainee, pass or fail — this is not a contest',
      'the minutes and the scored submissions, as the record'
    ]
  },
  outcome: {
    result: 'three certified agents — one of them on the second try',
    record: 'the minutes from teach, and each scored submission from certify',
    open: 'nothing — the failed trainee was re-briefed and passed',
    note: 'Two agentcollab patterns did all the room work. What the work pattern added is everything between them: the handoff, the freeze, the refused latecomer, and the failure edge.'
  },
  rooms: [
    { x0: 40, y0: 44, x1: 288, y1: 336, label: 'room · teach — briefing v1' },
    { x0: 392, y0: 44, x1: 640, y1: 336, label: 'room · certify — assessment' }
  ],
  zones: [
    { x: 340, y: 26, label: 'no room' },
    { x: 340, y: 38, label: 'private study' }
  ],
  cast: [
    { id: 'tr', title: 'Trainer', mono: 'TR', role: 'facilitator', kind: 'chair', at: [0.21, 0.11] },
    { id: 'ex', title: 'Examiner', mono: 'EX', role: 'holds the verdict', kind: 'pen', at: [0.79, 0.11] },
    { id: 'o1', title: 'Ops Agent 1', mono: 'O1', role: 'trainee', kind: 'peer', at: [0.09, 0.47] },
    { id: 'o2', title: 'Ops Agent 2', mono: 'O2', role: 'trainee', kind: 'peer', at: [0.21, 0.64] },
    { id: 'o3', title: 'Ops Agent 3', mono: 'O3', role: 'trainee', kind: 'peer', at: [0.33, 0.47] },
    { id: 'lc', title: 'Latecomer', mono: 'LC', role: 'turned away', kind: 'peer', s: 'out', at: [0.5, 0.93] }
  ],
  props: [
    { id: 'min', type: 'card', kind: 'the record', label: 'minutes', at: [0.15, 0.92], w: 100 },
    { id: 'crit', type: 'card', kind: 'the standard', label: 'not written yet', at: [0.85, 0.92], w: 132 }
  ],
  steps: [
    {
      phase: 'Teach — a briefing', say: 'tr', to: { at: [0.21, 0.45] }, k: 'broadcast',
      wire: 'RULES: briefing',
      log: 'RULES: This room is a briefing. The trainer presents; trainees listen only. The record is the minutes.',
      set: { o1: 'muted', o2: 'muted', o3: 'muted' },
      note: 'The first phase is nothing new. It is agentcollab’s briefing pattern, run exactly as written: the trainer presents, the trainees only listen.'
    },
    {
      phase: 'Teach — a briefing', say: 'tr', to: { at: [0.21, 0.45] }, k: 'broadcast',
      wire: 'item 1: the release steps',
      log: 'Briefing item 1: the release steps, in order, and who signs off at each one.',
      prop: { min: { label: 'item 1' } },
      note: 'Numbered items, one post each. The minutes build as the trainer posts.'
    },
    {
      phase: 'Teach — a briefing', say: 'tr', to: { at: [0.21, 0.45] }, k: 'broadcast',
      wire: 'item 2: the rollback rule',
      log: 'Briefing item 2: when a release goes wrong, roll back first and diagnose after.',
      prop: { min: { label: 'items 1–2' } },
      note: 'The minutes matter more here than in most briefings: they are the study text for the exam, and the exam may only test what they cover.'
    },
    {
      phase: 'The handoff', say: 'tr', to: { at: [0.21, 0.45] }, k: 'broadcast',
      wire: 'DONE · briefing v1',
      log: 'DONE · pattern: briefing v1\noutcome: completed\nresult: the minutes, items 1–2',
      set: { tr: 'done' },
      note: 'The teach phase closes with its DONE record. Its result — the minutes — is the artifact that crosses the phase boundary. This handoff is the work pattern’s job, not the briefing’s.'
    },
    {
      phase: 'No room', dur: 3400,
      log: '· between phases there is no room: each trainee studies the minutes privately',
      move: { o1: [0.44, 0.40], o2: [0.5, 0.62], o3: [0.56, 0.40] },
      set: { o1: 'working', o2: 'working', o3: 'working', tr: 'out' },
      prop: { min: { at: [0.5, 0.16] } },
      note: 'A phase does not have to convene a room. Studying leaves no record, so the plan says what stands in for one — here, the exam itself.'
    },
    {
      phase: 'Certify — an assessment', say: 'ex', to: 'crit', k: 'pen',
      wire: 'CRITERIA: five checks',
      log: 'CRITERIA: five checks, drawn from the minutes and nothing else.',
      prop: { crit: { label: 'five checks' } },
      note: 'The examiner writes the standard from the minutes and nothing else. Wanting to test something the trainer never taught is a gap in the teach phase, not a harder exam.'
    },
    {
      phase: 'The roster freezes', say: 'ex', to: 'crit', k: 'pen',
      wire: 'FROZEN',
      log: 'The criteria are frozen. The roster freezes with them.',
      prop: { crit: { frozen: true } },
      set: { lc: 'idle' },
      note: 'Published, then frozen — the same discipline as a bake-off brief. And right on cue, someone new turns up.'
    },
    {
      phase: 'The roster freezes', say: 'lc', to: 'ex', k: 'direct',
      wire: 'may I join?',
      log: '@Examiner — may I join the exam?',
      set: { lc: 'out' },
      note: 'No. A job is only as open as its strictest phase: anyone could have joined during teach and read the minutes, but nobody joins an exam in progress. The latecomer waits for the next run.'
    },
    {
      phase: 'The exam', dur: 3000,
      log: '· the trainees enter and answer privately — no trainee sees another’s answers',
      move: { o1: [0.64, 0.42], o2: [0.79, 0.64], o3: [0.94, 0.42] },
      set: { o1: 'working', o2: 'working', o3: 'working' },
      note: 'The assessment borrows bake-off’s machinery — frozen brief, private work, one submission each — but not its verdict. Nobody here is competing.'
    },
    {
      phase: 'The exam', say: 'ex', to: 'o1', k: 'verdict',
      wire: 'pass',
      log: 'score — Ops Agent 1: pass (5 of 5 checks)',
      set: { o1: 'done' },
      note: 'Each trainee is scored against the standard, never against another trainee.'
    },
    {
      phase: 'The exam', say: 'ex', to: 'o2', k: 'verdict',
      wire: 'pass',
      log: 'score — Ops Agent 2: pass (4 of 5, threshold is 4)',
      set: { o2: 'done' },
      note: 'Everyone can pass. If you wanted a ranking and one winner, you wanted a bake-off, not an assessment.'
    },
    {
      phase: 'The exam', say: 'ex', to: 'o3', k: 'verdict',
      wire: 'not yet',
      log: 'score — Ops Agent 3: fail (2 of 5 — missed the rollback rule)',
      set: { o3: 'failed' },
      note: 'One trainee falls short. The pattern already knows what happens next: this is a failure edge, not an improvisation.'
    },
    {
      phase: 'A failure edge', dur: 3000,
      log: '· Ops Agent 3 returns to the teach room; the trainer comes back for one item',
      move: { o3: [0.33, 0.47] },
      set: { o3: 'idle', tr: 'floor' },
      note: 'Re-brief only the failed trainee, on only what it missed. The passing scores stand; the cohort does not repeat the class.'
    },
    {
      phase: 'A failure edge', say: 'tr', to: 'o3', k: 'direct',
      wire: 'item 2, again',
      log: 'Re-brief, item 2 only: roll back first, diagnose after.',
      note: 'A one-item briefing to an audience of one. Same pattern, smaller room.'
    },
    {
      phase: 'A failure edge', say: 'o3', to: 'ex', k: 'direct',
      wire: 'resubmission',
      log: 'Ops Agent 3 resubmits against the same frozen criteria.',
      move: { o3: [0.94, 0.42] },
      set: { o3: 'working', tr: 'out' },
      note: 'Back across the boundary. The criteria did not change — the trainee did.'
    },
    {
      phase: 'A failure edge', say: 'ex', to: 'o3', k: 'verdict',
      wire: 'pass',
      log: 'score — Ops Agent 3: pass (5 of 5 on the second try)',
      set: { o3: 'done' },
      note: 'The job ends when every trainee has a score, not when a winner is known.'
    }
  ]
});
