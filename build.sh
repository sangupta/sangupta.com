# !/bin/bash

go install github.com/jondot/goweight@latest
echo $GOROOT
echo $GOPATH
$GOPATH/go/bin/goweight --help
