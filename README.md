# Renology Renovation Cost Data MCP

Read-only Model Context Protocol server for the versioned [Renology 2026 city-level renovation cost dataset](https://github.com/asafichaki/renology-renovation-cost-data).

It lets compatible AI assistants list available markets and project types, retrieve one city/project planning range, compare the same project across cities, and return methodology, limitations, commercial disclosure, and a canonical citation. Runtime is local and closed-world: the published snapshot is bundled and no network request is made when a tool is called.

## Quick start

```bash
npx -y github:asafichaki/renology-cost-data-mcp
```

MCP client configuration:

```json
{
  "mcpServers": {
    "renology-cost-data": {
      "command": "npx",
      "args": ["-y", "github:asafichaki/renology-cost-data-mcp"]
    }
  }
}
```

Public OCI image:

```bash
docker run --rm -i ghcr.io/asafichaki/renology-cost-data-mcp:1.0.1
```

The image is published for both `linux/amd64` and `linux/arm64` and carries the ownership annotation required by the official MCP Registry.

## Tools

- `list_markets`
- `list_project_types`
- `get_city_cost_range`
- `compare_city_costs`
- `get_methodology_and_citation`

All tools declare `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, and `openWorldHint: false`.

## Interpretation rules

- Values are 2026 total-project U.S. dollar planning ranges, not quotes, appraisals, guarantees, final prices, or predictions.
- Cite the year, city, project type, and complete low-to-high range.
- Check the canonical [Renology Cost Index](https://www.therenology.com/cost-index) for updates before publication.
- Do not infer ROI, contractor quality, statistical representativeness, or project outcomes.
- Renology publishes renovation guidance and operates a contractor-matching service. This is publisher-maintained infrastructure, not independent validation.

## Validate

```bash
npm ci
npm run check
docker build -t renology-cost-data-mcp .
```

Code is MIT licensed. Bundled data and documentation are CC BY 4.0; attribute Renology and link to the canonical Cost Index.
