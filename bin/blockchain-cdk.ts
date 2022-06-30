#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BlockchainCdkStack } from '../aws/blockchain-cdk-stack';
import {pipeline} from "../aws/constant/application_constants";

const app = new cdk.App();
new BlockchainCdkStack(app, 'BlockchainCdkStack',
    {
        env:  { account: pipeline.accountId, region: pipeline.region, }
    });
