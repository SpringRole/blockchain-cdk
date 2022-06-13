import {Construct} from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {ISecurityGroup, Peer, Port, SecurityGroup, SubnetType} from "aws-cdk-lib/aws-ec2";
import {VPCProps} from "../interfaces/resource";
import * as constants from "../constant/application_constants";


export class VPCFactory extends Construct {

    vpc: ec2.IVpc;
    securityGroup: ISecurityGroup;

    constructor(parent: Construct, id: string, props: VPCProps) {
        super(parent, id);

        if(props.vpcId){
            this.vpc = ec2.Vpc.fromLookup(parent, `VPC-${id}`, {vpcId: props.vpcId})
        } else {
            this.vpc = new ec2.Vpc(parent, `VPC-${id}`, {
                cidr: "10.0.0.0/16",
                enableDnsHostnames: true,
                enableDnsSupport: true,
                natGateways: 1,
                natGatewaySubnets: {
                    subnetType: SubnetType.PUBLIC
                },
            })
        }

        this.securityGroup = new SecurityGroup(parent, `SecurityGroup-${id}`, { vpc: this.vpc });

        //Adding Inbound Rule for NFS (EFS)
        this.securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(2049));
        this.securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(constants.BLOCKCHAIN_VALIDATOR_PORT));
        this.securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(constants.ALB_PORT))
    }
}
