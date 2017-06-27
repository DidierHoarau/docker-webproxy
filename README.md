# Docker-Webproxy

Docker-Webproxy is a Nginx reverse proxy with additional features to automatically integrate with your Docker containers

## What problems is this solving?

You have a server running containers and you would like the server to redirect to the appropriate container depending on the the domain or subdomain accessed.

This is a simple solution to address this problem.

## How does it work?

This container and the target service must run on the same server. The containers can run in a single Docker Engine or in Docker Swarm.

_Note:_ Even though Swam is supported the targeted container must be on the same machine for now

## How to run it?

This repo has been packaged with [https://github.com/DidierHoarau/docker-packaging] so to run it you have to execute...

For Docker Engine:
* Create the Docker network webproxy-network
* npm run packaging:prepare
* npm run packaging:image-build
* npm run packaging:service-run

For Docker Swarm:
* Set the environment variable DOCKER_REGISTRY
* Create the Docker network webproxy-network
* npm run packaging:prepare
* npm run packaging:image-build swarm
* npm run packaging:image-push swarm
* npm run packaging:service-deploy swarm

## Features

The configuration is made by adding labels to the target container

### The basic one:
* discovery.service.name=subdomain.example.com
* discovery.service.port=3000

### Https
* discovery.service.https=y

The This labels is not fully automated by the webproxy container. (Documentation will be updated soon regarding this aspect)
