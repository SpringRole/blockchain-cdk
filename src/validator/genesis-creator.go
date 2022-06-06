package main

import (
    "fmt"
    "io/ioutil"
    "log"
//     "os"
//     "os/exec"
    "strings"
)

const VALIDATOR_COUNT = 4
const BOOT_NODE_COUNT = 2
const VALIDATOR_OUTPUT_PREFIX = "validator"
const GENESIS_ACCOUNT = "0xBC726feE350e4aFe042e5a2Ba7A130509EE4F3aC"
const PREMINE_NUM_TOKENS_IN_WEI = "1000000000000000000000"
const BLOCKCHAIN_NAME = "SpringRole"

const BOOTNODE_1_IP = "127.0.0.1" //public/private ip (without port)
const BOOTNODE_1_PORT = "10001" // libp2p port

const BOOTNODE_2_IP = "127.0.0.1"
const BOOTNODE_2_PORT = "20001"  // libp2p port

// TODO: Add localhost support
// var STAGE_ENV = os.Getenv("STAGE")
// var IS_LOCAL = STAGE_ENV == "localhost"

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
    fileName := fmt.Sprint(VALIDATOR_OUTPUT_PREFIX, i+1, "Output.txt")
    publicKeys[i], nodeIds[i] = getPublicKeyAndNodeId(fileName)
  }

  // NOTE: Don't Concatinate, flags should be passed individually

  // TODO: make all nodes as bootnodes
  flags := []string{
    "genesis", // subcommand
    "--consensus", "ibft",
    "--ibft-validator", publicKeys[0],
    "--ibft-validator", publicKeys[1],
    "--ibft-validator", publicKeys[2],
    "--ibft-validator", publicKeys[3],
    "--bootnode", constructMultiAddressConnectionString(BOOTNODE_1_IP, BOOTNODE_1_PORT, nodeIds[0]),
    "--bootnode", constructMultiAddressConnectionString(BOOTNODE_2_IP, BOOTNODE_2_PORT, nodeIds[1]),
    "--premine",fmt.Sprint(GENESIS_ACCOUNT, ":", PREMINE_NUM_TOKENS_IN_WEI),
    "--name",BLOCKCHAIN_NAME}

  // NOTE: don't include subcommand ex: genesis_command := "polygon-edge genesis"
  // Error Faced: panic: exec: "polygon-edge genesis": executable file not found in $PATH
  genesis_command := "polygon-edge"
  return genesis_command, flags
}


func createValidators(){
  fmt.Println("Creating validators")
  // Runs the script which creates the validators and presists the output in a file
  executeBashScript("./create_validators.sh")
}

func createGenesisFile(){
  fmt.Println("Running createGenesisFile")
  var genesis_command, flags = constructGenesisCommand()
  executeCommand(genesis_command, flags)
}

func initiateValidatorsAndCreateGenesisFile(){
    createValidators()
    createGenesisFile()
}