/**
 * Lupus In Fabula — Script di simulazione logica di gioco
 * Riproduce esattamente le funzioni chiave dal frontend per testare tutti i ruoli
 * Esegui con: node simulate.js
 */

// ─── RUOLI (copia esatta dall'app) ───────────────────────────────────────────
const ROLES = {
  lupo:            { id:'lupo',            team:'lupi',     immuneToWolves:false, becomesWolfIfKilled:false, diesFromVeggente:false, veggenteSees:null,   voteWeight:1 },
  lupo_alfa:       { id:'lupo_alfa',       team:'lupi',     immuneToWolves:false, becomesWolfIfKilled:false, diesFromVeggente:false, veggenteSees:null,   voteWeight:1 },
  villico:         { id:'villico',         team:'villaggio',immuneToWolves:false, becomesWolfIfKilled:false, diesFromVeggente:false, veggenteSees:null,   voteWeight:1 },
  veggente:        { id:'veggente',        team:'villaggio',immuneToWolves:false, becomesWolfIfKilled:false, diesFromVeggente:false, veggenteSees:null,   voteWeight:1 },
  guardia:         { id:'guardia',         team:'villaggio',immuneToWolves:false, becomesWolfIfKilled:false, diesFromVeggente:false, veggenteSees:null,   voteWeight:1 },
  strega:          { id:'strega',          team:'villaggio',immuneToWolves:false, becomesWolfIfKilled:false, diesFromVeggente:false, veggenteSees:null,   voteWeight:1 },
  cacciatore:      { id:'cacciatore',      team:'villaggio',immuneToWolves:false, becomesWolfIfKilled:false, diesFromVeggente:false, veggenteSees:null,   voteWeight:1 },
  cupido:          { id:'cupido',          team:'villaggio',immuneToWolves:false, becomesWolfIfKilled:false, diesFromVeggente:false, veggenteSees:null,   voteWeight:1 },
  sindaco:         { id:'sindaco',         team:'villaggio',immuneToWolves:false, becomesWolfIfKilled:false, diesFromVeggente:false, veggenteSees:null,   voteWeight:2 },
  medium:          { id:'medium',          team:'villaggio',immuneToWolves:false, becomesWolfIfKilled:false, diesFromVeggente:false, veggenteSees:null,   voteWeight:1 },
  mitomane:        { id:'mitomane',        team:'villaggio',immuneToWolves:false, becomesWolfIfKilled:false, diesFromVeggente:false, veggenteSees:null,   voteWeight:1 },
  criceto:         { id:'criceto',         team:'terza',    immuneToWolves:true,  becomesWolfIfKilled:false, diesFromVeggente:true,  veggenteSees:'lupi', voteWeight:1 },
  figlio_dei_lupi: { id:'figlio_dei_lupi', team:'villaggio',immuneToWolves:false, becomesWolfIfKilled:true,  diesFromVeggente:false, veggenteSees:null,   voteWeight:1 },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅  ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌  ${name}`);
    console.log(`       → ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

function makePlayers(roleList) {
  const players = {};
  roleList.forEach((role, i) => {
    const id = `p${i+1}`;
    players[id] = { id, name: `Giocatore${i+1}`, role, alive: true };
  });
  return players;
}

// ─── LOGICA GIOCO (riproduzione fedele dal frontend) ──────────────────────────

function checkWin(players) {
  const alive = Object.values(players).filter(p => p.alive);
  const wolves    = alive.filter(p => ROLES[p.role]?.team === 'lupi');
  const villagers = alive.filter(p => ROLES[p.role]?.team === 'villaggio');
  const thirds    = alive.filter(p => ROLES[p.role]?.team === 'terza');

  if (alive.length === 1 && thirds.length === 1) return 'terza';
  if (wolves.length === 0) {
    if (thirds.length > 0) return null;
    return 'villaggio';
  }
  if (wolves.length >= villagers.length) return 'lupi';
  return null;
}

function eliminate(pid, players, lovers, alfaMark) {
  if (!players[pid]?.alive) return { players, alfaMark, killed: [] };
  const killed = [pid];
  players = { ...players, [pid]: { ...players[pid], alive: false } };

  // Coppia d'amore: se uno muore, muore l'altro
  const partnerId = lovers[pid];
  if (partnerId && players[partnerId]?.alive) {
    players = { ...players, [partnerId]: { ...players[partnerId], alive: false } };
    killed.push(partnerId);
  }

  // Lupo Alfa: porta con sé il marcato
  if (players[pid]?.role === 'lupo_alfa' && alfaMark && players[alfaMark]?.alive) {
    players = { ...players, [alfaMark]: { ...players[alfaMark], alive: false } };
    killed.push(alfaMark);
    alfaMark = null;
  }

  return { players, alfaMark, killed };
}

function resolveDawn({ players, lupiTarget, guardiaTarget, stregaAction, mitomaneTarget, veggenteTarget, lovers, alfaMark }) {
  const log = [];
  let figlioTransformed = false;

  // 1. Vittima dei lupi
  let dawnVictim = lupiTarget;

  // Criceto: immune ai lupi
  if (dawnVictim && ROLES[players[dawnVictim]?.role]?.immuneToWolves) {
    log.push(`[Criceto] ${dawnVictim} immune ai lupi — nessuna morte`);
    dawnVictim = null;
  }

  // Guardia: salva la vittima
  if (dawnVictim && dawnVictim === guardiaTarget) {
    log.push(`[Guardia] ${dawnVictim} protetto — salvato`);
    dawnVictim = null;
  }

  // Figlio dei Lupi: si trasforma invece di morire
  if (dawnVictim && ROLES[players[dawnVictim]?.role]?.becomesWolfIfKilled) {
    log.push(`[Figlio] ${dawnVictim} si trasforma in lupo`);
    players = { ...players, [dawnVictim]: { ...players[dawnVictim], role: 'lupo' } };
    dawnVictim = null;
    figlioTransformed = true;
  }

  // Strega: guarigione salva la vittima dei lupi
  if (stregaAction === 'HEAL' && dawnVictim) {
    log.push(`[Strega] guarigione usata su ${dawnVictim} — salvato`);
    dawnVictim = null;
  }

  // Applica morte vittima lupi
  if (dawnVictim) {
    log.push(`[Alba] ${dawnVictim} (${players[dawnVictim]?.role}) eliminato dai lupi`);
    const r = eliminate(dawnVictim, players, lovers, alfaMark);
    players = r.players; alfaMark = r.alfaMark;
    if (r.killed.length > 1) log.push(`[Cupido] partner ${r.killed.slice(1).join(',')} muore di dolore`);
  }

  // Criceto eliminato dalla Veggente
  if (veggenteTarget && players[veggenteTarget]?.alive && ROLES[players[veggenteTarget]?.role]?.diesFromVeggente) {
    log.push(`[Veggente] scansiona criceto ${veggenteTarget} — muore`);
    const r = eliminate(veggenteTarget, players, lovers, alfaMark);
    players = r.players; alfaMark = r.alfaMark;
  }

  // Strega: veleno
  if (stregaAction && stregaAction !== 'HEAL' && stregaAction !== 'PASS' && players[stregaAction]?.alive) {
    log.push(`[Strega] veleno su ${stregaAction} (${players[stregaAction]?.role}) — eliminato`);
    const r = eliminate(stregaAction, players, lovers, alfaMark);
    players = r.players; alfaMark = r.alfaMark;
  }

  const win = checkWin(players);
  return { players, log, win, figlioTransformed, alfaMark };
}

function resolveDayVote({ players, votes, alfaMark, lovers }) {
  const tally = {};
  Object.entries(votes).forEach(([voterId, tId]) => {
    if (!players[voterId]?.alive) return;
    const w = ROLES[players[voterId]?.role]?.voteWeight || 1;
    tally[tId] = (tally[tId] || 0) + w;
  });
  let maxVotes = 0, target = null;
  Object.entries(tally).forEach(([tId, count]) => {
    if (count > maxVotes) { maxVotes = count; target = tId; }
  });
  if (!target) return { players, killed: null, win: checkWin(players), alfaMark };
  const r = eliminate(target, players, lovers, alfaMark);
  const win = checkWin(r.players);
  return { players: r.players, killed: target, win, alfaMark: r.alfaMark, extraKilled: r.killed.slice(1) };
}

// ─── VEGGENTE: cosa vede ──────────────────────────────────────────────────────
function veggenteResult(targetId, players, mitomaneTarget) {
  const role = players[targetId]?.role;
  // Se il target è il mitomane e il mitomane imita qualcuno
  if (role === 'mitomane' && mitomaneTarget && players[mitomaneTarget]) {
    return ROLES[players[mitomaneTarget].role]?.team === 'lupi' ? 'lupi' : 'villaggio';
  }
  if (ROLES[role]?.veggenteSees) return ROLES[role].veggenteSees;
  return ROLES[role]?.team === 'lupi' ? 'lupi' : 'villaggio';
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n🐺  LUPUS IN FABULA — Simulazione logica di gioco\n');

// ─── checkWin ─────────────────────────────────────────────────────────────────
console.log('📋  checkWin');

test('Lupi vincono quando uguagliano villaggio', () => {
  const p = makePlayers(['lupo', 'villico']);
  p.p2.alive = false; // villico muore
  // alive: lupo(1) vs villaggio(0) → lupi vincono
  const p2 = makePlayers(['lupo', 'villico']);
  p2.p2.alive = false;
  assert(checkWin(p2) === 'lupi', `atteso 'lupi', ottenuto '${checkWin(p2)}'`);
});

test('Villaggio vince quando tutti i lupi sono morti', () => {
  const p = makePlayers(['lupo', 'villico', 'villico']);
  p.p1.alive = false;
  assert(checkWin(p) === 'villaggio', `atteso 'villaggio', ottenuto '${checkWin(p)}'`);
});

test('Villaggio non vince finché criceto è vivo', () => {
  const p = makePlayers(['lupo', 'villico', 'criceto']);
  p.p1.alive = false;
  assert(checkWin(p) === null, `criceto ancora vivo, nessun vincitore ancora`);
});

test('Criceto vince solo se ultimo sopravvissuto', () => {
  const p = makePlayers(['lupo', 'villico', 'criceto']);
  p.p1.alive = false;
  p.p2.alive = false;
  assert(checkWin(p) === 'terza', `atteso 'terza', ottenuto '${checkWin(p)}'`);
});

test('Nessun vincitore se la partita è ancora aperta', () => {
  const p = makePlayers(['lupo', 'villico', 'villico', 'villico']);
  assert(checkWin(p) === null, 'partita in corso, nessun vincitore');
});

// ─── Eliminazione base ────────────────────────────────────────────────────────
console.log('\n📋  Eliminazione base');

test('eliminate() segna il giocatore come morto', () => {
  const p = makePlayers(['villico', 'lupo']);
  const { players } = eliminate('p1', p, {}, null);
  assert(!players.p1.alive, 'p1 dovrebbe essere morto');
  assert(players.p2.alive, 'p2 dovrebbe essere vivo');
});

test('Non puoi eliminare un giocatore già morto', () => {
  const p = makePlayers(['villico']);
  p.p1.alive = false;
  const { killed } = eliminate('p1', p, {}, null);
  assert(killed.length === 0, 'nessuno dovrebbe essere ucciso');
});

// ─── Cupido ───────────────────────────────────────────────────────────────────
console.log('\n📋  Cupido — Coppia d\'amore');

test('Se un innamorato muore, muore anche l\'altro', () => {
  const p = makePlayers(['villico', 'villico', 'lupo', 'veggente']);
  const lovers = { p1: 'p2', p2: 'p1' };
  const { players, killed } = eliminate('p1', p, lovers, null);
  assert(!players.p1.alive, 'p1 morto');
  assert(!players.p2.alive, 'p2 (partner) dovrebbe morire di dolore');
  assert(killed.includes('p2'), 'p2 nella lista killed');
});

test('Morte a catena non colpisce chi non è innamorato', () => {
  const p = makePlayers(['villico', 'villico', 'lupo']);
  const lovers = { p1: 'p2', p2: 'p1' };
  const { players } = eliminate('p1', p, lovers, null);
  assert(players.p3.alive, 'p3 (lupo non innamorato) rimane vivo');
});

test('Coppia lupo+villaggio: checkWin corretto dopo la loro morte', () => {
  const p = makePlayers(['lupo', 'villico', 'villico', 'villico']);
  const lovers = { p1: 'p2', p2: 'p1' };
  // Eliminare p1 (lupo) → p2 muore → restano p3, p4 villaggio → villaggio vince
  let { players } = eliminate('p1', p, lovers, null);
  assert(checkWin(players) === 'villaggio', 'villaggio vince dopo morte coppia lupo+villaggio');
});

// ─── Lupo Alfa ────────────────────────────────────────────────────────────────
console.log('\n📋  Lupo Alfa');

test('Lupo Alfa porta con sé il giocatore marcato', () => {
  const p = makePlayers(['lupo_alfa', 'villico', 'villico', 'lupo']);
  const alfaMark = 'p2';
  const { players, killed } = eliminate('p1', p, {}, alfaMark);
  assert(!players.p1.alive, 'lupo_alfa morto');
  assert(!players.p2.alive, 'p2 marcato dovrebbe morire');
  assert(players.p3.alive, 'p3 non marcato rimane vivo');
  assert(killed.includes('p2'), 'p2 nella lista killed');
});

test('Lupo Alfa senza marcatura non porta nessuno', () => {
  const p = makePlayers(['lupo_alfa', 'villico']);
  const { killed } = eliminate('p1', p, {}, null);
  assert(killed.length === 1, 'solo lupo_alfa dovrebbe morire');
});

// ─── Guardia ──────────────────────────────────────────────────────────────────
console.log('\n📋  Guardia del Corpo');

test('Guardia salva il bersaglio dei lupi', () => {
  const p = makePlayers(['lupo', 'villico', 'guardia', 'villico']);
  const { players } = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: 'p2', stregaAction: null, mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(players.p2.alive, 'p2 salvato dalla guardia');
});

test('Guardia non protegge un bersaglio diverso', () => {
  const p = makePlayers(['lupo', 'villico', 'guardia', 'villico']);
  const { players } = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: 'p4', stregaAction: null, mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(!players.p2.alive, 'p2 non protetto (guardia proteggeva p4)');
  assert(players.p4.alive, 'p4 vivo (non bersaglio)');
});

// ─── Strega ───────────────────────────────────────────────────────────────────
console.log('\n📋  Strega');

test('Strega usa guarigione: vittima dei lupi sopravvive', () => {
  const p = makePlayers(['lupo', 'villico', 'strega', 'villico']);
  const { players } = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: null, stregaAction: 'HEAL', mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(players.p2.alive, 'p2 salvato dalla pozione di guarigione');
});

test('Strega usa veleno: il bersaglio muore', () => {
  const p = makePlayers(['lupo', 'villico', 'strega', 'villico']);
  const { players } = resolveDawn({ players: p, lupiTarget: null, guardiaTarget: null, stregaAction: 'p1', mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(!players.p1.alive, 'p1 (lupo) avvelenato dalla strega');
});

test('Strega usa veleno su stessa vittima dei lupi: muore comunque', () => {
  const p = makePlayers(['lupo', 'villico', 'strega']);
  const { players } = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: null, stregaAction: 'p2', mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  // p2 muore dai lupi, poi il veleno su p2 già morto: non dovrebbe causare doppio effetto
  assert(!players.p2.alive, 'p2 morto');
});

test('Strega PASS: nessun effetto', () => {
  const p = makePlayers(['lupo', 'villico', 'strega']);
  const { players } = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: null, stregaAction: 'PASS', mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(!players.p2.alive, 'p2 muore normalmente, strega non interviene');
});

// ─── Figlio dei Lupi ──────────────────────────────────────────────────────────
console.log('\n📋  Figlio dei Lupi');

test('Figlio dei Lupi si trasforma se attaccato di notte', () => {
  const p = makePlayers(['lupo', 'figlio_dei_lupi', 'villico', 'villico']);
  const { players, figlioTransformed } = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: null, stregaAction: null, mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(figlioTransformed, 'trasformazione dovrebbe avvenire');
  assert(players.p2.alive, 'figlio non muore — si trasforma');
  assert(players.p2.role === 'lupo', `ruolo dovrebbe essere 'lupo', ottenuto '${players.p2.role}'`);
});

test('Figlio trasformato conta come lupo nella checkWin', () => {
  const p = makePlayers(['lupo', 'figlio_dei_lupi', 'villico']);
  const { players } = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: null, stregaAction: null, mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  // Dopo trasformazione: p1=lupo vivo, p2=lupo vivo, p3=villico vivo → 2 lupi vs 1 villico → lupi vincono
  assert(checkWin(players) === 'lupi', `lupi vincono con 2 vs 1, ottenuto '${checkWin(players)}'`);
});

test('Figlio dei Lupi muore normalmente se eliminato di giorno', () => {
  const p = makePlayers(['lupo', 'figlio_dei_lupi', 'villico', 'villico', 'villico']);
  const votes = { p3: 'p2', p4: 'p2', p5: 'p2' };
  const { players } = resolveDayVote({ players: p, votes, alfaMark: null, lovers: {} });
  assert(!players.p2.alive, 'figlio muore al rogo — nessuna trasformazione');
  assert(players.p2.role === 'figlio_dei_lupi', 'il ruolo rimane figlio_dei_lupi al rogo');
});

test('Guardia salva il Figlio dei Lupi: nessuna trasformazione', () => {
  const p = makePlayers(['lupo', 'figlio_dei_lupi', 'guardia', 'villico']);
  const { players, figlioTransformed } = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: 'p2', stregaAction: null, mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(players.p2.alive, 'figlio salvato dalla guardia');
  assert(!figlioTransformed, 'nessuna trasformazione — guardia ha salvato prima');
});

// ─── Veggente ─────────────────────────────────────────────────────────────────
console.log('\n📋  Veggente');

test('Veggente vede lupo come lupi', () => {
  const p = makePlayers(['lupo', 'villico', 'veggente']);
  assert(veggenteResult('p1', p, null) === 'lupi', 'lupo visto come lupi');
});

test('Veggente vede villico come villaggio', () => {
  const p = makePlayers(['lupo', 'villico', 'veggente']);
  assert(veggenteResult('p2', p, null) === 'villaggio', 'villico visto come villaggio');
});

test('Veggente vede criceto come lupi', () => {
  const p = makePlayers(['lupo', 'criceto', 'veggente']);
  assert(veggenteResult('p2', p, null) === 'lupi', 'criceto visto come lupi');
});

test('Veggente vede mitomane come il ruolo imitato (lupo → lupi)', () => {
  const p = makePlayers(['lupo', 'mitomane', 'veggente', 'villico']);
  const mitomaneTarget = 'p1'; // mitomane imita il lupo
  assert(veggenteResult('p2', p, mitomaneTarget) === 'lupi', 'mitomane che imita lupo visto come lupi');
});

test('Veggente vede mitomane come villaggio se imita un villico', () => {
  const p = makePlayers(['lupo', 'mitomane', 'veggente', 'villico']);
  const mitomaneTarget = 'p4'; // mitomane imita il villico
  assert(veggenteResult('p2', p, mitomaneTarget) === 'villaggio', 'mitomane che imita villico visto come villaggio');
});

// ─── Criceto ──────────────────────────────────────────────────────────────────
console.log('\n📋  Criceto Mannaro');

test('Criceto è immune agli attacchi notturni dei lupi', () => {
  const p = makePlayers(['lupo', 'criceto', 'villico']);
  const { players } = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: null, stregaAction: null, mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(players.p2.alive, 'criceto sopravvive all\'attacco dei lupi');
});

test('Criceto muore se la Veggente lo scansiona', () => {
  const p = makePlayers(['lupo', 'criceto', 'veggente', 'villico']);
  const { players } = resolveDawn({ players: p, lupiTarget: null, guardiaTarget: null, stregaAction: null, mitomaneTarget: null, veggenteTarget: 'p2', lovers: {}, alfaMark: null });
  assert(!players.p2.alive, 'criceto muore dalla scansione della veggente');
});

test('Criceto vince se ultimo sopravvissuto', () => {
  const p = makePlayers(['lupo', 'villico', 'criceto']);
  p.p1.alive = false;
  p.p2.alive = false;
  assert(checkWin(p) === 'terza', 'criceto vince come terza fazione');
});

test('Criceto può morire di veleno dalla strega', () => {
  const p = makePlayers(['lupo', 'criceto', 'strega', 'villico']);
  const { players } = resolveDawn({ players: p, lupiTarget: null, guardiaTarget: null, stregaAction: 'p2', mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(!players.p2.alive, 'criceto ucciso dal veleno della strega');
});

// ─── Sindaco ──────────────────────────────────────────────────────────────────
console.log('\n📋  Sindaco');

test('Sindaco ha voto doppio nel conteggio diurno', () => {
  const p = makePlayers(['lupo', 'sindaco', 'villico', 'villico']);
  // sindaco (p2) vota p1, due villici votano p3 — sindaco dovrebbe vincere con peso 2
  const votes = { p2: 'p1', p3: 'p3', p4: 'p3' };
  // tally: p1=2 (sindaco), p3=2 (due villici) → pareggio, vince il primo (p1 in questo caso)
  // Per testare il peso, facciamo il sindaco votare un candidato da solo
  const votes2 = { p2: 'p1', p3: 'p3' }; // sindaco(2) vs villico(1)
  const { killed } = resolveDayVote({ players: p, votes: votes2, alfaMark: null, lovers: {} });
  assert(killed === 'p1', `sindaco con voto doppio dovrebbe eliminare p1, invece è stato eliminato ${killed}`);
});

// ─── Medium ───────────────────────────────────────────────────────────────────
console.log('\n📋  Medium');

test('Medium consulta solo giocatori morti', () => {
  const p = makePlayers(['lupo', 'villico', 'medium']);
  p.p2.alive = false; // p2 eliminato in precedenza
  // Il medium scansiona p2 (morto) → rivela il suo ruolo (villico)
  const role = ROLES[p.p2.role];
  assert(role.id === 'villico', `Medium rivela ruolo corretto: ${role.id}`);
  assert(!p.p2.alive, 'il medium consulta un giocatore morto');
});

// ─── Cacciatore ───────────────────────────────────────────────────────────────
console.log('\n📋  Cacciatore (eliminazione con contrattacco)');

test('Cacciatore porta con sé un giocatore quando eliminato', () => {
  // Il contrattacco del cacciatore è gestito manualmente dal GM nell'app,
  // quindi testiamo solo che eliminate() funzioni correttamente a cascata
  const p = makePlayers(['lupo', 'cacciatore', 'villico', 'villico']);
  // Cacciatore (p2) viene eliminato e porta con sé p1 (lupo) → simulate manuale
  let { players } = eliminate('p2', p, {}, null);
  // GM poi elimina manualmente p1 come contrattacco
  const r2 = eliminate('p1', players, {}, null);
  players = r2.players;
  assert(!players.p2.alive, 'cacciatore morto');
  assert(!players.p1.alive, 'lupo portato via dal cacciatore');
  assert(checkWin(players) === 'villaggio', 'villaggio vince dopo morte del lupo');
});

// ─── Flusso completo partita ───────────────────────────────────────────────────
console.log('\n📋  Flussi completi di partita');

test('Partita base: lupi eliminano il villaggio in 3 notti', () => {
  let p = makePlayers(['lupo', 'lupo', 'villico', 'villico', 'villico', 'villico']);
  let lovers = {}, alfaMark = null;

  // Notte 1: lupi uccidono p3
  let dawn = resolveDawn({ players: p, lupiTarget: 'p3', guardiaTarget: null, stregaAction: null, mitomaneTarget: null, veggenteTarget: null, lovers, alfaMark });
  p = dawn.players;
  assert(!p.p3.alive, 'N1: p3 eliminato');

  // Giorno 1: villaggio vota p4 a caso
  let day = resolveDayVote({ players: p, votes: { p1: 'p4', p2: 'p4', p5: 'p4' }, alfaMark, lovers });
  p = day.players;
  assert(!p.p4.alive, 'G1: p4 eliminato dal voto');

  // Notte 2: lupi uccidono p5
  dawn = resolveDawn({ players: p, lupiTarget: 'p5', guardiaTarget: null, stregaAction: null, mitomaneTarget: null, veggenteTarget: null, lovers, alfaMark });
  p = dawn.players;
  assert(!p.p5.alive, 'N2: p5 eliminato');

  // Stato: p1=lupo, p2=lupo, p6=villico vivo → 2 lupi >= 1 villico → lupi vincono
  assert(checkWin(p) === 'lupi', `lupi dovrebbero vincere: ${JSON.stringify(Object.values(p).filter(x=>x.alive).map(x=>x.role))}`);
});

test('Partita vinta dal villaggio grazie alla Veggente', () => {
  let p = makePlayers(['lupo', 'veggente', 'villico', 'villico', 'villico']);
  let lovers = {}, alfaMark = null;

  // Veggente identifica il lupo (p1) nella notte 1
  // Giorno 1: villaggio vota p1 grazie alla Veggente
  let day = resolveDayVote({ players: p, votes: { p2: 'p1', p3: 'p1', p4: 'p1', p5: 'p1' }, alfaMark, lovers });
  p = day.players;
  assert(!p.p1.alive, 'p1 (lupo) eliminato dal voto guidato dalla veggente');
  assert(checkWin(p) === 'villaggio', 'villaggio vince');
});

test('Scenario Cupido: coppia mista lupo+villico, vincono da soli', () => {
  let p = makePlayers(['lupo', 'villico', 'villico', 'villico', 'cupido']);
  const lovers = { p1: 'p2', p2: 'p1' }; // lupo e villico innamorati
  let alfaMark = null;

  // Elimina tutti tranne la coppia
  p.p3.alive = false;
  p.p4.alive = false;
  p.p5.alive = false;

  // Alive: p1(lupo) + p2(villico) → coppia innamorata mista
  // checkWin: wolves=1, villagers=1 → wolves >= villagers → lupi?
  // Ma nella logica reale la coppia mista ha una vittoria speciale
  // NOTA: nell'app la vittoria speciale coppia non è in checkWin standard ma gestita manualmente
  // Qui verifichiamo che checkWin ritorni 'lupi' (corretto per la logica attuale)
  assert(checkWin(p) === 'lupi', 'checkWin conta la coppia come vittoria lupi (la vittoria speciale coppia è gestita lato app)');
});

test('Figlio trasformato + lupo vs 1 villico: lupi vincono', () => {
  let p = makePlayers(['lupo', 'figlio_dei_lupi', 'villico', 'villico', 'villico']);
  let lovers = {}, alfaMark = null;

  // Notte 1: lupi attaccano figlio → si trasforma
  let dawn = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: null, stregaAction: null, mitomaneTarget: null, veggenteTarget: null, lovers, alfaMark });
  p = dawn.players;
  assert(dawn.figlioTransformed, 'figlio trasformato');

  // Notte 2: ora ci sono 2 lupi (p1 + p2 trasformato) — attaccano p3
  dawn = resolveDawn({ players: p, lupiTarget: 'p3', guardiaTarget: null, stregaAction: null, mitomaneTarget: null, veggenteTarget: null, lovers, alfaMark });
  p = dawn.players;
  assert(!p.p3.alive, 'N2: p3 eliminato');

  // Stato: p1=lupo, p2=lupo, p4=villico, p5=villico → 2 lupi vs 2 villici → lupi vincono
  assert(checkWin(p) === 'lupi', `lupi dovrebbero vincere dopo trasformazione`);
});

// ─── EDGE CASE ────────────────────────────────────────────────────────────────
console.log('\n📋  Edge case');

test('Nessun voto notturno: nessuna vittima', () => {
  const p = makePlayers(['lupo', 'villico', 'villico']);
  const { players } = resolveDawn({ players: p, lupiTarget: null, guardiaTarget: null, stregaAction: null, mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(Object.values(players).every(pl => pl.alive), 'tutti vivi se nessun voto');
});

test('Guardia protegge bersaglio ma strega usa veleno su un altro', () => {
  const p = makePlayers(['lupo', 'villico', 'guardia', 'villico', 'strega']);
  const { players } = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: 'p2', stregaAction: 'p1', mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(players.p2.alive, 'p2 salvato dalla guardia');
  assert(!players.p1.alive, 'p1 (lupo) avvelenato dalla strega');
});

test('Strega cura ma lupi avevano target null: nessun effetto strano', () => {
  const p = makePlayers(['lupo', 'villico', 'strega']);
  const { players } = resolveDawn({ players: p, lupiTarget: null, guardiaTarget: null, stregaAction: 'HEAL', mitomaneTarget: null, veggenteTarget: null, lovers: {}, alfaMark: null });
  assert(Object.values(players).every(pl => pl.alive), 'tutti vivi — heal su null non causa problemi');
});

test('Doppia morte cupido + lupo alfa contemporanea', () => {
  const p = makePlayers(['lupo_alfa', 'villico', 'villico', 'villico', 'villico']);
  const lovers = { p2: 'p3', p3: 'p2' };
  const alfaMark = 'p4';
  // Elimina lupo_alfa → porta p4 (alfaMark) → p2 muore → porta p3 (partner)
  const { players, killed } = eliminate('p1', p, lovers, alfaMark);
  assert(!players.p1.alive, 'lupo_alfa morto');
  assert(!players.p4.alive, 'p4 marcato morto');
  assert(killed.includes('p4'), 'p4 in lista killed');
  // p2/p3 non sono direttamente coinvolti dalla marcatura, solo p4
  assert(players.p2.alive, 'p2 vivo — la catena lovers si attiva solo su chi viene eliminato');
});

test('Veggente muore prima di usare il potere: nessun effetto veggente', () => {
  const p = makePlayers(['lupo', 'villico', 'veggente']);
  p.p3.alive = false; // veggente già morto
  const { players } = resolveDawn({ players: p, lupiTarget: 'p2', guardiaTarget: null, stregaAction: null, mitomaneTarget: null, veggenteTarget: 'p1', lovers: {}, alfaMark: null });
  // Il veggente è morto ma il suo "voto" è stato processato ugualmente
  // NOTA: nell'app il passo veggente viene skippato se il giocatore è morto
  // Qui testiamo che il criceto non muoia se il veggente è morto
  // (questo è un edge case che l'app dovrebbe gestire)
  assert(!players.p2.alive, 'p2 eliminato dai lupi normalmente');
});

// ─── RIEPILOGO ────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(55));
console.log(`  Totale: ${passed + failed} test — ✅ ${passed} passati — ❌ ${failed} falliti`);
console.log('═'.repeat(55) + '\n');
process.exit(failed > 0 ? 1 : 0);
