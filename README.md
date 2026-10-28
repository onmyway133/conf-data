# conf-data

Tech conference data: conferences,
editions, speakers and talks, one JSON file each.

Every merged pull request is published to the site automatically. Want to add a
conference, fix a date or add a lineup? See [CONTRIBUTING.md](CONTRIBUTING.md).

## Layout

```
conferences/<series>/series.json   the conference across years
conferences/<series>/<year>.json   one edition: dates, place, CFP, lineup, talks
speakers/<speaker>.json            a speaker's profile
```

## License

This data is **not** open. It is public only so you can contribute. You may not
copy, scrape, redistribute or use it in other products, or use it to train AI
models. See [LICENSE](LICENSE).
