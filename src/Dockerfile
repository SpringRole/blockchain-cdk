# syntax=docker/dockerfile:1
FROM golang

WORKDIR  /app

RUN go install github.com/0xPolygon/polygon-edge@develop

COPY . .

# EXPOSE PORTS
# CMD ["go", "run", "main.go"]
CMD ["polygon-edge","server", "export"]