#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SpringroleBlockchainCdkStack } from '../lib/springrole-blockchain-cdk-stack';

const app = new cdk.App();
new SpringroleBlockchainCdkStack(app, 'SpringroleBlockchainCdkStack');
