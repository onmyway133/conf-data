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

Slugs are lowercase words joined by hyphens (`ios-conf-sg`, `john-doe`). The
file path is the slug. Don't rename existing files: links on the site depend
on them.

### `conferences/<series>/series.json`

```json
{
  "name": "iOS Conf SG",
  "website": "https://iosconf.sg",
  "twitter": "https://x.com/iosconfsg",
  "bluesky": null,
  "mastodon": null
}
```

### `conferences/<series>/<year>.json`

```json
{
  "name": "iOS Conf SG 2026",
  "url": "https://iosconf.sg",
  "startDate": "2026-01-15",
  "endDate": "2026-01-16",
  "city": "Singapore",
  "country": "SG",
  "topics": ["Mobile"],
  "cfp": { "url": "https://iosconf.sg/cfp", "deadline": "2025-10-31" },
  "playlistUrl": null,
  "speakers": [
    { "speaker": "john-doe", "role": "iOS Engineer @ Example" }
  ],
  "talks": [
    {
      "title": "Shipping SwiftUI at Scale",
      "speakers": ["john-doe"],
      "youtubeUrl": null,
      "topics": ["Mobile"]
    }
  ]
}
```

- Dates are `YYYY-MM-DD`, in the conference's local time.
- `country` is an ISO 3166-1 alpha-2 code (`SG`, `US`, `DE`).
- `topics` must come from the list the site uses. The check tells you if one
  isn't valid.
- `cfp` is `null` when there is no call for papers.
- Every slug in `speakers` and in a talk's `speakers` needs a file in
  `speakers/`.

### `speakers/<speaker>.json`

```json
{
  "name": "John Doe",
  "bio": "Builds iOS apps.",
  "photoUrl": null,
  "website": null,
  "twitter": null,
  "bluesky": null,
  "mastodon": null
}
```

Before creating a speaker, search `speakers/` to see if they already exist.

## Pull requests

- One conference (or one fix) per PR.
- Fill in the PR template, including the source links.
- Keep formatting as in the examples: 2-space indent and a trailing newline.
