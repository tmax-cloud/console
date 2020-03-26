#! /bin/bash

FILENAME="run-bridge.sh"

cd examples
if [ -f "$FILENAME" ] && [ -w "$FILENAME" ]
then
  if [ -z `grep "hc-console-version" $FILENAME` ]
  then
    sed -i -e '$a\' $FILENAME
    echo "    --hc-console-version=0.0.0 \\" >> $FILENAME
  fi
  TAG=$(git describe --tags $(git rev-list --tags --max-count=1))
  #echo $TAG
  sed -i "s/version=*.*.*/version=$TAG/" $FILENAME 
fi

