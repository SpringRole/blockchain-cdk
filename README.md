# BlockChain CDK

Creates Infra:
- VPC if not present (pass existing VPC to use the same)
- ECR repo, (Also builds and pushes Docker Image to ECR repo during `cdk deploy`)
- EFS for storing blockchain state.
- ECS Service and Task Definition with 4 ECS containers for validators
- IF ALB (Application Load Balancer) doesn't exist, it creates ALB, Target groups, Listener Rules and ACM certificate
- Creates HostedZone if it doesn't exist. Configure if already exists

This package also has code to create Blockchain (Checkout `src/validator`)
- Creates Genesis file if not present and store the secrets in SSM parameter store for first time.
- Persists the blockchain state in EFS and validator node(server) starts. (Can be restarted)

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
3. Get Below Policy Statement added to your IAM Role. 
   Then further `cdk deploy` Admin access can be remove and just use the role with below policy
```json
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["sts:AssumeRole"],"Resource":["arn:aws:iam::*:role/cdk-*"]}]}
```
4. Deploy the stack
`export ACCOUNT_ID=726511334126 && cdk deploy --profile [profile_name]`