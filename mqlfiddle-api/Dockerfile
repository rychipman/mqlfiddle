FROM rust:latest
EXPOSE 5000
ADD . .
RUN apt-get update && rm -rf /var/lib/apt/lists/*
RUN cargo install --path .
CMD ["mqlfiddle-api"]
