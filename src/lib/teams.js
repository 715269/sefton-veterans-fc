// src/lib/teams.js
//
// The order the club thinks in, oldest age group down to Open Age.
//
// This lives on its own because several components need it, and a constant
// copied into two files is a constant that will disagree with itself the day a
// fifth side is added. Teams are still DISCOVERED from the fixture list rather
// than listed here — anything not named below simply sorts to the end, so a new
// team appears on the site immediately and only needs adding here to get its
// position right.
//
// The slugs are the URL segments under /teams/. They are written out rather
// than generated from the name, because a generated slug quietly changes if
// anyone ever edits the team name in the spreadsheet, and every link into the
// site would break at once. Explicit is safer.

// `comp` is the short label for the tile; `blurb` is the sentence for the
// team page. Two fields rather than one because a tile has room for four
// words and a page header has room for a sentence.
export const TEAMS = [
  {
    slug: 'over-35s',
    name: 'Over 35s',
    comp: 'Cheshire & Wirral Premier',
    blurb: 'Competing in the Cheshire & Wirral Football League Premier Division.',
  },
  {
    slug: 'over-45s',
    name: 'Over 45s',
    comp: 'Friendlies & cup',
    blurb: 'Friendly and cup football across Merseyside, Wirral and Cheshire.',
  },
  {
    slug: 'over-50s',
    name: 'Over 50s',
    comp: 'Legends Cup',
    blurb: 'Legends Cup and friendly fixtures for our most experienced squad.',
  },
  {
    slug: 'open-age',
    name: 'Open Age',
    comp: 'Sefton OA FC',
    blurb: 'Playing as Sefton OA FC since the 2023/24 season.',
  },
];

export const TEAM_ORDER = TEAMS.map((t) => t.name);

export function orderTeams(names) {
  const rankOf = (name) => {
    const i = TEAM_ORDER.indexOf(name);
    return i === -1 ? TEAM_ORDER.length : i;
  };
  return [...names].sort((a, b) => rankOf(a) - rankOf(b) || a.localeCompare(b));
}

/** 'Over 45s' -> 'over-45s'. Undefined for a team with no page. */
export function slugForTeam(name) {
  return TEAMS.find((t) => t.name === name)?.slug;
}

/** 'over-45s' -> the whole entry. Undefined for an unknown slug. */
export function teamForSlug(slug) {
  return TEAMS.find((t) => t.slug === slug);
}
