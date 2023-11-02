FROM golang as build

WORKDIR /app

RUN go get github.com/go-sql-driver/mysql
RUN go get github.com/oklog/ulid/v2

COPY go.mod ./
RUN go mod download && go mod tidy

COPY main.go ./
RUN go build -o /app/main

ENTRYPOINT ["/app/main"]