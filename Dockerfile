FROM rust:1.50

# these steps will cause the dependencies to be cached
RUN cargo new --bin mqlfiddle-api
WORKDIR /mqlfiddle-api
COPY ./mqlfiddle-api/Cargo.toml ./Cargo.toml
COPY ./mqlfiddle-api/Cargo.lock ./Cargo.lock
RUN cargo build --release

# these steps will actually build the project
RUN rm src/*.rs
COPY ./mqlfiddle-api/src ./src
RUN rm ./target/release/deps/mqlfiddle_api*
RUN cargo build --release

FROM node:15
WORKDIR /usr/src/mqlfiddle
COPY . .
RUN cd mqlfiddle-fe && yarn install && yarn build

FROM debian:buster-slim
WORKDIR /srv/mqlfiddle
COPY --from=0 /mqlfiddle-api/target/release/mqlfiddle-api .
COPY --from=1 /usr/src/mqlfiddle/mqlfiddle-fe/build/ ./web
EXPOSE 8080
CMD ["./mqlfiddle-api"]