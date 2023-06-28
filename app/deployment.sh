#!/bin/bash

npm run build

DEPLOYMENT_PATH_ROOT=$(echo "$DEPLOYMENT_PATH" | cut -f 2 -d "/")

cd dist/client

if [[ "$DEPLOYMENT_PATH" == "/" || -z "$DEPLOYMENT_PATH" ]]
then
  echo "deployment path is the root directory - moving output not necessary"
else
  echo "moving dist/client files into dist/client$DEPLOYMENT_PATH"
  mkdir -p .$DEPLOYMENT_PATH

  ls -A | grep -v $DEPLOYMENT_PATH_ROOT | xargs mv -t .$DEPLOYMENT_PATH
fi

cd ../..
