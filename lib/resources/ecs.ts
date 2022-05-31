import {Construct} from "constructs";
import {ECSFactoryProps, ECSTaskAndServiceProps} from "../interfaces/resource";
import * as ecs from "aws-cdk-lib/aws-ecs";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {ICluster} from "aws-cdk-lib/aws-ecs";
import {validators} from "../constant/application_constants";


export class ECSFactory extends Construct {
    constructor(parent: Construct, id: string, props: ECSFactoryProps) {
        super(parent, id);

        const cluster: ICluster = this.createCluster(props.clusterArn);

        const policy = new PolicyStatement(props.policyStatementProps);

        // create 4 services and task-definitions for each validator
        validators.forEach((validator) => {
            const ecsTaskAndServiceProps: ECSTaskAndServiceProps = {
                ...props,
                policy,
                envVars: validator.envVars,
            }
            this.createTaskAndService(cluster, validator.id, ecsTaskAndServiceProps)
        })
    }


    /**
     * Create Cluster if ARN is not passed else reference the cluster from arn.
     */
    createCluster(id: string, clusterArn?: string, ){
        const ecsClusterComponentName = `ECSCluster-${id}`;
        let cluster: ICluster;
        // create new cluster if not arn is not passed.
        if(!clusterArn){
            // NOTE: If vpc is not passed, it will create
            cluster = new ecs.Cluster(this, ecsClusterComponentName);
        }else{
            // TODO: can the services/tasks inside a cluster have different VPCs ?
            // try ecs.Cluster.fromClusterAttributes
            cluster = ecs.Cluster.fromClusterArn(this, ecsClusterComponentName, clusterArn);
        }
        return cluster;
    }


    /**
     * Creates Fargate Task definition and Service
     */
    createTaskAndService(cluster: ICluster, id: string, props: ECSTaskAndServiceProps){
        const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, `FargateTaskDef-${id}`, {
            memoryLimitMiB: props.memoryLimitMiB,
            cpu: props.cpu,
        });

        fargateTaskDefinition.addContainer(`FargateContainer-${id}`, {
            image: ecs.ContainerImage.fromEcrRepository(props.repository),
            environment: props.envVars
        });

        if(props.volume){
            fargateTaskDefinition.addVolume(props.volume)
        }

        if(props.policyStatementProps){
            // TODO: is the task role created if not added ?
            fargateTaskDefinition.addToTaskRolePolicy(props.policy)
        }

        const service = new ecs.FargateService(this, `ECSService-${id}`, {
            serviceName: `SpringRole-Blockchain-${id}`,
            cluster,
            taskDefinition: fargateTaskDefinition,
            desiredCount: props.desiredTasksCount,
        });
    }
}
