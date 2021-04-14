FROM rust:1.50

WORKDIR /usr/src/mqlfiddle
COPY . .

RUN cargo install --path ./mqlfiddle-api

EXPOSE 5000:5000
CMD ["mqlfiddle-api"]