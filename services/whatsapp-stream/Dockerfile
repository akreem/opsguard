FROM node:20-alpine

WORKDIR /app

# Copy service definition
COPY package.json ./

# Copy service code
COPY server.js dialogueGenerator.js ./

ENV PORT=3002
ENV NODE_ENV=production
ENV OPSGUARD_CORE_URL=http://opsguard-core:3000
ENV STREAM_INTERVAL_MS=4500

EXPOSE 3002

HEALTHCHECK --interval=15s --timeout=5s --start-period=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3002/health || exit 1

CMD ["node", "server.js"]
