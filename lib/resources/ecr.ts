import {Construct} from "constructs";
import {ECRFactoryProps} from "../interfaces/resource";
import {Repository} from "aws-cdk-lib/aws-ecr";


export class ECRFactory extends Construct {

    repository: Repository;

    constructor(parent: Construct, id: string, props: ECRFactoryProps) {
        super(parent, id);

        this.repository = new Repository(this, 'ECRRepository', {
            imageScanOnPush: true,
            repositoryName: props.repositoryName
        });

    }
}
