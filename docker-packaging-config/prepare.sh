#!/bin/bash


# Registrator
npm install
cp -R $PROJECT_DIR/node_modules $PROJECT_PACKAGE_FILES_DIR
cp -R $PROJECT_DIR/src $PROJECT_PACKAGE_FILES_DIR
cp -R $PROJECT_DIR/node_modules $PROJECT_PACKAGE_FILES_DIR
rm -f $PROJECT_PACKAGE_FILES_DIR/src/config/config.override.json
