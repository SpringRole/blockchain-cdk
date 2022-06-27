#! /bin/bash

# create secret manager config files
polygon-edge secrets generate --type aws-ssm --dir /blockchain-state/app/config-validator1.json --name validator1 --extra region=us-west-1,ssm-parameter-path=/blockchain/validator
polygon-edge secrets generate --type aws-ssm --dir /blockchain-state/app/config-validator2.json --name validator2 --extra region=us-west-1,ssm-parameter-path=/blockchain/validator
polygon-edge secrets generate --type aws-ssm --dir /blockchain-state/app/config-validator3.json --name validator3 --extra region=us-west-1,ssm-parameter-path=/blockchain/validator
polygon-edge secrets generate --type aws-ssm --dir /blockchain-state/app/config-validator4.json --name validator4 --extra region=us-west-1,ssm-parameter-path=/blockchain/validator

# Initialize secrets in SSM parameter store + KMS
polygon-edge secrets init --config /blockchain-state/app/config-validator1.json > /blockchain-state/app/validator1Output.txt
polygon-edge secrets init --config /blockchain-state/app/config-validator2.json > /blockchain-state/app/validator2Output.txt
polygon-edge secrets init --config /blockchain-state/app/config-validator3.json > /blockchain-state/app/validator3Output.txt
polygon-edge secrets init --config /blockchain-state/app/config-validator4.json > /blockchain-state/app/validator4Output.txt