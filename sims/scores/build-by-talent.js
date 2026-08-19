/* Build by talent - assign each slice of a deliverable to the specialist
   who can build it, then integrate the slices.
   Source: .../patterns/build-by-talent.md   Status: draft v1, untested */

WPSim.register('build-by-talent', {
  title: 'Build by talent',
  tagline: 'Divide a deliverable among specialists, each building the slice only they can build, then integrate the slices.',
  shape: 'work pattern · spec, build, integrate, review',
  hue: 'address',
  doc: 'https://github.com/jeffrschneider/agentworkpatterns/blob/main/patterns/build-by-talent.md',
  blurb: 'The lead and the specialists write one spec together, stating what each slice promises the others, and freeze it. Each specialist then builds their own slice alone against that frozen version. The lead assembles the slices and the specialists review the seams they depend on. The assignment is not made in any room: it was made in the plan, by talent.',
  status: 'draft v1 · untested',
  statusKind: 'planned',
  grade: 'fixed — cast by talent before any room opened',
  problem: 'A customer-facing feature needs a schema, an interface and its copy, and each of the three has an obvious owner.',
  contract: {
    inputs: [
      'a deliverable that divides along skill lines',
      'a roster written in the plan: each specialist, their slice, and a backup or an accepted delay'
    ],
    membership: 'Fixed by definition. The roster was cast by talent in the plan, so a slice cannot be handed to whoever is free.',
    outputs: [
      'the assembled deliverable, after review',
      'the spec and its versions, and each slice’s delivery naming the version it was built against'
    ]
  },
  outcome: {
    result: 'the assembled feature, reviewed by the specialists who consume its seams',
    record: 'the spec at v1, v2 and v3, the three deliveries, and the review log',
    open: 'nothing — the unspecced seam was reopened and only the slices touching it rebuilt',
    note: 'The rooms ran ordinary agentcollab patterns. The work pattern supplied the rest: it froze and versioned the spec, required each delivery to name the version it was built against, and sent only the slices touching a broken seam back to be rebuilt.'
  },
  rooms: [
    { x0: 40, y0: 44, x1: 288, y1: 336, label: 'room · spec — owner-contributors' },
    { x0: 392, y0: 44, x1: 640, y1: 336, label: 'room · integrate, then review' }
  ],
  zones: [
    { x: 300, y: 26, label: 'no room' },
    { x: 300, y: 38, label: 'private build' }
  ],
  cast: [
    { id: 'ld', title: 'Lead', mono: 'LD', role: 'owns the spec', kind: 'pen', at: [0.21, 0.11] },
    { id: 's1', title: 'Schema', mono: 'SC', role: 'owns this slice', kind: 'peer', at: [0.09, 0.47] },
    { id: 's2', title: 'Interface', mono: 'UI', role: 'owns this slice', kind: 'peer', at: [0.21, 0.64] },
    { id: 's3', title: 'Copy', mono: 'CP', role: 'owns this slice', kind: 'peer', at: [0.33, 0.47] }
  ],
  props: [
    { id: 'spec', type: 'card', kind: 'the spec', label: 'being written', at: [0.21, 0.92], w: 116 },
    { id: 'dl', type: 'artifact', kind: 'the deliverable', label: 'nothing yet', at: [0.83, 0.92], w: 138 }
  ],
  steps: [
    {
      phase: 'Spec — an owner and contributors', say: 'ld', to: 'room', k: 'broadcast',
      wire: 'CONVENED · owner-contributors',
      log: 'CONVENED: owner-contributors. The lead owns the spec; each specialist contributes the part about their own slice.',
      note: 'The roster was cast before this room opened. The plan named each specialist and the slice they own, because handing the schema to the copywriter is not slower, it is wrong.'
    },
    {
      phase: 'Spec — an owner and contributors', say: 's1', to: 'spec', k: 'direct',
      wire: 'schema: what it promises',
      log: 'Schema contributes its slice, and the seam it promises the interface: field names and types.',
      prop: { spec: { label: 'schema section' } },
      note: 'Each specialist writes their own slice into the spec, and more importantly the seams: what their slice promises the others.'
    },
    {
      phase: 'Spec — an owner and contributors', say: 's2', to: 'spec', k: 'direct',
      wire: 'interface: what it needs',
      log: 'Interface states what it needs from the schema, and what it hands to the copy.',
      prop: { spec: { label: 'seams stated' } },
      note: 'A seam has two sides and both get written down here, because once this room closes the specialists work alone.'
    },
    {
      phase: 'The freeze', say: 'ld', to: 'spec', k: 'pen',
      wire: 'FROZEN · v1',
      log: 'The spec is frozen at v1. Build does not start until it is.',
      bump: { spec: 'v1' },
      prop: { spec: { frozen: true, label: 'frozen · seams in' } },
      note: 'Freezing the spec is what makes building alone possible. The version number matters as much as the freeze: every slice will name the version it was built against.'
    },
    {
      phase: 'Build — no room', dur: 3400,
      log: '· each specialist builds their slice privately against v1',
      move: { s1: [0.5, 0.14], s2: [0.5, 0.47], s3: [0.5, 0.80] },
      set: { s1: 'working', s2: 'working', s3: 'working', ld: 'idle' },
      note: 'This phase happens in no room. A slice that needs collaboration of its own opens its own room, and what happens in there is the specialist’s problem, not this plan’s.'
    },
    {
      phase: 'The spec changes mid-build', say: 'ld', to: ['s1', 's2'], k: 'pen',
      wire: 'v2 · one seam changed',
      log: 'SPEC v2: one seam changed. It touches the schema and the interface. The copy is untouched.',
      bump: { spec: 'v2' },
      prop: { spec: { label: 'one seam changed' } },
      note: 'When the spec changes mid-build the lead versions it and names which slices it touches. The specialists it does not touch keep building against what they already have.'
    },
    {
      phase: 'Integrate — the lead assembles', dur: 3200,
      log: '· the specialists deliver into the integrate room; the lead holds the pen',
      move: { ld: [0.79, 0.11], s1: [0.64, 0.42], s2: [0.79, 0.64], s3: [0.94, 0.42] },
      set: { s1: 'idle', s2: 'idle', s3: 'idle', ld: 'floor' },
      role: { ld: 'assembles the slices' },
      note: 'The integrate phase convenes rolling-synthesis. The lead assembles, and the specialists feed it their slices.'
    },
    {
      phase: 'Integrate — the lead assembles', say: 's1', to: 'dl', k: 'direct',
      wire: 'schema slice · built on v2',
      log: 'Schema delivers, against v2.',
      prop: { dl: { label: 'schema in' } },
      set: { s1: 'done' }
    },
    {
      phase: 'Integrate — the lead assembles', say: 's2', to: 'dl', k: 'direct',
      wire: 'interface slice · v2',
      log: 'Interface delivers, against v2.',
      prop: { dl: { label: 'schema + interface' } },
      set: { s2: 'done' }
    },
    {
      phase: 'Integrate — the lead assembles', say: 's3', to: 'dl', k: 'direct',
      wire: 'copy slice · v1',
      log: 'Copy delivers, against v1 — the version it was told to build on.',
      prop: { dl: { label: 'all three slices' } },
      set: { s3: 'done' },
      note: 'Every delivery names the version it was built against. That is what makes a slice built on a superseded spec visible instead of quietly wrong.'
    },
    {
      phase: 'A seam nobody specced', say: 'ld', to: ['s2', 's3'], k: 'direct',
      wire: 'seam: copy ↔ interface',
      log: 'The copy and the interface meet at a seam that neither of them promised anything about.',
      set: { s2: 'idle', s3: 'idle' },
      note: 'Two slices meet and neither owes the other what it needs. This is the failure the spec phase exists to prevent, and it still happens, so the pattern says what to do about it.'
    },
    {
      phase: 'A seam nobody specced', say: 'ld', to: 'spec', k: 'pen',
      wire: 'v3 · that seam only',
      log: 'SPEC v3: the missing seam, and nothing else.',
      bump: { spec: 'v3' },
      prop: { spec: { label: 'seam patched' } },
      note: 'Only the slices touching the seam rebuild. The schema was never involved, so its delivery stands and its owner is not called back.'
    },
    {
      phase: 'A seam nobody specced', say: 's3', to: 'dl', k: 'direct',
      wire: 'copy · rebuilt on v3',
      log: 'Copy and interface rebuild against v3 and redeliver.',
      prop: { dl: { label: 'assembled' } },
      set: { s2: 'done', s3: 'done' }
    },
    {
      phase: 'Review — a critique circle', say: 'ld', to: 'room', k: 'broadcast',
      wire: 'CONVENED · critique-circle',
      log: 'CONVENED: critique-circle on the assembled deliverable.',
      note: 'The last phase opens a second room. Each specialist is cast to review the seams they consume rather than the slice they built, so nobody is reviewing their own work.'
    },
    {
      phase: 'Review — a critique circle', say: 's1', to: 'ld', k: 'direct',
      wire: 'MUST-FIX · one field name',
      log: 'Schema reviews the interface seam it consumes: one field name does not match the spec.',
      note: 'The critique circle runs as agentcollab writes it, including its MUST-FIX and SHOULD-FIX grades. The work pattern only decided who reviews what.'
    },
    {
      phase: 'Review — a critique circle', say: 'ld', to: 'dl', k: 'pen',
      wire: 'fixed · reviewed',
      log: 'DONE · the assembled deliverable, reviewed, with the field name corrected.',
      prop: { dl: { label: 'reviewed' } },
      set: { ld: 'done' },
      note: 'The job ends with a deliverable that the specialists who depend on its seams have read. If the lead had refused a MUST-FIX, that refusal would close the job as an open item.'
    }
  ]
});
