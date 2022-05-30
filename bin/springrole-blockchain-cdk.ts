#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SpringRoleBlockchainCdkStack } from '../lib/springrole-blockchain-cdk-stack';

const app = new cdk.App();
new SpringRoleBlockchainCdkStack(app, 'SpringRoleBlockchainCdkStack');
