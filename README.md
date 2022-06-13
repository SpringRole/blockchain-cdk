# Welcome to your CDK TypeScript project

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`SpringroleBlockchainCdkStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


### How to run
1. Configure aws profile by getting aws credentials from devops. [IAM user should have all permissions required for cdk bootstrap, better to get Admin access]
`aws configure --profile [profile_name]`
2. Deploy the cdk bootstrap 
`cdk bootstrap --profile [profile_name]`
3. Deploy the stack
`export ACCOUNT_ID=726511334126 && cdk deploy --profile [profile_name]`