#!/bin/bash

eval "$(ssh-agent -s)"
chmod 600 id_rsa
ssh-add id_rsa

ssh -o StrictHostKeyChecking=no root@51.15.250.22 ./deploy_develop.sh