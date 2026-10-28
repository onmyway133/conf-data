# conf-data

Tech conference data: conferences, editions, speakers and talks, one JSON file
each.

Every merged pull request is published to the site automatically. Want to add a
conference, fix a date or add a lineup? See [CONTRIBUTING.md](CONTRIBUTING.md).

## Layout

```
topics.json                          the topic list
conferences/<series>/series.json     the conference across years
conferences/<series>/<edition>.json  one edition: dates, place, CFP, lineup, talks
speakers/<speaker>.json              a speaker's profile
talks/<talk>.json                    a talk not tied to an edition
schema/*.schema.json                 JSON Schema of each file (generated)
```

`<edition>` is usually the year (`2026`), or `2026-2` for a second edition that
year. File names are the slugs used in the site's links, so they never change.

## Credits

This data builds on the work of others. Thank you to:

- [confs.tech](https://github.com/tech-conferences/conference-data) (MIT License, see
  [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)): editions marked
  `"source": "confs.tech"`.
- [CocoaConferences](https://github.com/Lascorbe/CocoaConferences) by Luis Ascorbe:
  editions marked `"source": "cocoaconferences"`.

## License

This data is **not** open. It is public only so you can contribute. You may not
copy, scrape, redistribute or use it in other products, or use it to train AI
models. See [LICENSE](LICENSE).
