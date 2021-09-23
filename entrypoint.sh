#!/bin/sh -l

mkdir chrome-publish-action-src
cp -r /github/chrome-publish-action-src .
cp --parents $INPUT_ZIP chrome-publish-action-src

cd chrome-publish-action-src

npm install
node index.js
