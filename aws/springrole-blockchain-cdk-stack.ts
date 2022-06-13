import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {ECSFactory} from "./resources/ecs";
import {ECSFactoryProps} from "./interfaces/resource";
import {ECRFactory} from "./resources/ecr";
import {Effect} from "aws-cdk-lib/aws-iam";
import * as constants from "./constant/application_constants";
import {EFSFactory} from "./resources/efs";
import {VPCFactory} from "./resources/vpc";


export class SpringRoleBlockchainCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const ecr = new ECRFactory(this, "Blockchain-ECR");

    const VPC = new VPCFactory(this, "Blockchain-VPC", {vpcId: constants.VPC_ID});

    const efs = new EFSFactory(this, "Blockchain-EFS",{ VPC });

    const ecsFactoryProps: ECSFactoryProps = {
      cpu: constants.validatorTaskCpu,
      desiredTasksCount: constants.validatorServiceTaskCount,
      memoryLimitMiB: constants.validatorTaskMemoryLimitMiB,
      repository: ecr.repository,
      volume: {
         // Use an Elastic FileSystem
         name: constants.blockchainVolumeName,
         efsVolumeConfiguration: {
             fileSystemId: efs.fileSystem.fileSystemId,
         },
      },
      policyStatementProps: {
        effect : Effect.ALLOW,
        actions : [
          "ssm:PutParameter",
          "ssm:DeleteParameter",
          "ssm:GetParameter"
        ],
        resources : [
          constants.ssmResource
        ]
      },
      VPC
    }

    new ECSFactory(this, "Blockchain-ECS", ecsFactoryProps);
  }
}
