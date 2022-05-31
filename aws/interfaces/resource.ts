import {Repository} from "aws-cdk-lib/aws-ecr";
import {PolicyStatement, PolicyStatementProps} from "aws-cdk-lib/aws-iam";
import {Volume} from "aws-cdk-lib/aws-ecs";
import {HashMap} from "./application_config";
import {IVpc} from "aws-cdk-lib/aws-ec2";

export interface EFSFactoryProps {
    readonly vpc: IVpc
}

export interface ECSFactoryProps {
    readonly clusterArn?: string;
    readonly memoryLimitMiB: number;
    readonly cpu: number;
    readonly repository: Repository;
    readonly desiredTasksCount: number;
    readonly policyStatementProps?: PolicyStatementProps;
    readonly volume?: Volume;
    readonly vpc: IVpc;
}

export interface ECSTaskAndServiceProps extends ECSFactoryProps {
    readonly envVars: HashMap,
    readonly policy: PolicyStatement
}