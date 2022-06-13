package main

import (
    "fmt"
    "os"
    "time"
    "errors"
)

var VALIDATOR_NAME = os.Getenv("VALIDATOR_NAME")
var GRPC_PORT = os.Getenv("GRPC_PORT")
var LIBP2P_PORT = os.Getenv("LIBP2P_PORT")
var JSONRPC_PORT = os.Getenv("JSONRPC_PORT")

var STAGE_ENV = os.Getenv("STAGE")
var IS_LOCAL = STAGE_ENV == "localhost"

var VOLUME_PATH = "/blockchain-state/"
// NOTE: path if changed, should also be changed in create_validators.sh and create_validators_local.sh
var APP_PATH =  fmt.Sprint(VOLUME_PATH, "app/")

var GENESIS_FILE_PATH = fmt.Sprint(APP_PATH, "genesis.json")


func validateEnvVars(){

    if VALIDATOR_NAME == "" {
        panic("VALIDATOR_NAME is empty")
    }

    if GRPC_PORT == "" {
        panic("GRPC_PORT is empty")
    }

    if LIBP2P_PORT == "" {
        panic("LIBP2P_PORT is empty")
    }

    if JSONRPC_PORT == "" {
        panic("JSONRPC_PORT is empty")
    }
}

func createGenesisIfNotPresent(){
    // Check for genesis file
    if _, err := os.Stat(GENESIS_FILE_PATH); errors.Is(err, os.ErrNotExist) {
      if VALIDATOR_NAME == "validator1" {
        initiateValidatorsAndCreateGenesisFile()
        // TODO: if above fails exit

        // check again for genesis.json, sometimes due to command issues, it would complain and continue
        if _, err := os.Stat(GENESIS_FILE_PATH); errors.Is(err, os.ErrNotExist){
         panic("genesis.json file not found!")
        }

      } else {

       // wait for 1 min for other validators, ETA: ~30sec to generate file, adding extra 30sec for buffer
       fmt.Println("genesis.json file not found, waiting for 1 min")
       time.Sleep(60 * time.Second)

        // check again for genesis.json
       if _, err := os.Stat(GENESIS_FILE_PATH); errors.Is(err, os.ErrNotExist){
        panic("genesis.json file not found!")
       }

      }

    } else {
        fmt.Println("genesis.json file is present")
    }
}


func getSecretsConfig() string{
    // ex: config-validator1.json
    config_path := fmt.Sprint(APP_PATH, "config-", VALIDATOR_NAME, ".json")

    // Check for secrets manager config file
     if _, err := os.Stat(config_path); errors.Is(err, os.ErrNotExist) {
        panic(fmt.Sprint(config_path, " file not found!"))
     }

    return config_path
}

func main() {


    fmt.Println("Starting Validator...")
    fmt.Println("VALIDATOR_NAME", VALIDATOR_NAME)

    validateEnvVars()
    createGenesisIfNotPresent()

    var data_dir string;
    if IS_LOCAL {
        data_dir = fmt.Sprint(APP_PATH, "test-data-", VALIDATOR_NAME)
    } else {
        data_dir = fmt.Sprint(APP_PATH, VALIDATOR_NAME, "-data") //ex: /validator1-data
    }

    // Currently all validators are running on same network (localhost)
    // If NAT or DNS should be configured in future, we need to change the code below, introducing --nat or --dns
    // https://edge-docs.polygon.technology/docs/get-started/set-up-ibft-on-the-cloud#step-4-run-all-the-clients

    // Execute the polygon-edge server for validator
    args := []string{
                    "server", // subcommand
                    "--data-dir", data_dir,
                    "--grpc-address", fmt.Sprint(":", GRPC_PORT),
                    "--libp2p", fmt.Sprint(":", LIBP2P_PORT),
                    "--jsonrpc", fmt.Sprint(":", JSONRPC_PORT),
                    "--chain", GENESIS_FILE_PATH,
                    "--seal",}

    if !IS_LOCAL {
        config_path := getSecretsConfig()
        args = append(args, "--secrets-config", config_path)
    }

    executeCommand("polygon-edge", args)
    panic("Shutting down validator!") // Ideally this shouldn't reach

}
