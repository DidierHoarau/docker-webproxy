#!/bin/bash


DOCKER_NETWORK=`docker network ls | grep ' proxy-network '`
if [ -z "$DOCKER_NETWORK" ]; then
  echo "Creating the network"
  docker network create \
    --driver overlay \
    --opt encrypted \
    proxy-network
fi
