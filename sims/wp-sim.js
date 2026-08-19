/* =======================================================================
   Agent Work Patterns - job simulation engine
   -----------------------------------------------------------------------
   A close relative of agentcollab's AgentSim, with three additions a
   whole job needs and a single meeting does not:

     rooms   a score can draw more than one room frame, plus labels for
             the stretches of the job that happen in no room at all
     move    agents and props can move between rooms as phases hand off
     failed  a state for an agent that fell short of a standard

   A score never contains animation code: it names a cast, some props,
   and an ordered list of steps. A step is one message on the wire, or a
   silent beat:

     { phase, note, say, to, k, wire, log, set, move, bump, prop, dur }

     say    actor id of the speaker            (omit for a silent beat)
     to     'room' | actor id | prop id | {at:[x,y]} | [ids]
     k      broadcast | direct | pen | verdict     (colours the message)
     wire   the literal label that flies
     log    the transcript line
     note   plain English: what this step means
     set    { actorId: state }  idle|floor|muted|working|done|failed|out
     move   { actorId: [x,y] }  lands when the message lands
     prop   { propId: { frozen:true, label:'...', at:[x,y], hidden:true } }

   Effects land when the message ARRIVES, not when it is sent.
   ======================================================================= */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var SCORES = {};

  /* stage geometry -------------------------------------------------- */
  var VB = { w: 680, h: 404 };
  var BOX = { x0: 40, x1: 640, y0: 44, y1: 336 };
  var R = 23;
  var FLIGHT = 0.58;
  var DUR_MSG = 2450, DUR_BEAT = 1750, DUR_BRIEF = 6200, DUR_OUT = 5200;

  var KCOLOR = {
    broadcast: 'var(--broadcast)', direct: 'var(--address)',
    pen: 'var(--signal)', verdict: 'var(--verify)'
  };
  var KIND_COLOR = {
    chair: 'var(--chair)', pen: 'var(--pen)',
    peer: 'var(--peer)', object: 'var(--object)'
  };

  function at(p) {
    return { x: BOX.x0 + p[0] * (BOX.x1 - BOX.x0), y: BOX.y0 + p[1] * (BOX.y1 - BOX.y0) };
  }
  function svg(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function html(tag, cls, parent, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------------------------------------------------------------- */
  /* framing: every run opens on the brief and closes on what came out  */
  /* ---------------------------------------------------------------- */
  function frame(S) {
    if (S._framed) return S;
    var steps = S.steps.slice();
    if (S.problem) steps.unshift({
      phase: 'The setup', panel: 'brief', dur: DUR_BRIEF,
      log: '· setup: the problem, who is here, and what goes in and out',
      note: S.setupNote || 'What you need before you start, and what you should ' +
        'have once it is finished.'
    });
    if (S.outcome) steps.push({
      phase: 'What came out', panel: 'outcome', dur: DUR_OUT,
      log: '· result / record / open — the three things this job produced',
      note: S.outNote || 'A job leaves three things behind: the <b>result</b> you ' +
        'wanted, a <b>record</b> of how it was decided, and a list of anything still ' +
        '<b>open</b> that nobody finished.'
    });
    S.steps = steps;
    S._framed = true;
    return S;
  }

  /* ---------------------------------------------------------------- */
  /* derived state: replay effects 0..i so scrubbing is always correct */
  /* ---------------------------------------------------------------- */
  function baseState(score) {
    var st = { nodes: {}, props: {} };
    score.cast.forEach(function (c) {
      st.nodes[c.id] = { s: c.s || 'idle', role: c.role, kind: c.kind, at: c.at.slice() };
    });
    (score.props || []).forEach(function (p) {
      st.props[p.id] = {
        version: p.version, frozen: !!p.frozen, label: p.label,
        hidden: !!p.hidden, at: p.at.slice()
      };
    });
    return st;
  }

  function applyStep(st, step) {
    var k;
    if (step.set) for (k in step.set) if (st.nodes[k]) st.nodes[k].s = step.set[k];
    if (step.role) for (k in step.role) if (st.nodes[k]) st.nodes[k].role = step.role[k];
    if (step.kind) for (k in step.kind) if (st.nodes[k]) st.nodes[k].kind = step.kind[k];
    if (step.move) for (k in step.move) if (st.nodes[k]) st.nodes[k].at = step.move[k].slice();
    if (step.bump) for (k in step.bump) if (st.props[k]) st.props[k].version = step.bump[k];
    if (step.prop) for (k in step.prop) if (st.props[k]) {
      var patch = step.prop[k];
      for (var kk in patch) st.props[k][kk] = kk === 'at' ? patch[kk].slice() : patch[kk];
    }
  }

  function stateAt(score, idx, landed) {
    var st = baseState(score);
    for (var i = 0; i <= idx; i++) {
      if (i === idx && !landed) break;
      applyStep(st, score.steps[i]);
    }
    return st;
  }

  /* ---------------------------------------------------------------- */
  /* the simulation                                                    */
  /* ---------------------------------------------------------------- */
  function Sim(host, score) {
    this.score = score;
    this.host = host;
    this.i = 0; this.t = 0; this.landed = false;
    this.playing = false; this.speed = 1; this.raf = null; this.last = 0;
    this.nodes = {}; this.props = {};
    this.reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.build();
    this.go(0, true);
  }

  Sim.prototype.build = function () {
    var S = this.score, self = this;
    this.host.className = 'acsim';
    this.host.style.setProperty('--hue', 'var(--' + (S.hue || 'verify') + ')');
    this.host.setAttribute('tabindex', '0');
    this.host.innerHTML = '';

    /* header */
    var head = html('div', 'acsim-head', this.host);
    html('div', 'acsim-tag', head, S.shape || 'work pattern');
    html('h3', 'acsim-name', head, S.title);
    html('p', 'acsim-line', head, S.blurb || S.tagline);
    if (S.status || S.grade) {
      var meta = html('div', 'acsim-meta', head);
      if (S.status) html('span', 'acsim-status ' + (S.statusKind || ''), meta, S.status);
      if (S.grade) html('span', 'acsim-grade', meta, 'roster: ' + S.grade);
    }
    if (S.doc) {
      var a = html('a', 'acsim-doc', head, 'read the pattern ↗');
      a.href = S.doc;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }

    /* body */
    var body = html('div', 'acsim-body', this.host);
    var stage = html('div', 'acsim-stage', body);
    var root = svg('svg', {
      viewBox: '0 0 ' + VB.w + ' ' + VB.h, role: 'img',
      'aria-label': S.title + ' simulation'
    }, stage);
    this.svg = root;

    /* room frames: a job can span more than one room */
    (S.rooms || [{ x0: 20, y0: 20, x1: VB.w - 20, y1: VB.h - 20, label: S.room || 'agentworkpatterns' }])
      .forEach(function (rm) {
        svg('rect', {
          class: 'acr-frame', x: rm.x0, y: rm.y0,
          width: rm.x1 - rm.x0, height: rm.y1 - rm.y0, rx: 10
        }, root);
        svg('text', { class: 'acr-label', x: rm.x0 + 12, y: rm.y0 - 8 }, root)
          .textContent = rm.label;
      });
    (S.zones || []).forEach(function (z) {
      svg('text', { class: 'wpz', x: z.x, y: z.y }, root).textContent = z.label;
    });

    this.gWave = svg('g', {}, root);
    this.gProp = svg('g', {}, root);
    this.gNode = svg('g', {}, root);
    this.gMsg = svg('g', {}, root);

    (S.props || []).forEach(function (p) { self.buildProp(p); });
    S.cast.forEach(function (c) { self.buildNode(c); });

    this.pBrief = html('div', 'acsim-panel', stage);
    this.pOut = html('div', 'acsim-panel', stage);
    this.buildPanels();

    /* transcript */
    var log = html('div', 'acsim-log', body);
    var logIn = html('div', 'acsim-log-in', log);
    html('div', 'acsim-log-h', logIn, 'transcript');
    this.logBox = logIn;
    this.logLines = S.steps.map(function (st) {
      var l = html('div', 'acsim-log-l', logIn);
      l.style.setProperty('--k', KCOLOR[st.k] || 'var(--dim)');
      var who = st.say ? (self.castOf(st.say) || {}).mono : '·';
      html('span', 'acsim-log-w', l, who || '·');
      var txt = st.log || st.wire || '';
      if (!st.say) txt = txt.replace(/^·\s*/, '');
      html('span', 'acsim-log-t', l, txt);
      return l;
    });

    /* caption */
    var cap = html('div', 'acsim-cap', this.host);
    this.phaseEl = html('div', 'acsim-phase', cap);
    this.noteEl = html('p', 'acsim-note', cap);

    /* controls */
    var ctl = html('div', 'acsim-ctl', this.host);
    this.bBack = html('button', 'acsim-btn', ctl, '◀');
    this.bBack.title = 'previous step';
    this.bPlay = html('button', 'acsim-btn play', ctl, '▶');
    this.bPlay.title = 'play / pause';
    this.bFwd = html('button', 'acsim-btn', ctl, '▶▎');
    this.bFwd.title = 'next step';

    var scrub = html('div', 'acsim-scrub', ctl);
    this.ticks = S.steps.map(function (st, n) {
      var b = html('button', 'acsim-tick', scrub);
      b.title = (st.phase || '') + ' — ' + (st.log || st.wire || 'beat');
      b.addEventListener('click', function () { self.pause(); self.go(n, true); });
      return b;
    });

    this.bSpeed = html('button', 'acsim-btn', ctl, '1×');
    this.bSpeed.title = 'speed';
    this.countEl = html('span', 'acsim-count', ctl, '');

    this.bPlay.addEventListener('click', function () { self.toggle(); });
    this.bBack.addEventListener('click', function () { self.pause(); self.go(Math.max(0, self.i - 1), true); });
    this.bFwd.addEventListener('click', function () {
      self.pause();
      if (self.i >= S.steps.length - 1) self.go(0, true); else self.go(self.i + 1, true);
    });
    this.bSpeed.addEventListener('click', function () {
      self.speed = self.speed === 1 ? 1.75 : self.speed === 1.75 ? 0.55 : 1;
      self.bSpeed.textContent = (self.speed === 0.55 ? '0.5' : self.speed === 1.75 ? '1.75' : '1') + '×';
    });
    this.host.addEventListener('keydown', function (e) {
      if (e.key === ' ') { e.preventDefault(); self.toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); self.pause(); self.go(Math.min(S.steps.length - 1, self.i + 1), true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); self.pause(); self.go(Math.max(0, self.i - 1), true); }
    });

    /* only run while on screen */
    if (global.IntersectionObserver) {
      this.io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) { if (!self.userPaused && !self.ended) self.play(); }
          else self.pause(true);
        });
      }, { threshold: 0.35 });
      this.io.observe(this.host);
    }
  };

  Sim.prototype.buildPanels = function () {
    var S = this.score, C = S.contract || {}, O = S.outcome || {};
    function lines(a) {
      return (a || []).map(function (t) {
        var i = t.indexOf(':');
        return i < 0 ? '<div class="acsim-pl">' + t + '</div>'
          : '<div class="acsim-pl"><b>' + t.slice(0, i + 1) + '</b>' + t.slice(i + 1) + '</div>';
      }).join('');
    }
    if (S.problem) {
      var who = S.cast.map(function (c) {
        return '<div class="acsim-who" style="--c:' + (KIND_COLOR[c.kind] || 'var(--peer)') + '">' +
          '<span class="m">' + c.mono + '</span>' +
          '<span class="t">' + c.title + '<em>' + (c.role || '') + '</em></span></div>';
      }).join('');
      this.pBrief.innerHTML =
        '<div class="acsim-ph">sample problem</div>' +
        '<p class="acsim-pp">' + S.problem + '</p>' +
        '<div class="acsim-pcols">' +
          '<div><div class="acsim-ph2">attending</div>' + who + '</div>' +
          '<div><div class="acsim-ph2">inputs</div>' + lines(C.inputs) +
            (C.membership ? '<div class="acsim-ph2" style="margin-top:11px">roster</div>' +
              '<div class="acsim-pl acsim-mem">' + C.membership + '</div>' : '') + '</div>' +
          '<div><div class="acsim-ph2">outputs</div>' + lines(C.outputs) + '</div>' +
        '</div>';
    }
    if (S.outcome) {
      this.pOut.innerHTML =
        '<div class="acsim-ph">what came out</div>' +
        '<div class="acsim-pout">' +
          lines(['result: ' + (O.result || ''), 'record: ' + (O.record || ''),
                 'open: ' + (O.open || 'none')]) +
        '</div>' +
        (O.note ? '<p class="acsim-pp acsim-pnote">' + O.note + '</p>' : '');
    }
  };

  Sim.prototype.castOf = function (id) {
    return this.score.cast.filter(function (c) { return c.id === id; })[0];
  };

  /* -- agent node: drawn at the origin, placed by transform ----------- */
  Sim.prototype.buildNode = function (c) {
    var p = at(c.at);
    var g = svg('g', { class: 'acn', 'data-s': c.s || 'idle' }, this.gNode);
    g.style.setProperty('--c', KIND_COLOR[c.kind] || 'var(--peer)');
    g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
    svg('circle', { class: 'acn-flash', cx: 0, cy: 0, r: R + 2 }, g);
    svg('circle', { class: 'acn-ring', cx: 0, cy: 0, r: R + 5 }, g);
    svg('circle', { class: 'acn-disc', cx: 0, cy: 0, r: R }, g);
    svg('text', { class: 'acn-mono', x: 0, y: 0 }, g).textContent = c.mono;
    svg('text', { class: 'acn-name', x: 0, y: R + 15 }, g).textContent = c.title;
    var role = svg('text', { class: 'acn-role', x: 0, y: R + 27 }, g);
    role.textContent = c.role || '';
    // State marks are drawn, not typed: a glyph here gets picked up by
    // copy-paste and by screen readers, where it reads as loose punctuation.
    var bx = R - 4, by = -R + 3;
    var mark = function (cls) {
      return svg('g', { class: 'acn-badge ' + cls, 'aria-hidden': 'true' }, g);
    };
    svg('line', { x1: bx - 4, y1: by, x2: bx + 4, y2: by }, mark('mute'));
    var wk = mark('work');
    [-4, 0, 4].forEach(function (dx) { svg('circle', { cx: bx + dx, cy: by, r: 1.3 }, wk); });
    svg('path', { d: 'M' + (bx - 4) + ' ' + by + 'l3 3l5.5 -6.5' }, mark('done'));
    var fl = mark('fail');
    svg('line', { x1: bx - 4, y1: by - 4, x2: bx + 4, y2: by + 4 }, fl);
    svg('line', { x1: bx - 4, y1: by + 4, x2: bx + 4, y2: by - 4 }, fl);
    this.nodes[c.id] = { g: g, role: role, p: p };
  };

  /* -- props: drawn at the origin, placed by transform ---------------- */
  Sim.prototype.buildProp = function (pr) {
    var p = at(pr.at);
    var g = svg('g', { class: 'acp' }, this.gProp);
    g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
    var rec = { g: g, p: p, type: pr.type, def: pr };

    var W = pr.w || 138, H = pr.type === 'artifact' ? 50 : 46;
    svg('rect', { class: 'acp-bump', x: -W / 2 - 5, y: -H / 2 - 5, width: W + 10, height: H + 10, rx: 10 }, g);
    svg('rect', { class: 'acp-box', x: -W / 2, y: -H / 2, width: W, height: H, rx: 8 }, g);
    svg('text', { class: 'acp-kind', x: -W / 2 + 11, y: -H / 2 + 15 }, g)
      .textContent = pr.kind || pr.type;
    rec.label = svg('text', { class: 'acp-label', x: -W / 2 + 11, y: -H / 2 + 30 }, g);
    rec.label.textContent = pr.label || '';
    rec.ver = svg('text', { class: 'acp-ver', x: -W / 2 + 11, y: -H / 2 + 42 }, g);
    rec.frozen = svg('text', { class: 'acp-frozen', x: W / 2 - 11, y: -H / 2 + 15 }, g);
    rec.frozen.setAttribute('text-anchor', 'end');
    rec.frozen.textContent = 'FROZEN';
    this.props[pr.id] = rec;
  };

  Sim.prototype.paint = function (st, speaker) {
    var k;
    for (k in this.nodes) {
      var n = this.nodes[k], s = st.nodes[k];
      n.g.setAttribute('data-s', (speaker === k && s.s !== 'out' && s.s !== 'muted') ? 'speaking' : s.s);
      if (n.role.textContent !== (s.role || '')) n.role.textContent = s.role || '';
      n.g.style.setProperty('--c', KIND_COLOR[s.kind] || 'var(--peer)');
      var np = at(s.at);
      if (np.x !== n.p.x || np.y !== n.p.y) {
        n.g.setAttribute('transform', 'translate(' + np.x + ',' + np.y + ')');
        n.p = np;
      }
    }
    for (k in this.props) {
      var P = this.props[k], sp = st.props[k];
      if (!sp) continue;
      P.g.setAttribute('data-frozen', sp.frozen ? '1' : '0');
      P.g.style.opacity = sp.hidden ? 0 : 1;
      if (P.label) P.label.textContent = sp.label || '';
      if (P.ver) P.ver.textContent = !sp.version ? ''
        : /\s/.test(sp.version) ? sp.version : '@ ' + sp.version;
      var pp = at(sp.at);
      if (pp.x !== P.p.x || pp.y !== P.p.y) {
        P.g.setAttribute('transform', 'translate(' + pp.x + ',' + pp.y + ')');
        P.p = pp;
      }
    }
  };

  /* -- message flight ------------------------------------------------ */
  Sim.prototype.anchor = function (id) {
    if (id && typeof id === 'object' && id.at) return at(id.at);
    if (id === 'room') return this.score.roomAt ? at(this.score.roomAt)
      : { x: (BOX.x0 + BOX.x1) / 2, y: (BOX.y0 + BOX.y1) / 2 };
    if (this.nodes[id]) return this.nodes[id].p;
    if (this.props[id]) return this.props[id].p;
    return { x: VB.w / 2, y: VB.h / 2 };
  };

  Sim.prototype.spawnMsg = function (step) {
    while (this.gMsg.firstChild) this.gMsg.removeChild(this.gMsg.firstChild);
    this.flights = [];
    if (!step.say || !step.wire) return;
    var from = this.anchor(step.say);
    var tos = Array.isArray(step.to) ? step.to : [step.to || 'room'];
    var col = KCOLOR[step.k] || 'var(--address)';
    var self = this;

    tos.forEach(function (tid, n) {
      var to = self.anchor(tid);
      var g = svg('g', { class: 'acm' }, self.gMsg);
      g.style.setProperty('--k', col);
      var rect = svg('rect', { class: 'acm-pill', x: 0, y: -9, height: 18, rx: 9 }, g);
      var txt = svg('text', { class: 'acm-text', x: 0, y: 0 }, g);
      txt.textContent = step.wire;
      var w = 0;
      try { w = txt.getComputedTextLength(); } catch (e) { }
      if (!w) w = step.wire.length * 5.5;
      w = Math.max(46, w + 20);
      rect.setAttribute('x', -w / 2); rect.setAttribute('width', w);
      var dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy) || 1;
      var lift = Math.min(46, len * 0.19) * (n % 2 ? -1 : 1);
      var ctrl = { x: (from.x + to.x) / 2 - dy / len * lift, y: (from.y + to.y) / 2 + dx / len * lift };
      // born at the speaker, invisible: no frame may show a pill at the origin
      g.setAttribute('transform', 'translate(' + from.x + ',' + from.y + ')');
      g.style.opacity = 0;
      self.flights.push({ g: g, from: from, to: to, ctrl: ctrl, target: tid });
    });

    if (step.k === 'broadcast') {
      var wv = svg('circle', { class: 'acm-wave', cx: from.x, cy: from.y, r: 16 }, this.gWave);
      if (!this.reduced) {
        wv.classList.add('on');
        setTimeout(function () { if (wv.parentNode) wv.parentNode.removeChild(wv); }, 1200);
      } else if (wv.parentNode) wv.parentNode.removeChild(wv);
    }
  };

  Sim.prototype.moveMsg = function (p) {
    if (!this.flights) return;
    var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    this.flights.forEach(function (f) {
      var u = 1 - e;
      var x = u * u * f.from.x + 2 * u * e * f.ctrl.x + e * e * f.to.x;
      var y = u * u * f.from.y + 2 * u * e * f.ctrl.y + e * e * f.to.y;
      f.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')');
      f.g.style.opacity = p < 0.06 ? (p / 0.06).toFixed(2) : p > 0.93 ? ((1 - p) / 0.07).toFixed(2) : 1;
    });
  };

  /* -- step machinery ------------------------------------------------ */
  Sim.prototype.durOf = function (step) {
    return (step.dur || (step.wire ? DUR_MSG : DUR_BEAT));
  };

  Sim.prototype.go = function (i, land) {
    var S = this.score;
    this.i = Math.max(0, Math.min(S.steps.length - 1, i));
    this.ended = false;
    var step = S.steps[this.i];
    this.t = land ? this.durOf(step) * 0.99 : 0;
    this.landed = !!land;

    this.phaseEl.textContent = step.phase || '';
    this.noteEl.innerHTML = step.note || '';
    this.pBrief.classList.toggle('on', step.panel === 'brief');
    this.pOut.classList.toggle('on', step.panel === 'outcome');
    this.countEl.textContent = (this.i + 1) + '/' + S.steps.length;
    this.bBack.disabled = this.i === 0;

    var self = this;
    this.ticks.forEach(function (b, n) {
      b.classList.toggle('seen', n < self.i);
      b.classList.toggle('now', n === self.i);
    });
    this.logLines.forEach(function (l, n) {
      var shown = n < self.i || (n === self.i && self.landed);
      l.classList.toggle('in', shown);
      l.classList.toggle('now', n === self.i && shown);
    });
    if (this.landed) this.scrollLog();

    if (land) {
      while (this.gMsg.firstChild) this.gMsg.removeChild(this.gMsg.firstChild);
      this.flights = null;
      this.paint(stateAt(S, this.i, true), null);
    } else {
      this.paint(stateAt(S, this.i, false), step.say);
      this.spawnMsg(step);
      this.moveMsg(0);
    }
  };

  Sim.prototype.land = function () {
    if (this.landed) return;
    this.landed = true;
    var S = this.score, step = S.steps[this.i], self = this;
    this.paint(stateAt(S, this.i, true), step.say);

    var l = this.logLines[this.i];
    l.classList.add('in', 'now');
    this.scrollLog();

    var hits = [];
    var tos = Array.isArray(step.to) ? step.to : [step.to || 'room'];
    if (tos.length === 1 && tos[0] === 'room') {
      S.cast.forEach(function (c) {
        if (c.id !== step.say && stateAt(S, self.i, true).nodes[c.id].s !== 'out') hits.push(c.id);
      });
    } else tos.forEach(function (t) { if (typeof t === 'string' && self.nodes[t]) hits.push(t); });
    hits.forEach(function (id) {
      var g = self.nodes[id].g;
      g.classList.remove('hit'); void g.offsetWidth; g.classList.add('hit');
      setTimeout(function () { g.classList.remove('hit'); }, 850);
    });

    if (step.bump) Object.keys(step.bump).forEach(function (pid) {
      var P = self.props[pid]; if (!P) return;
      P.g.classList.remove('bumped'); void P.g.getBBox; P.g.classList.add('bumped');
      setTimeout(function () { P.g.classList.remove('bumped'); }, 950);
    });
  };

  Sim.prototype.scrollLog = function () {
    var l = this.logLines[this.i];
    if (!l) return;
    var box = this.logBox;
    var top = l.offsetTop - box.clientHeight * 0.55;
    box.scrollTo ? box.scrollTo({ top: top, behavior: 'smooth' }) : (box.scrollTop = top);
  };

  Sim.prototype.tick = function (ts) {
    if (!this.playing) return;
    var dt = this.last ? ts - this.last : 16;
    this.last = ts;
    if (dt > 240) dt = 240;
    this.t += dt * this.speed;

    var step = this.score.steps[this.i], dur = this.durOf(step);
    var landAt = step.wire ? FLIGHT : 0.24;
    var p = Math.min(1, this.t / dur);

    if (step.wire) this.moveMsg(Math.min(1, p / landAt));
    if (p >= landAt) this.land();

    if (p >= 1) {
      if (this.i >= this.score.steps.length - 1) { this.finish(); return; }
      this.go(this.i + 1, false);
    }
    this.raf = requestAnimationFrame(this.tick.bind(this));
  };

  Sim.prototype.play = function () {
    if (this.playing) return;
    var atEnd = this.ended || (this.i >= this.score.steps.length - 1 && this.landed);
    if (atEnd) { this.ended = false; this.go(0, false); }
    this.playing = true; this.userPaused = false; this.last = 0;
    this.bPlay.textContent = '‖';
    this.raf = requestAnimationFrame(this.tick.bind(this));
  };
  Sim.prototype.pause = function (auto) {
    this.playing = false;
    if (!auto) this.userPaused = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.bPlay.textContent = this.ended ? '↺' : '▶';
  };
  Sim.prototype.toggle = function () { this.playing ? this.pause() : this.play(); };
  Sim.prototype.finish = function () {
    this.playing = false; this.ended = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.bPlay.textContent = '↺';
  };

  /* ---------------------------------------------------------------- */
  var WPSim = {
    register: function (id, score) { score.id = id; SCORES[id] = frame(score); return score; },
    scores: SCORES,
    get: function (id) { return SCORES[id]; },
    mount: function (host, id) {
      var s = SCORES[id];
      if (!s) { host.textContent = 'No score registered for "' + id + '".'; return null; }
      return new Sim(host, s);
    },
    mountAll: function (root) {
      var out = [];
      (root || document).querySelectorAll('[data-sim]').forEach(function (el) {
        out.push(WPSim.mount(el, el.getAttribute('data-sim')));
      });
      return out;
    }
  };

  global.WPSim = WPSim;
})(window);
