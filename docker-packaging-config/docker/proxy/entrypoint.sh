#!/bin/bash

# NodeJS app
cd /opt/app
node dist-proxy/app.js &

# Nginx
nginx -g "daemon off;"
