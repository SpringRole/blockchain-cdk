import {Construct} from "constructs";
import {Repository} from "aws-cdk-lib/aws-ecr";
import {DockerImageAsset} from "aws-cdk-lib/aws-ecr-assets";
import * as path from "path";
import * as ecrdeploy from 'cdk-ecr-deployment';
import {RemovalPolicy} from "aws-cdk-lib"


export class ECRFactory extends Construct {

    repository: Repository;

    constructor(parent: Construct, id: string) {
        super(parent, id);

        this.repository = new Repository(this, 'ECRRepository', {
            imageScanOnPush: true,
            // Don't prefer physical name: https://github.com/aws/aws-cdk/issues/5140
            // repositoryName: props.repositoryName
        });

        // Build the docker image from the local assets
        this.buildDockerAndDeploy()
    }

    /**
     * Build the docker image from the local assets and deploy to ECR
     */
    buildDockerAndDeploy(){
        const image = new DockerImageAsset(this, 'CDKDockerImage', {
            directory: path.join(__dirname, '../src'),
        });

        new ecrdeploy.ECRDeployment(this, 'DeployDockerImage', {
            src: new ecrdeploy.DockerImageName(image.imageUri),
            dest: new ecrdeploy.DockerImageName(`${this.repository.repositoryUri}:latest`),
        });
    }
}
