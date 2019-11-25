#!/bin/bash

ls -la ../
ls -la ./
ls -la .travis/

eval "$(ssh-agent -s)"
chmod 600 ./.travis/id_rsa
ssh-add ./.travis/id_rsa

ssh -o StrictHostKeyChecking=no root@51.15.250.22 ./deploy_develop.sh