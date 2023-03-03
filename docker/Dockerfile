FROM node:19.7

RUN apt update && \
    apt install -y graphicsmagick

COPY ./entrypoint.sh /

WORKDIR /adventure

ENTRYPOINT [ "/entrypoint.sh" ]

CMD [ "/usr/local/bin/npm", "run", "dev", "--", "--host", "0.0.0.0" ]