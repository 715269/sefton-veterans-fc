// src/lib/honours.js
//
// Trophies won by the club. Lives here rather than inside about.astro because
// the home page counts them too, and a number that appears in two files is a
// number that will eventually disagree with itself.
//
// Grouped by competition rather than listed by season: six wins in one cup is
// the story worth telling, and six separate rows hide it.

export const HONOURS = [
  {
    competition: 'Friendship Cup',
    team: 'Over 35s',
    seasons: ['2018/19', '2019/20', '2020/21', '2021/22', '2023/24', '2024/25'],
  },
  {
    competition: 'Friendship Masters Cup',
    team: 'Over 45s',
    seasons: ['2021/22'],
  },
  {
    competition: 'Liverpool Football League Cup',
    team: 'Open Age',
    seasons: ['2025/26'],
  },
];

/** Every trophy the club has won, counted across all competitions. */
export const TOTAL_TROPHIES = HONOURS.reduce(
  (total, h) => total + h.seasons.length,
  0
);

/** The year the club was founded — used in the history and on the home page. */
export const FOUNDED = 2011;

/**
 * Not an annual award like the four in ROLL_OF_HONOUR, so it doesn't sit
 * inside a season block. David and Phil Stafford have both played for the
 * club and sponsored it over many years, which is a different kind of
 * contribution to "best player this season" — it gets its own feature on
 * the About page and its own spotlight on the home page instead.
 *
 * The blurb below is a first draft, not confirmed wording — there are no
 * real figures or dates in it, deliberately, since none were given. Replace
 * it with the club's own account once you have one.
 */
export const CLUBMAN_OF_DECADE = {
  title: 'Clubmen of the Decade',
  recipients: [
    { name: 'David Stafford', photo: 'david-stafford' },
    { name: 'Phil Stafford', photo: 'phillip-stafford' },
  ],
  blurb:
    'David and Phil Stafford have given Sefton Veterans FC decades of ' +
    "service — as players for the club, and as long-standing sponsors " +
    'behind the scenes. In recognition of that commitment, both were ' +
    'named Clubman of the Decade.',
};

// The four awards, in the order they're presented on the night.
export const AWARDS = [
  ['scorer', 'Top Scorer'],
  ['players', "Players' Player of the Year"],
  ['managers', "Managers' Player of the Year"],
  ['clubman', 'Gerry Kinsella Clubman of the Year'],
];

// Each winner is [name, team, note]. Team and note are optional — before
// 2021/22 the club ran one side, so those seasons have a single winner with
// no team against it, which is correct rather than missing.
//
// Newest first. Add a new block at the top each summer.
export const ROLL_OF_HONOUR = [
  {
    season: '2025/26',
    // Tied to this season specifically, not to "whichever card is newest" —
    // so it stays on 2025/26 even once next year's block goes in above it.
    decadeAward: true,
    scorer: [
      ['Karl Bergqvist', '35s'],
      ['Paul Smith', '45s'],
      ['Ben Hitchman', 'OA', 'joint'],
      ['Lewis Roden', 'OA', 'joint'],
    ],
    players: [
      ['Karl Bergqvist', '35s'],
      ['Mick Shannon', '45s'],
      ['Tom Mason', 'OA'],
    ],
    managers: [
      ['Karl Bergqvist', '35s'],
      ['Jay Curran', '45s'],
      ['Ben Hitchman', 'OA', 'joint'],
      ['Danny Draper', 'OA', 'joint'],
    ],
    clubman: [
      ['Geoff McKeating'],
      ['Ash Stott', 'OA', 'joint'],
      ['John McGunigle', 'OA', 'joint'],
    ],
  },
  {
    season: '2024/25',
    scorer: [['Lee Reid', '35s'], ['Paul McKendrick', '45s']],
    players: [['Neil McQueen', '35s', 'joint'], ['Tony James', '35s', 'joint'], ['Gary Brookes', '45s']],
    managers: [['Jamie Hay', '35s'], ['Chris Long', '45s']],
    clubman: [['David Stafford']],
  },
  {
    season: '2023/24',
    scorer: [['Lee Reid', '35s'], ['Rob Cowley', '45s']],
    players: [["Danny O'Connor", '35s'], ['Ste McNulty', '45s']],
    managers: [['Mark Shildhauer', '35s'], ['Joe McNally', '45s']],
    clubman: [['Dave Sellick']],
  },
  {
    season: '2022/23',
    scorer: [['Lee Reid', '35s'], ['Rob Cowley', '45s']],
    players: [['Thomas King', '35s'], ['Steve King', '45s']],
    managers: [['David Stafford', '35s'], ['Ste Byrne', '45s']],
    clubman: [['Geoff McKeating']],
  },
  {
    season: '2021/22',
    scorer: [['Lee Reid', '35s'], ['Rob Cowley', '45s']],
    players: [['Lee Reid', '35s'], ['Rob Cowley', '45s']],
    managers: [['Chris Long', '35s'], ['Rob Cowley', '45s']],
    clubman: [['Alan Roberts']],
  },
  {
    season: '2020/21',
    scorer: [['Lee Reid']],
    players: [['Dave Parkinson']],
    managers: [['Joe McNally']],
    clubman: [['Gerard Kinsella']],
  },
  {
    season: '2019/20',
    scorer: [['Dave Parkinson']],
    players: [['Dave Parkinson']],
    managers: [['Warren Jones']],
    clubman: [['Brian Gilligan']],
  },
  {
    season: '2018/19',
    scorer: [['Dave Parkinson']],
    players: [['Ste King']],
    managers: [['Carl Brennand']],
    clubman: [['The Club']],
  },
  {
    season: '2017/18',
    scorer: [['Mark Shildhauer']],
    players: [['Mark Shildhauer']],
    managers: [['Chris Long']],
    clubman: [['Chris Long']],
  },
  {
    season: '2016/17',
    scorer: [['Mark Shildhauer']],
    players: [['Wayne Robinson']],
    managers: [['Gary McBirnie']],
    clubman: [['Wayne Robinson']],
  },
  {
    season: '2015/16',
    scorer: [['Gary Roberts']],
    players: [['Jay Shannon']],
    managers: [['Jay Shannon']],
    clubman: [['Brian Gilligan']],
  },
  {
    season: '2014/15',
    scorer: [['Jamie Byron']],
    players: [['Jamie Byron']],
    managers: [['Mike Jump']],
    clubman: [['Jay Shannon']],
  },
  {
    season: '2013/14',
    scorer: [['Mannie Penzie']],
    players: [['Chris Long']],
    managers: [['Gerard Kinsella']],
    clubman: [['Joe Lundon']],
  },
  {
    season: '2012/13',
    scorer: [['Paul Jordan']],
    players: [['Jay Shannon']],
    managers: [['Wayne Robinson']],
    clubman: [['Gerard Kinsella']],
  },
  {
    season: '2011/12',
    scorer: [['Les Ash']],
    players: [['Chris McGunigle']],
    managers: [['Dave Scanlan']],
    clubman: [['Mark Williams']],
  },
];

