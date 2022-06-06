import {Construct} from "constructs";
import {EFSFactoryProps} from "../interfaces/resource";
import * as efs from "aws-cdk-lib/aws-efs";


export class EFSFactory extends Construct {

    fileSystem: efs.FileSystem;

    constructor(parent: Construct, id: string, props: EFSFactoryProps) {
        super(parent, id);

        this.fileSystem = new efs.FileSystem(this, 'EfsFileSystem', {
            vpc: props.VPC.vpc, // required
            securityGroup: props.VPC.securityGroup,
            // files are not transitioned to infrequent access (IA) storage by default
            lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
            //NOTE: changing performanceMode will replace EFS
            performanceMode: efs.PerformanceMode.GENERAL_PURPOSE, // default
            // files are not transitioned back from (infrequent access) IA to primary storage by default
            outOfInfrequentAccessPolicy: efs.OutOfInfrequentAccessPolicy.AFTER_1_ACCESS,
        });

    }
}
