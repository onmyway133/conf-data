#!/usr/bin/env node
// Validates every data file against schema/*.schema.json, then runs the cross-file checks
// (references, unique talk slugs, dates, file slugs). Exits 1 and lists every problem on failure.
//
// Usage: node scripts/validate.mjs [repo dir]   (defaults to the current directory)

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const root = resolve(process.argv[2] ?? '.')
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

const errors = []
const add = (file, message) => errors.push({ file, message })
const rel = (path) => relative(root, path).split('\\').join('/')

// ---- Schemas ----

const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv, ['date'])
// The schemas come from zod, whose URL check is the WHATWG URL parser (what browsers accept), not
// RFC 3986: links with spaces or non-ASCII paths are valid there. Mirror it so CI agrees with the
// site build. The schema's own `pattern: ^https?://` limits links to http(s).
ajv.addFormat('uri', (value) => /^https?:\/\//i.test(value.trim()) && URL.canParse(value.trim()))
const validators = {}
for (const kind of ['topics', 'series', 'edition', 'speaker', 'talk']) {
  const schema = JSON.parse(readFileSync(join(root, 'schema', `${kind}.schema.json`), 'utf8'))
  validators[kind] = ajv.compile(schema)
}

/** Parses and schema-checks one file. Returns its value, or undefined when it's invalid. */
function load(path, kind) {
  const file = rel(path)
  let value
  try {
    value = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    add(file, `not valid JSON: ${error.message}`)
    return undefined
  }
  const validate = validators[kind]
  if (validate(value)) return value
  for (const e of validate.errors) {
    const extra = e.params?.additionalProperty ? ` "${e.params.additionalProperty}"` : ''
    add(file, `${e.instancePath || '(root)'} ${e.message}${extra}`)
  }
  return undefined
}

const list = (dir) => (existsSync(dir) ? readdirSync(dir).sort() : [])
const isDir = (path) => statSync(path).isDirectory()

/** The `<slug>.json` files of a flat folder; anything else in it is an error. */
function jsonFiles(dir) {
  const out = []
  for (const name of list(dir)) {
    const path = join(dir, name)
    if (!isDir(path) && name.endsWith('.json')) out.push({ slug: name.slice(0, -5), path })
    else add(rel(path), 'unexpected entry (only <slug>.json files belong here)')
  }
  return out
}

// ---- Load ----

const topicsPath = join(root, 'topics.json')
const topics = existsSync(topicsPath) ? load(topicsPath, 'topics') : add('topics.json', 'missing')

const series = []
for (const name of list(join(root, 'conferences'))) {
  const dir = join(root, 'conferences', name)
  if (!isDir(dir)) {
    add(rel(dir), 'unexpected file (each series is a folder)')
    continue
  }
  const files = jsonFiles(dir)
  const seriesFile = files.find((f) => f.slug === 'series')
  if (seriesFile) load(seriesFile.path, 'series')
  else add(`conferences/${name}/series.json`, 'missing')
  const editions = files
    .filter((f) => f.slug !== 'series')
    .map((f) => ({ slug: f.slug, edition: load(f.path, 'edition') }))
  series.push({ slug: name, editions })
}

// Speaker and talk files that exist count for references even if their content is invalid,
// so one bad file doesn't also turn every reference to it into an error.
const speakers = jsonFiles(join(root, 'speakers')).map((f) => ({ slug: f.slug, speaker: load(f.path, 'speaker') }))
const talks = jsonFiles(join(root, 'talks')).map((f) => ({ slug: f.slug, talk: load(f.path, 'talk') }))

// ---- Cross-file checks (mirror checkDataset in conf-tracker's packages/contract/src/data.ts) ----

const paths = {
  topics: 'topics.json',
  series: (s) => `conferences/${s}/series.json`,
  edition: (s, e) => `conferences/${s}/${e}.json`,
  speaker: (s) => `speakers/${s}.json`,
  talk: (t) => `talks/${t}.json`,
}

const topicNames = new Set()
const topicSlugs = new Set()
for (const topic of topics ?? []) {
  if (topicSlugs.has(topic.slug)) add(paths.topics, `duplicate topic slug "${topic.slug}"`)
  if (topicNames.has(topic.name)) add(paths.topics, `duplicate topic name "${topic.name}"`)
  topicSlugs.add(topic.slug)
  topicNames.add(topic.name)
}
const speakerSlugs = new Set(speakers.map((s) => s.slug))
const talkFiles = new Map()

const checkSlug = (file, slug) => {
  if (!SLUG_PATTERN.test(slug)) add(file, `"${slug}" is not a valid slug (lowercase words joined by hyphens)`)
}
const checkTopics = (file, where, list) => {
  if (!topics) return // topics.json itself is broken; already reported
  for (const topic of list ?? []) {
    if (!topicNames.has(topic)) add(file, `${where}: unknown topic "${topic}" (not in topics.json)`)
  }
}
const checkSpeakers = (file, where, slugs) => {
  const seen = new Set()
  for (const slug of slugs) {
    if (!speakerSlugs.has(slug)) add(file, `${where}: unknown speaker "${slug}" (no ${paths.speaker(slug)})`)
    if (seen.has(slug)) add(file, `${where}: speaker "${slug}" is listed twice`)
    seen.add(slug)
  }
}
const claimTalk = (file, slug) => {
  const other = talkFiles.get(slug)
  if (other) add(file, `talk slug "${slug}" is already used in ${other}`)
  else talkFiles.set(slug, file)
}

for (const { slug: seriesSlug, editions } of series) {
  checkSlug(paths.series(seriesSlug), seriesSlug)
  for (const { slug, edition } of editions) {
    const file = paths.edition(seriesSlug, slug)
    checkSlug(file, slug)
    if (!edition) continue // schema errors already reported
    if (edition.year !== Number(edition.startDate.slice(0, 4))) {
      add(file, `year ${edition.year} doesn't match startDate ${edition.startDate}`)
    }
    if (edition.endDate < edition.startDate) {
      add(file, `endDate ${edition.endDate} is before startDate ${edition.startDate}`)
    }
    checkTopics(file, 'topics', edition.topics)
    checkSpeakers(file, 'speakers', (edition.speakers ?? []).map((s) => s.speaker))
    for (const talk of edition.talks ?? []) {
      claimTalk(file, talk.slug)
      checkSpeakers(file, `talk "${talk.slug}"`, talk.speakers)
      checkTopics(file, `talk "${talk.slug}"`, talk.topics)
    }
  }
}
for (const { slug } of speakers) checkSlug(paths.speaker(slug), slug)
for (const { slug, talk } of talks) {
  const file = paths.talk(slug)
  checkSlug(file, slug)
  claimTalk(file, slug)
  if (!talk) continue
  checkSpeakers(file, 'speakers', talk.speakers)
  checkTopics(file, 'topics', talk.topics)
}

// ---- Report ----

const fileCount = 1 + series.reduce((n, s) => n + 1 + s.editions.length, 0) + speakers.length + talks.length
if (errors.length === 0) {
  console.log(`OK: ${fileCount} files, ${series.length} series, ${speakers.length} speakers, ${talks.length} talks`)
  process.exit(0)
}

// In GitHub Actions, also emit annotations. File names and values come from the PR, so escape
// them: a raw newline would let a file start its own workflow command line.
const inActions = process.env.GITHUB_ACTIONS === 'true'
const escapeData = (s) => s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')
const escapeProperty = (s) => escapeData(s).replace(/:/g, '%3A').replace(/,/g, '%2C')
const oneLine = (s) => s.replace(/[\r\n]/g, ' ')

for (const { file, message } of errors) {
  if (inActions) console.log(`::error file=${escapeProperty(file)}::${escapeData(message)}`)
  else console.log(`${oneLine(file)}: ${oneLine(message)}`)
}
console.log(`\n${errors.length} problem(s) in ${new Set(errors.map((e) => e.file)).size} file(s)`)
process.exit(1)
