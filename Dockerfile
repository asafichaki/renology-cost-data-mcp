FROM node:20-alpine
LABEL org.opencontainers.image.source="https://github.com/asafichaki/renology-cost-data-mcp"
LABEL org.opencontainers.image.description="Read-only MCP server for Renology city-level home renovation planning cost data"
LABEL org.opencontainers.image.licenses="MIT"
LABEL io.modelcontextprotocol.server.name="io.github.asafichaki/renology-cost-data"
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY data ./data
USER node
ENTRYPOINT ["node", "src/index.js"]
