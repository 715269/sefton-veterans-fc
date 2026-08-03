// src/lib/teams.js
//
// The order the club thinks in, oldest age group down to Open Age.
//
// This lives on its own because two components need it, and a constant copied
// into two files is a constant that will disagree with itself the day a fifth
// side is added. Teams are still DISCOVERED from the fixture list rather than
// listed here — anything not named below simply sorts to the end, so a new
// team appears on the site immediately and only needs adding here to get its
// position right.

export const TEAM_ORDER = ['Over 35s', 'Over 45s', 'Over 50s', 'Open Age'];

export function orderTeams(names) {
  const rankOf = (name) => {
    const i = TEAM_ORDER.indexOf(name);
    return i === -1 ? TEAM_ORDER.length : i;
  };
  return [...names].sort((a, b) => rankOf(a) - rankOf(b) || a.localeCompare(b));
}
