#!/bin/bash

# NodeJS app
cd /opt/app
node src/app.js &

# Nginx
nginx -g "daemon off;"
