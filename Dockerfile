FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.js index.html ./
COPY css css
COPY js js
COPY images images
ENV HOST=0.0.0.0
ENV PORT=80
EXPOSE 80
CMD ["node", "server.js"]
