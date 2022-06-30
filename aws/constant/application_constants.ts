import {Pipeline, Validator} from "../interfaces/application_config";
import config = require("config");

export const validatorTaskMemoryLimitMiB = 512;
export const validatorTaskCpu = 256;
export const validatorServiceTaskCount = 1;

export const pipeline: Pipeline = {
    accountId: config.get("ACCOUNT_ID"),
    region: config.get("REGION")
}

export const ssmResource = `arn:aws:ssm:${pipeline.region}:${pipeline.accountId}:parameter/blockchain/validator*`

export const blockchainVolumeName = "blockchain-volume";

export const VALIDATOR1 = "Validator1";

export const validators: Validator[] = [
    {
        id: VALIDATOR1,
        envVars: {
            "VALIDATOR_NAME": "validator1", // if changed, src/validator/main.go should be changed
            "GRPC_PORT": "10000", // NOTE: env variables has to be string
            "LIBP2P_PORT": "10001", // Note remember to change the bootnode port
            "JSONRPC_PORT": "10002",
            "STAGE": config.get("STAGE"),

            // ENV vars for genesis-creator.go
            // NOTE: genesis-creator.go script will run only for validator1
            "AWS_REGION": pipeline.region,
            "GENESIS_ACCOUNT": config.get("GENESIS_ACCOUNT"),
            "PREMINE_NUM_TOKENS_IN_WEI": config.get("PREMINE_NUM_TOKENS_IN_WEI"),
            "BLOCKCHAIN_NAME": config.get("BLOCKCHAIN_NAME"),
            // localhost since all validators are in same task-def with aws-vpc network mode
            "BOOTNODE_1_IP": "127.0.0.1",
            "BOOTNODE_1_PORT": "10001", // libp2p port
            "BOOTNODE_2_IP": "127.0.0.1",
            "BOOTNODE_2_PORT": "20001"
        }
    },
    {
        id: "Validator2",
        envVars: {
            "VALIDATOR_NAME": "validator2",
            "GRPC_PORT": "20000",
            "LIBP2P_PORT": "20001",  // Note remember to change the bootnode port
            "JSONRPC_PORT": "20002",
            "STAGE":  config.get("STAGE"),
        }
    },
    {
        id: "Validator3",
        envVars: {
            "VALIDATOR_NAME": "validator3",
            "GRPC_PORT": "30000",
            "LIBP2P_PORT": "30001",
            "JSONRPC_PORT": "30002",
            "STAGE": config.get("STAGE"),
        }
    },
    {
        id: "Validator4",
        envVars: {
            "VALIDATOR_NAME": "validator4",
            "GRPC_PORT": "40000",
            "LIBP2P_PORT": "40001",
            "JSONRPC_PORT": "40002",
            "STAGE": config.get("STAGE"),
        }
    }
]

//if passed, same VPC will be used, else new one will be created.
export const VPC_ID: string =
    config.has("OPTIONAL_EXISTING_VPC_ID") ?
    config.get("OPTIONAL_EXISTING_VPC_ID"): "";

// if passed, same NLB will be used else, new NLB will be created.
export const ALB_EXISTS: boolean = config.get('ALB_EXISTS');

export const ALB_PORT = 443

export const TARGET_GROUP_PORT = 80

// JSON RPC PORT of validator1
// currently only validator1 is exposed to public
export const BLOCKCHAIN_VALIDATOR_PORT = 10002

export const HOSTED_ZONE_NAME: string = config.get("HOSTED_ZONE_NAME")
export const DOMAIN_NAME: string  = config.get("SUBDOMAIN") + "." + HOSTED_ZONE_NAME

// IF passed, existing hosted zone will be used, else new one will be created
// global resource, doesn't affect due to aws-region
export const HOSTED_ZONE_ID: string =
    config.has("OPTIONAL_EXISTING_HOSTED_ZONE_ID") ?
    config.get("OPTIONAL_EXISTING_HOSTED_ZONE_ID"): "";