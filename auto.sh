#!/bin/bash

cd /home/didier/Workspace/
rm -f docker-webproxy.tar.gz
tar czf docker-webproxy.tar.gz docker-webproxy
ssh root@didier-dev.space rm -fr docker-webproxy*
scp docker-webproxy.tar.gz root@didier-dev.space:~
ssh root@didier-dev.space tar zxf docker-webproxy.tar.gz
ssh root@didier-dev.space docker stack rm docker-webproxy
ssh root@didier-dev.space "cd docker-webproxy && export DOCKER_REGISTRY=172.31.107.112:5000 && npm run packaging:prepare"
ssh root@didier-dev.space "cd docker-webproxy && export DOCKER_REGISTRY=172.31.107.112:5000 && npm run packaging:image-build swarm"
ssh root@didier-dev.space "cd docker-webproxy && export DOCKER_REGISTRY=172.31.107.112:5000 && npm run packaging:image-push swarm"
ssh root@didier-dev.space "cd docker-webproxy && export DOCKER_REGISTRY=172.31.107.112:5000 && npm run packaging:service-deploy swarm"
