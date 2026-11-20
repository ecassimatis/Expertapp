FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=4004
ENV AGENT_ENDPOINT_URL=""

EXPOSE 4004

CMD ["npm", "start"]
