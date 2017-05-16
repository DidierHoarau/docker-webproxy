#!/bin/bash

npm install

rm -fr $PACKAGING_FILES
mkdir -p $PACKAGING_FILES

cp -R $PROJECT_DIR/node_modules $PACKAGING_FILES
cp -R $PROJECT_DIR/src $PACKAGING_FILES
