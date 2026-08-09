// src/lib/season.js
//
// Joins two sources that each own their own truth:
//   • fixtures-2026-27.json — you maintain this, it owns the schedule
//   • the Google Sheet       — the match reports own the results
//
// Neither writes to the other, so regenerating the fixtures file can never
// wipe a result, and filing a report can never disturb the schedule.
//
// Runs at BUILD time, not in the visitor's browser. Nothing here reaches the
// public unless it is in this file.

import localFixtures from '../data/fixtures-2026-27.json';

// Read from .env, never from this file — so replacing this file with a newer
// version can never wipe your URL. Set RESULTS_FEED in .env locally, and in
// Netlify under Site settings → Environment variables for the live build.
const RESULTS_FEED = import.meta.env.RESULTS_FEED || '';

const key = (date, team, opponent) =>
  [date, team, opponent].join('|').trim().toLowerCase();

/**
 * Fetches results from the spreadsheet. If anything goes wrong — Apps Script
 * slow, offline, URL not filled in — this returns an empty list rather than
 * throwing, so a Netlify build never fails because of it. The site simply
 * shows the fixtures without results until the next build.
 */
// Fetched once and reused, so a build with five pages only wakes Apps Script
// once. In dev that would mean restarting the server to see a new report, so
// there the cache lasts a few seconds — long enough to share within one page
// render, short enough that a reload picks up a fresh submission.
const CACHE_MS = import.meta.env.PROD ? Infinity : 3000;

let pending = null;
let fetchedAt = 0;

async function fetchResults() {
  if (!pending || Date.now() - fetchedAt > CACHE_MS) {
    fetchedAt = Date.now();
    pending = fetchResultsOnce();
  }
  return pending;
}

async function fetchResultsOnce() {
  if (!RESULTS_FEED) {
    console.warn('[season] RESULTS_FEED is not set in .env — showing fixtures ' +
                 'without results. Add it and restart the dev server.');
    return [];
  }
  try {
    const res = await fetch(RESULTS_FEED, { redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.results)) {
      throw new Error(data.error || 'Unexpected response');
    }
    console.log('[season] Loaded ' + data.results.length + ' results.');
    return data.results;
  } catch (err) {
    console.warn('[season] Could not load results: ' + err.message);
    return [];
  }
}

/**
 * The squad lists, straight from the Roster tab in the spreadsheet — the list
 * that actually grows when a captain adds someone on a Saturday.
 *
 * players.json is only a fallback for when the feed is unreachable, so a build
 * never produces a match report page with empty squad lists.
 */
let pendingSquads = null;
let squadsFetchedAt = 0;

export async function getSquads(fallback) {
  if (!pendingSquads || Date.now() - squadsFetchedAt > CACHE_MS) {
    squadsFetchedAt = Date.now();
    pendingSquads = loadSquads(fallback);
  }
  return pendingSquads;
}

async function loadSquads(fallback) {
  const safe = fallback && typeof fallback === 'object' ? fallback : {};
  if (!RESULTS_FEED) {
    console.warn('[season] RESULTS_FEED not set — squad lists from players.json.');
    return safe;
  }
  try {
    const url = RESULTS_FEED.replace('feed=results', 'feed=squads');
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.ok || !data.squads) throw new Error(data.error || 'Unexpected response');

    // Keep any team the roster does not mention, rather than losing it.
    const merged = { ...safe };
    for (const [team, names] of Object.entries(data.squads)) {
      if (Array.isArray(names) && names.length) merged[team] = names;
    }
    const total = Object.values(merged).reduce((n, list) => n + list.length, 0);
    console.log('[season] Squads from the Roster: ' + total + ' entries across ' +
                Object.keys(merged).length + ' teams.');
    return merged;
  } catch (err) {
    console.warn('[season] Could not load squads (' + err.message + ') — using players.json.');
    return safe;
  }
}
/**
 * Who manages each team, from the Managers tab. Used for the default on the
 * match report form and the name on the team tiles.
 *
 * No local fallback file on purpose: an unreachable feed means a tile with no
 * manager line, which looks fine. A stale hardcoded list would be worse — it
 * would name the wrong man with total confidence.
 */
