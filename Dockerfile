FROM node:24.17.0-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/game/package.json apps/game/package.json
RUN npm ci

FROM node:24.17.0-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24.17.0-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL=true
ENV RPG_SAVE_DIR=/data/saves
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/game/package.json ./apps/game/package.json
COPY --from=build /app/apps/game/dist ./apps/game/dist
COPY --from=build /app/unity/Builds/WebGL ./unity/Builds/WebGL
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 8080
CMD ["npm", "run", "start"]
