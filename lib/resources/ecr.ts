import {Construct} from "constructs";
import {Repository} from "aws-cdk-lib/aws-ecr";


export class ECRFactory extends Construct {

    repository: Repository;

    constructor(parent: Construct, id: string) {
        super(parent, id);

        this.repository = new Repository(this, 'ECRRepository', {
            imageScanOnPush: true,
            // Don't prefer physical name: https://github.com/aws/aws-cdk/issues/5140
            // repositoryName: props.repositoryName
        });

    }
}
