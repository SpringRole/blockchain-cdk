import {Construct} from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {ISecurityGroup, Peer, Port, SecurityGroup, SubnetType} from "aws-cdk-lib/aws-ec2";


export class VPCFactory extends Construct {

    vpc: ec2.IVpc;
    securityGroup: ISecurityGroup;

    constructor(parent: Construct, id: string) {
        super(parent, id);

        this.vpc = new ec2.Vpc(parent, `VPC-${id}`, {
            cidr: "10.0.0.0/16",
            enableDnsHostnames: true,
            enableDnsSupport: true,
            natGateways: 1,
            natGatewaySubnets: {
                subnetType: SubnetType.PUBLIC
            },
        })

        this.securityGroup = new SecurityGroup(parent, `SecurityGroup-${id}`, { vpc: this.vpc });

        //Adding Inbound Rule for NFS (EFS)
        this.securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(2049));
    }
}
