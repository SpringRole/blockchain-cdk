import {Repository} from "aws-cdk-lib/aws-ecr";
import {PolicyStatementProps} from "aws-cdk-lib/aws-iam";
import {Volume} from "aws-cdk-lib/aws-ecs";
import {HashMap} from "./application_config";

export interface ECSFactoryProps {
    readonly clusterArn?: string;
    readonly memoryLimitMiB: number;
    readonly cpu: number;
    readonly repository: Repository;
    readonly desiredTasksCount: number;
    readonly policyStatementProps?: PolicyStatementProps;
    readonly volume?: Volume
}

export interface ECSTaskAndServiceProps extends ECSFactoryProps {
    readonly envVars: HashMap
}
export interface ECRFactoryProps {
    readonly repositoryName: string
}