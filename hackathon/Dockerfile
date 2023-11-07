FROM golang:1.21-bullseye as builder

WORKDIR /app

COPY . ./
RUN go mod download && go mod tidy


RUN go build -v -o main

EXPOSE 8080

ENTRYPOINT ["/app/main"]