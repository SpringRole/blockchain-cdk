import {Construct} from "constructs";
import {Containers, ECSFactoryProps, ECSTaskAndServiceProps} from "../interfaces/resource";
import * as ecs from "aws-cdk-lib/aws-ecs";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {IVpc} from "aws-cdk-lib/aws-ec2";
import * as constants from "../constant/application_constants";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {Duration} from "aws-cdk-lib";
import {VPCFactory} from "./vpc";
import {IApplicationLoadBalancer, ListenerCondition} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";


export class ECSFactory extends Construct {

    loadBalancerTargets: [ecs.IEcsLoadBalancerTarget];

    constructor(parent: Construct, id: string, props: ECSFactoryProps) {
        super(parent, id);

        const cluster: ecs.ICluster = this.createCluster(props.clusterArn, props.VPC.vpc);

        const policy = new PolicyStatement(props.policyStatementProps);

        this.createTaskAndService(cluster, {...props, policy})

        this.addNLBAndTargetGroups(props.VPC)
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

    /**
     * Create NLB, Listeners and Target-Groups and attaches Target Groups to Listeners
     * @param VPC
     */
    addNLBAndTargetGroups(VPC: VPCFactory){

        let applicationLoadbalancer: IApplicationLoadBalancer, applicationListener;

        let hostedZone: route53.IHostedZone;

        if(constants.HOSTED_ZONE_ID){
            console.log("Received HOSTED_ZONE_ID", constants.HOSTED_ZONE_ID)
            console.log("Assuming, HostedZone is in same VPC passed")

            hostedZone = route53.HostedZone.fromHostedZoneId(this, 'HostedZone', constants.HOSTED_ZONE_ID)

        }else {
            hostedZone = new route53.HostedZone(this, 'HostedZone', {
                zoneName: constants.HOSTED_ZONE_NAME,
            });
        }


        if(constants.ALB_ARN){
            // Assumes, loadbalancer and its listeners are created and is also in the same VPC.
            // Ideally VPC would be created with custom existing VPCID which is attached to existing NLB
            console.log("Received ALB_ARN", constants.ALB_ARN)
            console.log("Assumptions:\n " +
                "1. loadbalancer and its listeners are created\n " +
                "2. LB is in same VPC passed.\n " +
                "3. There is already a ACM Certificate created and attached to listener")
            // add target groups and attach to network load balancer

            applicationLoadbalancer = elbv2.ApplicationLoadBalancer.fromLookup(this, 'ALB', { loadBalancerArn: constants.ALB_ARN})
            applicationListener = elbv2.ApplicationListener.fromLookup(this, 'listener', {
                loadBalancerArn: constants.ALB_ARN,
                listenerProtocol: elbv2.ApplicationProtocol.HTTPS,
                listenerPort: constants.ALB_PORT
            })


            // Note: In case of NLB (Network Load balancer):
            // Currently, CAN'T add Target Group when listener is imported via .fromLookup(), complains no function .addTargets()
            // Creating listener via .addListener will also complain if listener with specified port is already present.

        }else {

            const certificate = new acm.Certificate(this, 'Certificate', {
                domainName: constants.DOMAIN_NAME,

                // Uncomment if validation is needed, this will send email.
                // https://docs.aws.amazon.com/acm/latest/userguide/email-validation.html
                // Observation: even though validation is commented, stack was stuck in pending-verification.
                // By default, it could be using EMAIL validation

                // validation: acm.CertificateValidation.fromDns(hostedZone),
            });

            applicationLoadbalancer  = new elbv2.ApplicationLoadBalancer(this, 'ALB',
                {
                    vpc: VPC.vpc ,
                    loadBalancerName: "Blockchain-loadbalancer",
                    internetFacing: true
                })

            applicationListener = applicationLoadbalancer.addListener('listener', { port: constants.ALB_PORT });
            applicationListener.addCertificates("ALBCertificates", [certificate])
        }

        new route53.ARecord(this, 'AliasRecord', {
            zone: hostedZone,
            target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(applicationLoadbalancer)),
        });

        // Target Group
        const applicationTargetGroup = applicationListener.addTargets('target', {
            port: constants.TARGET_GROUP_PORT,
            targetGroupName:"Blockchain-tg",
            // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-elasticloadbalancingv2-targetgroup.html#aws-resource-elasticloadbalancingv2-targetgroup-properties
            targets: this.loadBalancerTargets,
            healthCheck: {
                enabled: true,
                path: "/ping", // JSONRPC port responds with 200 OK, doesn't matter what path it is.
                port: "traffic-port",
                interval: Duration.seconds(30),
                protocol: elbv2.Protocol.HTTP
            }
        });

        // Host condition
        // If host matches, ALB forwards the request to target group as per rule
        const  listenerCondition = ListenerCondition.hostHeaders([constants.DOMAIN_NAME])

        // Forwarding Rule
        const applicationListenerRule = new elbv2.ApplicationListenerRule(this, 'MyApplicationListenerRule', {
            listener: applicationListener,
            priority: 1,
            // the properties below are optional
            conditions: [listenerCondition],
            targetGroups: [applicationTargetGroup],
        });
    }
}
