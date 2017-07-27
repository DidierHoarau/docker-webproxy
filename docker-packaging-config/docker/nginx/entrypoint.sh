#!/bin/bash

# NodeJS app
cd /opt/app
node src-proxy/app.js &

# Nginx
nginx -g "daemon off;"
