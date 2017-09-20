#!/bin/bash

ADDRESS=$1

if [ "${ADDRESS}" == "" ]; then
  echo No address specified
  exit 1
fi

certbot --nginx certonly -d ${ADDRESS} -d www.${ADDRESS}

echo Reloading Proxy
curl -X POST http://localhost:3000/api/services/update/
