#! /bin/bash

# create secret manager config files
polygon-edge secrets generate --type aws-ssm --dir ./config-validator1.json --name validator1 --extra region=us-east-1,ssm-parameter-path=/blockchain/validator
polygon-edge secrets generate --type aws-ssm --dir ./config-validator2.json --name validator2 --extra region=us-east-1,ssm-parameter-path=/blockchain/validator
polygon-edge secrets generate --type aws-ssm --dir ./config-validator3.json --name validator3 --extra region=us-east-1,ssm-parameter-path=/blockchain/validator
polygon-edge secrets generate --type aws-ssm --dir ./config-validator4.json --name validator4 --extra region=us-east-1,ssm-parameter-path=/blockchain/validator

# Initialize secrets in SSM parameter store + KMS
polygon-edge secrets init --config config-validator1.json > validator1Output.txt
polygon-edge secrets init --config config-validator2.json > validator2Output.txt
polygon-edge secrets init --config config-validator3.json > validator3Output.txt
polygon-edge secrets init --config config-validator4.json > validator4Output.txt