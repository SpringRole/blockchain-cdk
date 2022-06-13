#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SpringRoleBlockchainCdkStack } from '../aws/springrole-blockchain-cdk-stack';
import {pipeline} from "../aws/constant/application_constants";

const app = new cdk.App();
new SpringRoleBlockchainCdkStack(app, 'BlockchainCdkStack',
    {

        env:  { account: pipeline.accountId, region: pipeline.region, }
    });
