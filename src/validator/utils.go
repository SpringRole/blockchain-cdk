package main

import (
    "bufio"
    "fmt"
    "io"
    "os/exec"
)


func copyOutput(r io.Reader) {
    scanner := bufio.NewScanner(r)
    for scanner.Scan() {
        fmt.Println(scanner.Text())
    }
}

func executeCommand(main_command string, args []string){
    fmt.Println("running executeCommand", main_command, args)
    cmd := exec.Command(main_command, args...)
    stdout, err := cmd.StdoutPipe()
    if err != nil {
        panic(err)
    }
    stderr, err := cmd.StderrPipe()
    if err != nil {
        panic(err)
    }
    err = cmd.Start()
    if err != nil {
        panic(err)
    }

    go copyOutput(stdout)
    go copyOutput(stderr)
    cmd.Wait() // wait for completion
  }

func executeBashScript(filePath string){
  fmt.Println("Executing script", filePath)
  executeCommand("/bin/bash", []string{filePath})
}

func executeBashScriptWithArgs(filePath string, args []string){
  fmt.Println("Executing script", filePath, args)
  var _args = []string{filePath}
  _args = append(_args, args...) // Append args which are passed to script
  executeCommand("/bin/bash", _args)
}