let pendingManagers = null;
let managersFetchedAt = 0;

export async function getManagers() {
  if (!pendingManagers || Date.now() - managersFetchedAt > CACHE_MS) {
    managersFetchedAt = Date.now();
    pendingManagers = loadManagers();
  }
  return pendingManagers;
}

async function loadManagers() {
  if (!RESULTS_FEED) {
    console.warn('[season] RESULTS_FEED not set — no manager names.');
    return {};
  }
  try {
    const url = RESULTS_FEED.replace('feed=results', 'feed=managers');
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.ok || !data.managers) throw new Error(data.error || 'Unexpected response');

    const total = Object.values(data.managers).reduce((n, l) => n + l.length, 0);
    console.log('[season] Managers: ' + total + ' across ' +
                Object.keys(data.managers).length + ' teams.');
    return data.managers;
  } catch (err) {
    console.warn('[season] Could not load managers: ' + err.message);
    return {};
  }
}
/**
 * The fixture list, from the Fixtures tab in the spreadsheet — the list you
 * actually maintain. `fixtures-2026-27.json` is only a fallback for when the
 * feed cannot be reached, so a build never produces an empty fixtures page.
 */
let pendingFixtures = null;
let fixturesFetchedAt = 0;

export async function getFixtures() {
  if (!pendingFixtures || Date.now() - fixturesFetchedAt > CACHE_MS) {
    fixturesFetchedAt = Date.now();
    pendingFixtures = loadFixtures();
  }
  return pendingFixtures;
}

async function loadFixtures() {
  const fallback = Array.isArray(localFixtures) ? localFixtures : [];
  if (!RESULTS_FEED) {
    console.warn('[season] RESULTS_FEED not set — fixtures from the local file.');
    return fallback;
  }
  try {
    const url = RESULTS_FEED.replace('feed=results', 'feed=fixtures');
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.fixtures)) {
      throw new Error(data.error || 'Unexpected response');
    }
    // An empty tab almost certainly means it has not been filled in yet,
    // rather than a season with no fixtures. Keep the file in that case.
    if (!data.fixtures.length) {
      console.warn('[season] The Fixtures tab is empty — using the local file.');
      return fallback;
    }
    console.log('[season] Loaded ' + data.fixtures.length + ' fixtures from the sheet.');
    return data.fixtures;
  } catch (err) {
    console.warn('[season] Could not load fixtures (' + err.message +
                 ') — using the local file.');
    return fallback;
  }
}

/**
 * Each player's usual position, keyed "team|name" in lower case. Learned from
 * previous match reports, so a captain sets it once rather than every week.
 * An empty object if the feed is unreachable — positions are a convenience,
 * never a requirement.
 */
let pendingPositions = null;
let positionsFetchedAt = 0;

export async function getPositions() {
  if (!pendingPositions || Date.now() - positionsFetchedAt > CACHE_MS) {
    positionsFetchedAt = Date.now();
    pendingPositions = loadPositions();
  }
  return pendingPositions;
}

async function loadPositions() {
  if (!RESULTS_FEED) return {};
  try {
    const url = RESULTS_FEED.replace('feed=results', 'feed=positions');
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.ok || !data.positions) throw new Error(data.error || 'Unexpected response');
    return data.positions;
  } catch (err) {
    console.warn('[season] Could not load positions (' + err.message + ').');
    return {};
  }
}

/**
 * Every fixture for the season, with results merged in where one exists.
 * Shape matches what FixturesTable.astro already expects, so `outcome` is
 * never null and `scorers` is always an array.
 */
export async function getSeason() {
  const [fixtures, results] = await Promise.all([getFixtures(), fetchResults()]);

  const byMatch = new Map();
  for (const r of results) {
    byMatch.set(key(r.date, r.team, r.opponent), r);
  }

  return fixtures.map((f, i) => {
    const found = byMatch.get(key(f.date, f.team, f.opponent));
    return {
      ...f,
      id: f.id ?? i + 1,
      result: found?.result || f.result || null,
      scorers: found?.scorers ?? (Array.isArray(f.scorers) ? f.scorers : []),
      outcome: found?.outcome || f.outcome || 'Upcoming',
      provisional: f.provisional ?? (String(f.opponent).toUpperCase() === 'TBC'),
      booked: found?.booked ?? 0,
      sentOff: found?.sentOff ?? 0,
      detail: found?.detail ?? null,
      played: Boolean(found?.result)
    };
  });
}

