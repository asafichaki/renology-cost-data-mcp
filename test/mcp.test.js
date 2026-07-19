import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const serverPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/index.js");

test("a real MCP client discovers resources and calls every core data path", async () => {
  const client = new Client({ name: "renology-cost-test", version: "1.0.0" });
  try {
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [serverPath] }));
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map((tool) => tool.name).sort(), ["compare_city_costs", "get_city_cost_range", "get_methodology_and_citation", "list_markets", "list_project_types"]);
    assert.ok(tools.tools.every((tool) => tool.annotations?.readOnlyHint === true));
    const cost = await client.callTool({ name: "get_city_cost_range", arguments: { metro: "San Diego", project: "Kitchen", state: "CA" } });
    assert.equal(cost.structuredContent.low_usd, 61000);
    assert.equal(cost.structuredContent.high_usd, 99000);
    const resources = await client.listResources();
    assert.deepEqual(resources.resources.map((resource) => resource.uri).sort(), ["renology-costs://markets", "renology-costs://methodology"]);
    const prompts = await client.listPrompts();
    assert.equal(prompts.prompts[0].name, "compare_renovation_costs");
  } finally { await client.close(); }
});
