import {Construct} from "constructs";
import {ECSFactoryProps, ECSTaskAndServiceProps} from "../interfaces/resource";
import * as ecs from "aws-cdk-lib/aws-ecs";
import {ICluster, Protocol} from "aws-cdk-lib/aws-ecs";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {validators} from "../constant/application_constants";
import {IVpc} from "aws-cdk-lib/aws-ec2";


export class ECSFactory extends Construct {
    constructor(parent: Construct, id: string, props: ECSFactoryProps) {
        super(parent, id);

        const cluster: ICluster = this.createCluster(props.clusterArn, props.VPC.vpc);

        const policy = new PolicyStatement(props.policyStatementProps);

        this.createTaskAndService(cluster, {...props, policy})
    }


    /**
     * Create Cluster if ARN is not passed else reference the cluster from arn.
     */
    createCluster(clusterArn?: string, vpc?: IVpc){
        const ecsClusterComponentName = `ECSCluster`;
        let cluster: ICluster;
        // create new cluster if not arn is not passed.
        if(!clusterArn){
            if(!vpc){
                throw Error('VPC not passed for a new cluster to be created');
            }
            cluster = new ecs.Cluster(this, ecsClusterComponentName, { vpc });
        }else{
            // try ecs.Cluster.fromClusterAttributes
            cluster = ecs.Cluster.fromClusterArn(this, ecsClusterComponentName, clusterArn);
        }
        return cluster;
    }


    /**
     * Creates Fargate Task definition and Service
     */
    createTaskAndService(cluster: ICluster, props: ECSTaskAndServiceProps){
        const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, `FargateTaskDef`, {
            cpu: 1024,
            memoryLimitMiB: 2048
        });

        const serviceName = `Blockchain`;

        // Add container for each validator in the same task definition
        validators.forEach((validator) => {

            const portMappings = [
                // expose only libp2p port to connect with other validators
                {
                    hostPort: Number(validator.envVars['LIBP2P_PORT']),
                    containerPort: Number(validator.envVars['LIBP2P_PORT']),
                    protocol: Protocol.TCP
                }
            ]

            if(validator.id == "Validator1"){
                portMappings.push({
                        hostPort: Number(validator.envVars['JSONRPC_PORT']), // Host port must be left out or equal to container port 10002 for network mode awsvpc
                        containerPort: Number(validator.envVars['JSONRPC_PORT']),
                        protocol: Protocol.TCP
                    })
            }

            fargateTaskDefinition.addContainer(`FargateContainer${validator.id}`, {
                image: ecs.ContainerImage.fromEcrRepository(props.repository),
                environment: validator.envVars,
                logging: ecs.LogDrivers.awsLogs({ streamPrefix: serviceName + validator.id }),
                portMappings
            });
        })

        fargateTaskDefinition.addVolume(props.volume)
        fargateTaskDefinition.addToTaskRolePolicy(props.policy)

        new ecs.FargateService(this, `FargateService`, {
            serviceName,
            cluster,
            taskDefinition: fargateTaskDefinition,
            desiredCount: props.desiredTasksCount,
            securityGroups: [props.VPC.securityGroup]
        });
    }
}
