FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
COPY package.json ./
EXPOSE 3002
CMD ["node", "src/index.js"]