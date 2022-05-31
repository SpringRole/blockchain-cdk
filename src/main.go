package main

import (
    "fmt"
    "io/ioutil"
    "log"
    "os"
    "os/exec"
    "strings"
)

var VALIDATOR_NAME = os.Getenv("VALIDATOR_NAME")

func executeBashScript(filePath string){
  fmt.Println("Executing script", filePath)
  _, err := exec.Command("/bin/bash", filePath).Output()
  if err != nil {
     fmt.Println("error while executing script", err)
  } else {
    fmt.Println("Successfully ran script")
  }
}


func main() {


      fmt.Println("Creating server.sh file")

      config_path = fmt.Sprint("config-", VALIDATOR_NAME, ".json")
      server_command := fmt.Sprint("polygon-edge server --config ", config_path)

     // NOTE: Can't run directly exec.Command(server_command), it throws file not found error

     // Hence writing to a .sh file and executing
      file_path := "/tmp/server.sh"
      _bytes := []byte(server_command)
      err := os.WriteFile(file_path, _bytes, 0644)
      if err != nil {
         fmt.Println("error while creating "+ file_path, err)
      }

      // Runs the script which creates the validators and persists the output in a file
       executeBashScript(file_path)

}
