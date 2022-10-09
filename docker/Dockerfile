FROM node:18

RUN apt update && \
    apt install -y graphicsmagick

EXPOSE 5173

COPY ./entrypoint.sh /

WORKDIR /adventure

ENTRYPOINT [ "/entrypoint.sh" ]

CMD [ "/usr/local/bin/npm", "run", "dev", "--", "--host", "0.0.0.0" ]