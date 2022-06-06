import {Validator} from "../interfaces/application_config";
import {Aws} from "aws-cdk-lib";

export const validatorTaskMemoryLimitMiB = 512;
export const validatorTaskCpu = 256;
export const validatorServiceTaskCount = 1;

export const pipeline = {
    accountId: Aws.ACCOUNT_ID, // Account id will be picked dynamically on AWS
    region: "us-east-1"
}

export const ssmResource = `arn:aws:ssm:${pipeline.region}:${pipeline.accountId}:parameter/blockchain/validator*`

export const blockchainVolumeName = "blockchain-volume";

export const validators: Validator[] = [
    {
        id: "Validator1",
        envVars: {
            "VALIDATOR_NAME": "validator1",
            "GRPC_PORT": "10000", // NOTE: env variables has to be string
            "LIBP2P_PORT": "10001", // Note remember to change the bootnode port
            "JSONRPC_PORT": "10002"
        }
    },
    {
        id: "Validator2",
        envVars: {
            "VALIDATOR_NAME": "validator2",
            "GRPC_PORT": "20000",
            "LIBP2P_PORT": "20001",  // Note remember to change the bootnode port
            "JSONRPC_PORT": "20002"
        }
    },
    {
        id: "Validator3",
        envVars: {
            "VALIDATOR_NAME": "validator3",
            "GRPC_PORT": "30000",
            "LIBP2P_PORT": "30001",
            "JSONRPC_PORT": "30002"
        }
    },
    {
        id: "Validator4",
        envVars: {
            "VALIDATOR_NAME": "validator4",
            "GRPC_PORT": "40000",
            "LIBP2P_PORT": "40001",
            "JSONRPC_PORT": "40002"
        }
    }
]