# Contributing

Thanks for helping keep the conference list accurate. Every change goes through
a pull request. A check validates the files, a maintainer reviews, and once the
PR is merged the change shows up on the site.

Not comfortable editing JSON? Open an issue with the
[conference form](../../issues/new/choose) instead.

## What belongs here

Tech **conferences** only. Meetups, workshops, hackathons, webinars and very
small single-track events are out of scope, since there would be too many.

## Before you start

- By contributing, you agree to the terms in [LICENSE](LICENSE): your
  contribution may be used by the maintainers, and the data may not be reused
  elsewhere.
- Use public, official sources (the conference website, its CFP page, its
  YouTube channel). Put the source link in the PR description.
- Don't add personal data a speaker hasn't published themselves (no emails or
  phone numbers).

## Files

```
topics.json                          the topic list (array order = display order)
conferences/<series>/series.json     the conference across years
conferences/<series>/<edition>.json  one edition: dates, place, CFP, lineup, talks
speakers/<speaker>.json              a speaker's profile
talks/<talk>.json                    a talk not tied to an edition
schema/*.schema.json                 JSON Schema of each file (generated, don't edit)
```

Slugs are lowercase words joined by hyphens (`ios-conf-sg`, `jane-doe`). The
file path is the slug. Don't rename existing files: links on the site depend
on them.

Leave out a field you don't know instead of writing `null` or `""`. Unknown
fields are rejected, so check the spelling against the examples. Links must
start with `https://` (or `http://`).

### `topics.json`

```json
[
  { "slug": "ios", "name": "iOS" },
  { "slug": "web", "name": "Web" }
]
```

Conferences and talks refer to topics by `name`. Propose a new topic in its own
PR.

### `conferences/<series>/series.json`

```json
{
  "name": "iOS Conf SG",
  "website": "https://iosconf.sg",
  "twitter": "https://x.com/iosconfsg"
}
```

Optional: `website`, `twitter`, `bluesky`, `mastodon`.

### `conferences/<series>/<edition>.json`

The file name is the edition slug: usually the year (`2026.json`), or
`2026-2.json` for a second edition in the same year.

```json
{
  "name": "iOS Conf SG 2026",
  "year": 2026,
  "url": "https://iosconf.sg",
  "startDate": "2026-01-15",
  "endDate": "2026-01-16",
  "city": "Singapore",
  "country": "SG",
  "lat": 1.2966,
  "lng": 103.7764,
  "topics": ["iOS"],
  "cfp": { "url": "https://iosconf.sg/cfp", "deadline": "2025-10-31", "open": true },
  "playlistUrl": "https://www.youtube.com/playlist?list=...",
  "speakers": [
    { "speaker": "jane-doe", "role": "iOS Engineer @ Example" }
  ],
  "talks": [
    {
      "slug": "shipping-swiftui-at-scale",
      "title": "Shipping SwiftUI at Scale",
      "speakers": ["jane-doe"],
      "youtubeUrl": "https://www.youtube.com/watch?v=...",
      "topics": ["iOS"]
    }
  ]
}
```

- Required: `name`, `year`, `url`, `startDate`, `endDate`, `city`, `country`,
  `topics`.
- Dates are `YYYY-MM-DD`, in the conference's local time. `endDate` can't be
  before `startDate`, and `year` is the year of `startDate`.
- `country` is an ISO 3166-1 alpha-2 code (`SG`, `US`, `DE`).
- `lat`/`lng` place the conference on the map (the venue, or the city).
- `topics` (and a talk's `topics`) must be names from `topics.json`.
- `cfp` is left out when there is no call for papers. `open` says whether it
  accepts proposals; `url` and `deadline` are optional.
- Other optional fields: `bannerUrl`, `playlistUrl`, `twitter`, `bluesky`,
  `mastodon`, `source` (where the data came from, set by import tools).
- `speakers` is the lineup, in the order the conference shows it. Each entry
  needs `speaker` (a slug with a file in `speakers/`) and can add `role`,
  `bio`, `photoUrl`, `twitter`, `bluesky`, `mastodon`, `linkedin`, `website`
  as this conference presented the speaker.
- `talks` are in schedule order. A talk's `slug` is its page on the site and
  must be unique across the whole repository (all edition files and
  `talks/`). Every slug in its `speakers` needs a file in `speakers/`.

### `speakers/<speaker>.json`

```json
{
  "name": "Jane Doe",
  "bio": "Builds iOS apps.",
  "website": "https://janedoe.dev"
}
```

Optional: `bio`, `photoUrl`, `twitter`, `bluesky`, `mastodon`, `website`. Set
them only to override what the speaker's latest conference lineup says.

Before creating a speaker, search `speakers/` to see if they already exist.

### `talks/<talk>.json`

Only for a talk that isn't part of a conference in this repository:

```json
{
  "title": "A Talk Given Elsewhere",
  "speakers": ["jane-doe"],
  "youtubeUrl": "https://www.youtube.com/watch?v=...",
  "topics": ["iOS"]
}
```

## Pull requests

- One conference (or one fix) per PR.
- Fill in the PR template, including the source links.
- Keep formatting as in the examples: 2-space indent, keys in the order shown,
  and a trailing newline.