/** Matches already played, newest first. */
export async function getResults(team) {
  const season = await getSeason();
  return season
    .filter((f) => f.played && (!team || f.team === team))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Matches still to come, soonest first.
 *
 * Reserved dates with the opponent not yet known are included by default,
 * since a blocked-out Saturday is worth knowing about. Pass
 * `{ confirmedOnly: true }` for a panel that should only show real fixtures.
 */
export async function getUpcoming(team, limit, options = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const season = await getSeason();
  const list = season
    .filter((f) => !f.played && f.date >= today)
    .filter((f) => !options.confirmedOnly || !f.provisional)
    .filter((f) => !team || f.team === team)
    .sort((a, b) => a.date.localeCompare(b.date));
  return limit ? list.slice(0, limit) : list;
}

/** Season summary per team: played, won, drawn, lost, goals, cards, form. */
export async function getSummary(team) {
  const played = await getResults(team);

  const blank = {
    played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, booked: 0, sentOff: 0, form: []
  };

  const summary = played.reduce((acc, m) => {
    acc.played += 1;
    if (m.outcome === 'Win') acc.won += 1;
    else if (m.outcome === 'Draw') acc.drawn += 1;
    else if (m.outcome === 'Loss') acc.lost += 1;

    const [f, a] = String(m.result || '').split('-').map((n) => parseInt(n, 10));
    if (!isNaN(f)) acc.goalsFor += f;
    if (!isNaN(a)) acc.goalsAgainst += a;

    acc.booked += m.booked || 0;
    acc.sentOff += m.sentOff || 0;
    return acc;
  }, { ...blank });

  // Most recent five, oldest of those first, so it reads left to right.
  summary.form = played.slice(0, 5).reverse().map((m) => m.outcome.charAt(0));
  summary.goalDifference = summary.goalsFor - summary.goalsAgainst;
  return summary;
}

/**
 * ── Player rankings ──────────────────────────────────────────────────────
 *
 * Worked out from the teamsheets the captains filed, NOT from the Player
 * Stats tab in the spreadsheet. Three reasons that tab was ruled out:
 *
 *   • It holds all-time running totals with no season column, so in August
 *     it would show last season's goals under this season's heading.
 *   • It ADDS to a total on every submission, so a re-filed report is
 *     double-counted until rebuildPlayerStats() is run by hand. The results
 *     feed is keyed on date + team + opponent, so a re-file replaces.
 *   • Reading it would need no Apps Script change, but adding a season
 *     column would — and every Code.gs edit needs a redeploy to take effect.
 *
 * The trade-off, stated plainly: this can only count matches that have a
 * teamsheet attached. It cannot see anything from before the website form
 * existed, so results-2025-26.json contributes nothing here. All-time club
 * records — most appearances in club history and so on — still belong to the
 * Player Stats tab, and should be treated as a separate feature.
 */

// Standard competition ranking: 1, 2, 2, 4 — not 1, 2, 2, 3. Ties share the
// higher position and the next man down skips the gap, which is how a league
// table or a scoring chart reads.
function withRanks(list, valueOf) {
  let previous = null;
  let currentRank = 0;

  const ranked = list.map((player, i) => {
    const value = valueOf(player);
    if (previous === null || value !== previous) {
      currentRank = i + 1;
      previous = value;
    }
    return { ...player, rank: currentRank };
  });

  // Flag ties so the page can show "=3" rather than three bare 3s.
  const counts = new Map();
  for (const p of ranked) counts.set(p.rank, (counts.get(p.rank) || 0) + 1);
  return ranked.map((p) => ({ ...p, joint: counts.get(p.rank) > 1 }));
}

async function tallyPlayers() {
  const season = await getSeason();
  const players = new Map();

  // Names are stored "Surname, Forename" and matched case-insensitively, but
  // the display name keeps whatever casing the captain filed.
  const find = (team, name) => {
    const k = (team + '|' + name).toLowerCase();
    if (!players.has(k)) {
      players.set(k, {
        name, team,
        appearances: 0, starts: 0, subApps: 0,
        goals: 0, booked: 0, sentOff: 0, motm: 0
      });
    }
    return players.get(k);
  };

  for (const match of season) {
    const d = match.detail;
    if (!d) continue;

    for (const name of d.starting || []) {
      const p = find(match.team, name);
      p.appearances += 1;
      p.starts += 1;
    }

    for (const name of d.bench || []) {
      const p = find(match.team, name);
      p.appearances += 1;
      p.subApps += 1;
    }

    // parseScorerCell gives [{ name, goals }] with own goals already dropped,
    // because an own goal belongs to nobody. A scorer with no matching
    // teamsheet entry still gets counted — he'll show with goals against zero
    // appearances, which is a visible sign the name was typed differently
    // somewhere rather than a silent miscount.
    for (const s of d.scorers || []) {
      if (!s || !s.name) continue;
      find(match.team, s.name).goals += Number(s.goals) || 1;
    }

    for (const name of d.booked || []) find(match.team, name).booked += 1;
    for (const name of d.sentOff || []) find(match.team, name).sentOff += 1;

    // A team can only give the award to someone who actually played, so an
    // MotM naming anyone else is treated as unrecorded rather than counted —
    // most likely a name typed slightly differently from the teamsheet.
    if (d.motm) {
      const onTeamsheet = (d.starting || []).includes(d.motm) ||
                           (d.bench || []).includes(d.motm);
      if (onTeamsheet) find(match.team, d.motm).motm += 1;
    }
  }

  return [...players.values()];
}

// Shared by both of the exported ranking functions below, so the two can
// never drift apart.
function rankSquad(squad) {
  const scorers = squad
    .filter((p) => p.goals > 0)
    .sort((a, b) =>
      b.goals - a.goals ||
      a.appearances - b.appearances ||
      a.name.localeCompare(b.name));

  const appearances = squad
    .filter((p) => p.appearances > 0)
    .sort((a, b) =>
      b.appearances - a.appearances ||
      b.starts - a.starts ||
      a.name.localeCompare(b.name));

  // Same tie logic as scorers: most awards first, then whoever earned them
  // in fewer appearances, then alphabetically.
  const motm = squad
    .filter((p) => p.motm > 0)
    .sort((a, b) =>
      b.motm - a.motm ||
      a.appearances - b.appearances ||
      a.name.localeCompare(b.name));

  return {
    scorers: withRanks(scorers, (p) => p.goals),
    appearances: withRanks(appearances, (p) => p.appearances),
    motm: withRanks(motm, (p) => p.motm)
  };
}

/**
 * Scorers and appearances for one team, each already ranked and tie-flagged.
 *
 * Scorers break ties on fewer appearances, then alphabetically — so level on
 * goals, the man who did it in fewer games edges it. Change the comparator in
 * rankSquad() if the committee would rather it went the other way.
 *
 * Called with no team, this pools every side into one list. Note that anyone
 * who turns out for both the Over 45s and the Over 50s is counted separately
 * for each, so a pooled list would show him twice — which is why the site
 * uses getStatsByTeam() instead.
 */
export async function getStats(team) {
  const all = await tallyPlayers();
  return rankSquad(all.filter((p) => !team || p.team === team));
}

/**
 * The same thing for every team at once, keyed by team name. Teams come from
 * the fixture list rather than a hardcoded array, so adding a fifth side to
 * the spreadsheet is enough — nothing here needs editing.
 *
 * Teams with no reports yet still get an entry, with empty lists, so a page
 * can show "no matches played yet" rather than silently omitting the side.
 */
export async function getStatsByTeam() {
  const [season, all] = await Promise.all([getSeason(), tallyPlayers()]);
  const teams = [...new Set(season.map((f) => f.team).filter(Boolean))];

  const out = {};
  for (const team of teams) {
    out[team] = rankSquad(all.filter((p) => p.team === team));
  }
  return out;
}
