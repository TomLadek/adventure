FROM node:18

EXPOSE 5173

WORKDIR /adventure

RUN npm install \
    && npm run lint

CMD ["/usr/local/bin/npm", "run", "dev", "--", "--host", "0.0.0.0"]