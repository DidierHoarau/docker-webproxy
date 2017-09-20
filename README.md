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

_Note_: You don't need to include "www" for the domain. The proxy rules will be created for both addresses.

### Https (optional)
* discovery.service.https=y

Generation of the certificate is not fully automated but there are scripts to helps you do it:
* _Generate a certificate_: Execute the command /opt/certificates-generate.sh subdomain.example.com
* _Renew a certificate_: Execute the command /opt/certificates-renew.sh or call the api POST /api/certificates/

_Note on automation_: Using the procedures above, you can start to automate the renewal of certificates. Regarding the generation of certificate, please note that the certbot command used in this script might ask some questions so it can't be fully automated for now.
