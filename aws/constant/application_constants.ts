import {Validator} from "../interfaces/application_config";

export const validatorTaskMemoryLimitMiB = 512;
export const validatorTaskCpu = 256;
export const validatorServiceTaskCount = 1;

export const pipeline = {
    accountId: process.env.ACCOUNT_ID,
    region: process.env.REGION
}

export const ssmResource = `arn:aws:ssm:${pipeline.region}:${pipeline.accountId}:parameter/blockchain/validator*`

export const blockchainVolumeName = "blockchain-volume";

export const VALIDATOR1 = "Validator1";

export const validators: Validator[] = [
    {
        id: VALIDATOR1,
        envVars: {
            "VALIDATOR_NAME": "validator1",
            "GRPC_PORT": "10000", // NOTE: env variables has to be string
            "LIBP2P_PORT": "10001", // Note remember to change the bootnode port
            "JSONRPC_PORT": "10002",
            "STAGE": process.env.STAGE || "prod"
        }
    },
    {
        id: "Validator2",
        envVars: {
            "VALIDATOR_NAME": "validator2",
            "GRPC_PORT": "20000",
            "LIBP2P_PORT": "20001",  // Note remember to change the bootnode port
            "JSONRPC_PORT": "20002",
            "STAGE":  process.env.STAGE || "prod"
        }
    },
    {
        id: "Validator3",
        envVars: {
            "VALIDATOR_NAME": "validator3",
            "GRPC_PORT": "30000",
            "LIBP2P_PORT": "30001",
            "JSONRPC_PORT": "30002",
            "STAGE": process.env.STAGE || "prod"
        }
    },
    {
        id: "Validator4",
        envVars: {
            "VALIDATOR_NAME": "validator4",
            "GRPC_PORT": "40000",
            "LIBP2P_PORT": "40001",
            "JSONRPC_PORT": "40002",
            "STAGE": process.env.STAGE || "prod"
        }
    }
]

//if passed, same VPC will be used, else new one will be created.
export const VPC_ID = ""

// if passed, same NLB will be used else, new NLB will be created.
export const ALB_EXISTS = false;

export const ALB_PORT = 443

export const TARGET_GROUP_PORT = 80

// JSONRPC_PORT of validator1
export const BLOCKCHAIN_VALIDATOR_PORT = 10002

export const HOSTED_ZONE_NAME = "springrole.com"
export const DOMAIN_NAME = `blockchain.${HOSTED_ZONE_NAME}`

// IF passed, existing hosted zone will be used, else new one will be created
// global resource, doesn't effect due to aws-region
export const HOSTED_ZONE_ID = "Z3TRGGK18WYNF8"; // springrole.com