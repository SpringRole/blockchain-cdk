import {Construct} from "constructs";
import {Containers, ECSFactoryProps, ECSTaskAndServiceProps} from "../interfaces/resource";
import * as ecs from "aws-cdk-lib/aws-ecs";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {IVpc} from "aws-cdk-lib/aws-ec2";
import * as constants from "../constant/application_constants";


export class ECSFactory extends Construct {

    loadBalancerTargets: ecs.IEcsLoadBalancerTarget[];

    constructor(parent: Construct, id: string, props: ECSFactoryProps) {
        super(parent, id);

        const cluster: ecs.ICluster = this.createCluster(props.clusterArn, props.VPC.vpc);

        const policy = new PolicyStatement(props.policyStatementProps);

        this.createTaskAndService(cluster, {...props, policy})

    }


    /**
     * Create Cluster if ARN is not passed else reference the cluster from arn.
     */
    createCluster(clusterArn?: string, vpc?: IVpc){
        const ecsClusterComponentName = `ECSCluster`;
        let cluster: ecs.ICluster;
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
    createTaskAndService(cluster: ecs.ICluster, props: ECSTaskAndServiceProps){

        const containers: Containers = {};

        const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, `FargateTaskDef`, {
            cpu: 1024,
            memoryLimitMiB: 2048
        });

        fargateTaskDefinition.addVolume(props.volume)
        fargateTaskDefinition.addToTaskRolePolicy(props.policy)

        const serviceName = `Blockchain`;

        // Add container for each validator in the same task definition
        constants.validators.forEach((validator) => {

            const portMappings = [
                // expose only libp2p port to connect with other validators
                {
                    hostPort: Number(validator.envVars['LIBP2P_PORT']),
                    containerPort: Number(validator.envVars['LIBP2P_PORT']),
                    protocol: ecs.Protocol.TCP
                }
            ]

            if(validator.id == "Validator1"){
                portMappings.push({
                        hostPort: Number(validator.envVars['JSONRPC_PORT']), // Host port must be left out or equal to container port 10002 for network mode awsvpc
                        containerPort: Number(validator.envVars['JSONRPC_PORT']),
                        protocol: ecs.Protocol.TCP
                    })
            }

            const container = fargateTaskDefinition.addContainer(`FargateContainer${validator.id}`, {
                image: ecs.ContainerImage.fromEcrRepository(props.repository),
                environment: validator.envVars,
                logging: ecs.LogDrivers.awsLogs({ streamPrefix: serviceName + validator.id }),
                portMappings,
                containerName: validator.id
            });

            // IMP: Just attaching volume to task def is not enough, need to mount it.
            container.addMountPoints({
                sourceVolume: props.volume.name,
                containerPath: '/blockchain-state',
                readOnly: false
            })

            // storing container definition
            containers[validator.id] = container;
        })


        const service = new ecs.FargateService(this, `FargateService`, {
            serviceName,
            cluster,
            taskDefinition: fargateTaskDefinition,
            desiredCount: props.desiredTasksCount,
            securityGroups: [props.VPC.securityGroup]
        });

        // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs-readme.html
        // TODO: Can we add other validators ?
        this.loadBalancerTargets = [
            service.loadBalancerTarget({
                containerName: containers[constants.VALIDATOR1].containerName,
                containerPort: constants.BLOCKCHAIN_VALIDATOR_PORT
            })
        ]

    }
}
