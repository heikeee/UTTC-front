FROM golang as build

WORKDIR /cd-app

COPY go.mod ./
RUN go mod download && go mod tidy

COPY main.go ./
RUN go build -o /app/main

ENTRYPOINT ["/app/main"]