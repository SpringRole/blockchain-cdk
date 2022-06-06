# syntax=docker/dockerfile:1
FROM golang

WORKDIR  /app

ENV GOPROXY direct

RUN go install github.com/0xPolygon/polygon-edge@develop

COPY . .

# EXPOSE PORTS
CMD ["go", "run", "main.go", "genesis-creator.go", "utils.go"]
#CMD ["polygon-edge","server", "export"]