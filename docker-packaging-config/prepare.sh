#!/bin/bash

npm install

cp -R $PROJECT_DIR/node_modules $PACKAGING_FILES
cp -R $PROJECT_DIR/src-proxy $PACKAGING_FILES
cp -R $PROJECT_DIR/src-watcher $PACKAGING_FILES
