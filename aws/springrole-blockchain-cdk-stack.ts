import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {ECSFactory} from "./resources/ecs";
import {ECSFactoryProps} from "./interfaces/resource";
import {ECRFactory} from "./resources/ecr";
import {Effect} from "aws-cdk-lib/aws-iam";
import * as constants from "./constant/application_constants";
import {EFSFactory} from "./resources/efs";
import {VPCFactory} from "./resources/vpc";
import * as route53 from "aws-cdk-lib/aws-route53";
import {ListenerCondition} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import {IEcsLoadBalancerTarget} from "aws-cdk-lib/aws-ecs";


export class SpringRoleBlockchainCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const ecr = new ECRFactory(this, "Blockchain-ECR");

    const VPC = new VPCFactory(this, "Blockchain-VPC", {vpcId: constants.VPC_ID});

    const efs = new EFSFactory(this, "Blockchain-EFS",{ VPC });

    const hostedZone = this.createHostedZone();

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

    const ECSStack = new ECSFactory(this, "Blockchain-ECS", ecsFactoryProps);

    this.addLBAndTargetGroups(VPC, hostedZone, ECSStack.loadBalancerTargets)

  }

  /**
   * Create HostedZone if not present.
   */
  createHostedZone(){
    let hostedZone: route53.IHostedZone;

    if(constants.HOSTED_ZONE_ID){
      console.log("Received HOSTED_ZONE_ID", constants.HOSTED_ZONE_ID)
      console.log("Assuming, HostedZone is in same VPC passed")

      hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: constants.HOSTED_ZONE_ID,
        zoneName: constants.HOSTED_ZONE_NAME,
      })

    }else {
      hostedZone = new route53.HostedZone(this, 'HostedZone', {
        zoneName: constants.HOSTED_ZONE_NAME,
      });
    }

    return hostedZone;
  }

  /**
   * Create LB, Listeners and Target-Groups and attaches Target Groups to Listeners
   * @param VPC
   * @param hostedZone
   * @param loadBalancerTargets
   */
  addLBAndTargetGroups(VPC: VPCFactory,
                       hostedZone:  route53.IHostedZone,
                       loadBalancerTargets: IEcsLoadBalancerTarget[]){

    console.log("Received ALB_EXISTS", constants.ALB_EXISTS);

    if(constants.ALB_EXISTS){
      // Assumes, loadbalancer and its listeners are created and is also in the same VPC.
      // Ideally VPC would be created with custom existing VPCID which is attached to existing NLB

      console.log("Assumptions:\n " +
          "1. Loadbalancer and its listeners are created\n " +
          "2. Loadbalancer is in same VPC passed.\n " +
          "3. In case of ALB, there is already a ACM Certificate created and attached to listener\n" +
          "4. Skipping creating route53.ARecord for mapping , Please create manually if not exists \n" +
          "5. Target Groups will be manually created and Listener Rule will be mapped to TargetGroup")


      // NOTE: importing and using existing ALB and its listener has Problems
      // Observation:
      // There was the one LB which already existed. This had 2 SGs attached (manually)
      // Now, when this LB was imported and then when we add target groups, it updates the security group rules. (with container ports etc)
      // Now, internally, For Updating SG Egress/Igress Rules, it revokes the access and then Authorizes.
      // And it was observed that it revoked the existing rules of SGs and caused outage of 9hrs
      // Rather it would be good, if this flow only changes the SGs added via CDK.
      // To be on Safer side, In case of existing LBs, assume that they would be adding everything related to connectivity manually

    } else {
      console.log("Stack Creation will wait until ACM Certificate is validated.\n " +
          "Checkout https://docs.aws.amazon.com/acm/latest/userguide/email-validation.html")

      // ACM certificate is needed for ALB https port
      const certificate = new acm.Certificate(this, 'Certificate', {
        domainName: constants.DOMAIN_NAME,
        // https://docs.aws.amazon.com/acm/latest/userguide/email-validation.html
        // Observation: even though validation is commented, stack was stuck in pending-verification.
        // By default, it could be using EMAIL validation
        // NOTE
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });

      const applicationLoadbalancer  = new elbv2.ApplicationLoadBalancer(this, 'ALB',
          {
            vpc: VPC.vpc ,
            loadBalancerName: "Blockchain-loadbalancer",
            internetFacing: true
          })

      const applicationListener = applicationLoadbalancer.addListener('listener', { port: constants.ALB_PORT });
      applicationListener.addCertificates("ALBCertificates", [certificate])

      // Target Group, can't use .addTargets() for existing ALBs
      // Target group
      const applicationTargetGroup = new elbv2.ApplicationTargetGroup(this, 'target-group', {
        vpc: VPC.vpc, //  'vpc' is required for a non-Lambda TargetGroup
        port: constants.TARGET_GROUP_PORT,
        targetGroupName:"Blockchain-tg",
        targets: loadBalancerTargets,
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
      new elbv2.ApplicationListenerRule(this, 'ApplicationListenerRule', {
        listener: applicationListener,
        priority: 123,// has to be unique and not used in existing rules
        // the properties below are optional
        conditions: [listenerCondition],
        targetGroups: [applicationTargetGroup],
      });

      // Map domain to ALB. create Type A Record
      // Creating A type record mapping domain to ALB
      new route53.ARecord(this, 'AliasRecord', {
        recordName: constants.DOMAIN_NAME,
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(applicationLoadbalancer)),
      });
    }

  }
}
