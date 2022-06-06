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

export const blockchainVolumeName = "springrole-blockchain-volume";

export const validators: Validator[] = [
    {
        id: "Validator1",
        envVars: {
            "NAME": "validator1"
            //PORTS ?
        }
    },
    {
        id: "Validator2",
        envVars: {
            "NAME": "validator2"
            //PORTS ?
        }
    }
    // TODO Add 3 and 4
]