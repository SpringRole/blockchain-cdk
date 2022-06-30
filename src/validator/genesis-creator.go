package main

import (
    "fmt"
    "io/ioutil"
    "log"
    "strings"
    "os"
)

const VALIDATOR_COUNT = 4
const VALIDATOR_OUTPUT_PREFIX = "validator"
var GENESIS_ACCOUNT =  os.Getenv("GENESIS_ACCOUNT")
var PREMINE_NUM_TOKENS_IN_WEI = os.Getenv("PREMINE_NUM_TOKENS_IN_WEI")
var BLOCKCHAIN_NAME = os.Getenv("BLOCKCHAIN_NAME")

var BOOTNODE_1_IP =  os.Getenv("BOOTNODE_1_IP") //public/private ip (without port)
var BOOTNODE_1_PORT = os.Getenv("BOOTNODE_1_PORT") // libp2p port

var BOOTNODE_2_IP = os.Getenv("BOOTNODE_2_IP")
var BOOTNODE_2_PORT = os.Getenv("BOOTNODE_2_PORT")  // libp2p port

// aws region - used for SSM parameter store
var AWS_REGION = os.Getenv("AWS_REGION")

func validateGenesisEnvVars(){

    if GENESIS_ACCOUNT == "" {
        panic("GENESIS_ACCOUNT is empty")
    }

    if PREMINE_NUM_TOKENS_IN_WEI == "" {
        panic("PREMINE_NUM_TOKENS_IN_WEI is empty")
    }

    if BLOCKCHAIN_NAME == "" {
        panic("BLOCKCHAIN_NAME is empty")
    }

    if BOOTNODE_1_IP == "" {
        panic("BOOTNODE_1_IP is empty")
    }

    if BOOTNODE_2_IP == "" {
        panic("BOOTNODE_2_IP is empty")
    }

    if BOOTNODE_1_PORT == "" {
        panic("BOOTNODE_1_PORT is empty")
    }

    if BOOTNODE_2_PORT == "" {
        panic("BOOTNODE_2_PORT is empty")
    }

    if !IS_LOCAL && AWS_REGION == "" {
        panic("AWS_REGION shouldn't be empty for non-localhost stage")
    }
}

func getPublicKeyAndNodeId(fileName string) (string, string) {

    // The ioutil package contains inbuilt
    // methods like ReadFile that reads the
    // filename and returns the contents.
    data, err := ioutil.ReadFile(fileName)
    if err != nil {
        log.Panicf("failed reading data from file: %s", err)
    }

    lines := strings.Split(string(data), "\n")

    if len(lines) <= 1 {
        log.Panicf("empty file, secrets aren't generated")
    }

    publicKey := strings.Split(lines[2], "= ")[1]
    nodeID := strings.Split(lines[3], "= ")[1]

    return publicKey, nodeID
}


func constructMultiAddressConnectionString(ip, port, nodeId string) string {
  return fmt.Sprint("/ip4/", ip, "/tcp/", port, "/p2p/", nodeId)
}


func constructGenesisCommand() (string, []string) {

  var publicKeys [4]string
  var nodeIds [4]string



  for i := 0; i < VALIDATOR_COUNT; i++ {
    // concatenate
    fileName := fmt.Sprint(APP_PATH, VALIDATOR_OUTPUT_PREFIX, i+1, "Output.txt")
    publicKeys[i], nodeIds[i] = getPublicKeyAndNodeId(fileName)
  }

  // NOTE: Don't Concatinate, flags should be passed individually

  // TODO: make all nodes as bootnodes
  var flags = []string{
              "genesis", // subcommand
              "--consensus", "ibft",
              "--bootnode", constructMultiAddressConnectionString(BOOTNODE_1_IP, BOOTNODE_1_PORT, nodeIds[0]),
              "--bootnode", constructMultiAddressConnectionString(BOOTNODE_2_IP, BOOTNODE_2_PORT, nodeIds[1]),
              "--premine",fmt.Sprint(GENESIS_ACCOUNT, ":", PREMINE_NUM_TOKENS_IN_WEI),
              "--name",BLOCKCHAIN_NAME,
              "--dir", GENESIS_FILE_PATH};

   if IS_LOCAL {
        flags = append(flags,  "--ibft-validators-prefix-path", fmt.Sprint(APP_PATH, "test-data-"))
   } else {
       flags = append(flags,
                "--ibft-validator", publicKeys[0],
                "--ibft-validator", publicKeys[1],
                "--ibft-validator", publicKeys[2],
                "--ibft-validator", publicKeys[3])
   }

  // NOTE: don't include subcommand ex: genesis_command := "polygon-edge genesis"
  // Error Faced: panic: exec: "polygon-edge genesis": executable file not found in $PATH
  genesis_command := "polygon-edge"
  return genesis_command, flags
}


func createValidators(){
  fmt.Println("Creating validators")
  // Runs the script which creates the validators and persists the output in a file

  fmt.Println("Creating directory: ", APP_PATH)
  // create "app" folder inside volume
  if err := os.MkdirAll(APP_PATH, os.ModePerm); err != nil {
     log.Fatal(err)
  }

  if IS_LOCAL {
    executeBashScript("./create_validators_local.sh")
  } else {
    executeBashScriptWithArgs("./create_validators.sh", []string{AWS_REGION})
  }

}

func createGenesisFile(){
  fmt.Println("Running createGenesisFile")
  var genesis_command, flags = constructGenesisCommand()
  executeCommand(genesis_command, flags)
}

func initiateValidatorsAndCreateGenesisFile(){
    validateGenesisEnvVars()
    createValidators()
    createGenesisFile()
}