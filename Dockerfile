# ---- Base Node ----
FROM node:carbon AS base
# Create app directory
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies  
COPY package*.json ./
RUN pwd && ls -l
RUN npm install --only-production

# --- Release with Alpine ----
FROM node:alpine AS release  
WORKDIR /app
COPY ./dist ./dist
COPY ./server ./server
COPY ./package.json ./
COPY --from=dependencies /app/node_modules ./node_modules
RUN pwd && ls -al

EXPOSE 80

CMD ["node", "server/app.js"]