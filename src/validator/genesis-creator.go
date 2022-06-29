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
const GENESIS_ACCOUNT = "0xed4834Af469FE0F501a0A94c2f45EcC14b7E2C03"
const PREMINE_NUM_TOKENS_IN_WEI = "100000000000000000000000000"
const BLOCKCHAIN_NAME = "SpringRole"

const BOOTNODE_1_IP = "127.0.0.1" //public/private ip (without port)
const BOOTNODE_1_PORT = "10001" // libp2p port

const BOOTNODE_2_IP = "127.0.0.1"
const BOOTNODE_2_PORT = "20001"  // libp2p port

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

  var filePath string
  if IS_LOCAL {
    filePath = "./create_validators_local.sh"
  } else {
    filePath = "./create_validators.sh"
  }
  executeBashScript(filePath)
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