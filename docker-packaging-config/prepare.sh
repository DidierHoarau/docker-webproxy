#!/bin/bash

set -e

npm install

npm run build

cp -R $PROJECT_DIR/node_modules $PACKAGING_FILES
cp -R $PROJECT_DIR/dist-proxy $PACKAGING_FILES
cp -R $PROJECT_DIR/dist-watcher $PACKAGING_FILES
