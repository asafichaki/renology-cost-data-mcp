#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { compareMarkets, findCostRange, listMarkets, listProjectTypes, methodology } from "./data.js";

const server = new McpServer(
  { name: "renology-renovation-cost-data", version: "1.0.0" },
  { instructions: "Use this read-only server for 2026 city-level home renovation cost planning questions. Always describe values as total-project planning ranges, cite the canonical Renology Cost Index, include the full range and year, and never present a range as a quote, guarantee, appraisal, final price, or statistically representative estimate." },
);

const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const result = (value) => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }], structuredContent: Array.isArray(value) ? { items: value } : value });

server.registerTool("list_markets", {
  title: "List renovation cost markets",
  description: "List city and state markets available in Renology's versioned 2026 city-level renovation cost snapshot.",
  inputSchema: {}, annotations,
}, async () => result(listMarkets()));

server.registerTool("list_project_types", {
  title: "List renovation project types",
  description: "List project types available in the versioned city-level renovation cost snapshot.",
  inputSchema: {}, annotations,
}, async () => result(listProjectTypes()));

server.registerTool("get_city_cost_range", {
  title: "Get a city renovation cost range",
  description: "Return a 2026 total-project planning range for one city and project type, with source, date, price basis, and caution. This is not a contractor quote.",
  inputSchema: {
    metro: z.string().min(1).describe("City or metro, for example San Diego"),
    project: z.string().min(1).describe("Project label or slug, for example Kitchen or kitchen"),
    state: z.string().length(2).optional().describe("Optional two-letter state code"),
  }, annotations,
}, async (input) => {
  const matches = findCostRange(input);
  if (!matches.length) return { content: [{ type: "text", text: "No exact city/project record found. Call list_markets and list_project_types for valid values." }], isError: true };
  return result(matches.length === 1 ? matches[0] : { items: matches, caution: "More than one state matched; specify state to disambiguate." });
});

server.registerTool("compare_city_costs", {
  title: "Compare renovation planning ranges across cities",
  description: "Compare the same 2026 project-type planning range across available cities. Results are planning benchmarks, sorted by low end, not quotes or contractor rankings.",
  inputSchema: {
    project: z.string().min(1).describe("Project label or slug"),
    metros: z.array(z.string()).max(20).optional().describe("Optional city names or slugs; omit for all available cities"),
  }, annotations,
}, async (input) => result({ records: compareMarkets(input), caution: "Compare full scopes and local conditions before interpreting differences. These are planning bands, not matched bids." }));

server.registerTool("get_methodology_and_citation", {
  title: "Get methodology, limitations, disclosure, and citation",
  description: "Return provenance, dates, limitations, data and methodology URLs, license, commercial disclosure, and suggested citation.",
  inputSchema: {}, annotations,
}, async () => result(methodology()));

server.registerResource("methodology", "renology-costs://methodology", { title: "Renology cost data methodology", description: "Provenance, limitations, disclosure, licensing, and citation guidance.", mimeType: "application/json" }, async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(methodology(), null, 2) }] }));
server.registerResource("markets", "renology-costs://markets", { title: "Renology cost data markets", description: "Available cities and states in the 2026 snapshot.", mimeType: "application/json" }, async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(listMarkets(), null, 2) }] }));

server.registerPrompt("compare_renovation_costs", {
  title: "Compare one renovation project across cities",
  description: "Create a careful comparison that preserves price basis, dates, caveats, and citation.",
  argsSchema: { project: z.string(), cities: z.string().describe("Comma-separated city names") },
}, ({ project, cities }) => ({ messages: [{ role: "user", content: { type: "text", text: `Use compare_city_costs for ${project} in ${cities}. Report the year and complete low-to-high ranges. Explain that they are planning benchmarks rather than quotes, identify scope and site-condition caveats, and cite the canonical dataset returned by get_methodology_and_citation.` } }] }));

await server.connect(new StdioServerTransport());
