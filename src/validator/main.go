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

func main() {


//     genesis_command := "polygon-edge"
//     flags := []string{
//     "genesis", --consensus ibft  --ibft-validator=0x50e959B55E28598261C4e9131B725EfC0499FBfB --ibft-validator=0x1461b208685925DdF206e0a544F3E929878295d0 --ibft-validator=0xE427fd44851b4068afAAEc89a1D00F22960d6063 --ibft-validator=0xE4DE88714D6f059F1D64685093C87cE5A7DFE4E2 --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmN2XoLnx5obfG25tvN5S3PUGsQ1P4Z9QTc1dvs4mKAPnv --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAkvE2MBoCXBFXSu3z8HhvppNp1UERk1Dm117SHXcvkZ95k --premine=0xBC726feE350e4aFe042e5a2Ba7A130509EE4F3aC:1000000000000000000000 --name=SpringRole
//     }
//     executeCommand(genesis_command, flags)


    fmt.Println("Starting Validator...")
    fmt.Println("VALIDATOR_NAME", VALIDATOR_NAME)

    if VALIDATOR_NAME == "" {
        panic("VALIDATOR_NAME is empty")
    }

    // Check for genesis file
    if _, err := os.Stat("genesis.json"); errors.Is(err, os.ErrNotExist) {
      if VALIDATOR_NAME == "validator1" {
        initiateValidatorsAndCreateGenesisFile()
        // TODO: if above fails exit
      } else {

       // wait for 2 min
       fmt.Println("genesis.json file not found, waiting for 2 min")
       time.Sleep(120 * time.Second)

        // check again for genesis.json
       if _, err := os.Stat("genesis.json"); errors.Is(err, os.ErrNotExist){
        panic(fmt.Sprint("genesis.json file not found!"))
       }

      }

    } else {
        fmt.Println("genesis.json file is present")
    }

    // ex: config-validator1.json
    config_path := fmt.Sprint("config-", VALIDATOR_NAME, ".json")

    // Check for secrets manager config file
    if _, err := os.Stat(config_path); errors.Is(err, os.ErrNotExist) {
      panic(fmt.Sprint(config_path, " file not found!"))
    }

    // Execute the polygon-edge server for validator
    args := []string{
                    "server", // subcommand
                    "--data-dir", fmt.Sprint("./", VALIDATOR_NAME, "-data"), //ex: ./validator1-data
                    "--secrets-config", config_path,
                    "--grpc-address", fmt.Sprint(":", GRPC_PORT),
                    "--libp2p", fmt.Sprint(":", LIBP2P_PORT),
                    "--jsonrpc", fmt.Sprint(":", JSONRPC_PORT),
                    "--seal"}

    executeCommand("polygon-edge", args)

//     // Execute the polygon-edge server for validator
//     run_validator_file := fmt.Sprint("run-", VALIDATOR_NAME, ".json")
//     executeBashScript(run_validator_file)
}
