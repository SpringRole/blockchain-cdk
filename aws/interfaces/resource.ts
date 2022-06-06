import {Repository} from "aws-cdk-lib/aws-ecr";
import {PolicyStatement, PolicyStatementProps} from "aws-cdk-lib/aws-iam";
import {Volume} from "aws-cdk-lib/aws-ecs";
import {VPCFactory} from "../resources/vpc";

export interface EFSFactoryProps {
    readonly VPC: VPCFactory
}

export interface ECSFactoryProps {
    readonly clusterArn?: string;
    readonly memoryLimitMiB: number;
    readonly cpu: number;
    readonly repository: Repository;
    readonly desiredTasksCount: number;
    readonly policyStatementProps: PolicyStatementProps;
    readonly volume: Volume;
    readonly VPC: VPCFactory
}

export interface ECSTaskAndServiceProps extends ECSFactoryProps {
    readonly policy: PolicyStatement
}