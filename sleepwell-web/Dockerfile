FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json yarn.lock ./
RUN npm install

COPY . .

# COPY next.config.js ./next.config.js

# COPY pages ./pages
# COPY public ./public
# COPY styles ./styles
# COPY

EXPOSE 3000
CMD ["npm" , "start"]