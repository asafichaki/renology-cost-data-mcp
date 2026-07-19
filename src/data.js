import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(currentDirectory, "../data/city-cost-ranges-2026.json");
export const dataset = JSON.parse(fs.readFileSync(dataPath, "utf8"));
export const records = dataset.records;

function normalize(value) {
  return String(value ?? "").trim().toLocaleLowerCase("en-US");
}

function publicRecord(record) {
  return {
    year: record.year,
    state: record.state,
    metro: record.metro,
    project: record.project,
    low_usd: record.low_usd,
    high_usd: record.high_usd,
    price_basis: record.price_basis,
    source_url: record.source_url,
    upstream_date_modified: record.upstream_date_modified,
    retrieved_at: record.retrieved_at,
    caution: "Planning benchmark, not a quote or prediction of final cost.",
  };
}

export function listMarkets() {
  return [...new Map(records.map((record) => [`${record.state}/${record.metro_slug}`, { state: record.state, metro: record.metro, metro_slug: record.metro_slug }])).values()]
    .sort((a, b) => `${a.state}/${a.metro}`.localeCompare(`${b.state}/${b.metro}`));
}

export function listProjectTypes() {
  return [...new Map(records.map((record) => [record.project_slug, { project: record.project, project_slug: record.project_slug }])).values()]
    .sort((a, b) => a.project.localeCompare(b.project));
}

export function findCostRange({ metro, project, state } = {}) {
  return records
    .filter((record) => normalize(record.metro) === normalize(metro) || normalize(record.metro_slug) === normalize(metro))
    .filter((record) => normalize(record.project) === normalize(project) || normalize(record.project_slug) === normalize(project))
    .filter((record) => !state || normalize(record.state) === normalize(state))
    .map(publicRecord);
}

export function compareMarkets({ project, metros } = {}) {
  const wanted = new Set((metros ?? []).map(normalize));
  return records
    .filter((record) => normalize(record.project) === normalize(project) || normalize(record.project_slug) === normalize(project))
    .filter((record) => wanted.size === 0 || wanted.has(normalize(record.metro)) || wanted.has(normalize(record.metro_slug)))
    .map(publicRecord)
    .sort((a, b) => a.low_usd - b.low_usd || a.metro.localeCompare(b.metro));
}

export function methodology() {
  return {
    dataset: dataset.title,
    publisher: dataset.publisher,
    temporal_coverage: dataset.temporal_coverage,
    record_count: dataset.record_count,
    method: "City-level records are copied from Renology's public Cost Index JSON, restricted to scope=city, labeled explicitly as total-project U.S. dollar planning ranges, and sorted deterministically.",
    canonical_dataset: dataset.canonical_url,
    canonical_methodology: dataset.methodology_url,
    reproducible_release: "https://github.com/asafichaki/renology-renovation-cost-data",
    source_snapshot: dataset.source_url,
    upstream_date_modified: dataset.upstream_date_modified,
    retrieved_at: dataset.retrieved_at,
    license: dataset.license,
    limitations: [
      "The ranges are planning benchmarks, not quotes, appraisals, guarantees, predictions, or a statistically representative survey.",
      "Coverage is limited to city/project combinations published in the upstream dataset.",
      "Actual bids vary with scope, access, permits, site conditions, demolition, utilities, materials, labor, and finish level.",
      "Do not infer ROI, contractor quality, or project outcomes from these records.",
      "Check the canonical Cost Index for updates before publication."
    ],
    commercial_disclosure: dataset.commercial_disclosure,
    suggested_citation: "Renology. (2026). 2026 U.S. Home Renovation Planning Cost Data (v1.0.0) [Data set]. https://www.therenology.com/cost-index"
  };
}
