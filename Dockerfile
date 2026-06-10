FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/game/package.json apps/game/package.json
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/game/node_modules ./apps/game/node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV RPG_SAVE_DIR=/data/saves
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/game/package.json ./apps/game/package.json
COPY --from=build /app/apps/game/dist ./apps/game/dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/game/node_modules ./apps/game/node_modules
EXPOSE 8080
CMD ["npm", "run", "start"]
