import assert from "node:assert/strict";
import test from "node:test";
import { compareMarkets, dataset, findCostRange, listMarkets, listProjectTypes, methodology } from "../src/data.js";

test("bundled dataset and discovery lists are valid", () => {
  assert.equal(dataset.record_count, 28);
  assert.ok(listMarkets().some((item) => item.metro === "San Diego"));
  assert.ok(listProjectTypes().some((item) => item.project_slug === "kitchen"));
});

test("San Diego kitchen returns the canonical planning range", () => {
  const [record] = findCostRange({ metro: "san-diego", project: "kitchen", state: "CA" });
  assert.equal(record.low_usd, 61000);
  assert.equal(record.high_usd, 99000);
  assert.equal(record.price_basis, "total_project_usd");
  assert.equal(record.source_url, "https://www.therenology.com/cost-index");
});

test("comparisons preserve caveats and citation metadata", () => {
  assert.ok(compareMarkets({ project: "kitchen" }).length >= 5);
  const meta = methodology();
  assert.match(meta.commercial_disclosure, /contractor-matching/i);
  assert.match(meta.suggested_citation, /Renology/);
  assert.equal(meta.limitations.length, 5);
});
