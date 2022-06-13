#! /bin/bash

# create secret manager config files
polygon-edge secrets init --data-dir /blockchain-state/app/test-data-validator1 > /blockchain-state/app/validator1Output.txt
polygon-edge secrets init --data-dir /blockchain-state/app/test-data-validator2 > /blockchain-state/app/validator2Output.txt
polygon-edge secrets init --data-dir /blockchain-state/app/test-data-validator3 > /blockchain-state/app/validator3Output.txt
polygon-edge secrets init --data-dir /blockchain-state/app/test-data-validator4 > /blockchain-state/app/validator4Output.txt