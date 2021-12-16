#!/bin/bash 

# default ENV 
file_Dir="./argo-ci"
temp_Dir="./argo-ci_temp"
# CONSOLE_VER=${VER}
CONSOLE_VER="hahaha"
echo ${CONSOLE_VER}

# Inject ENV into yaml 
rm -rf $temp_Dir
cp -r $file_Dir $temp_Dir

find $temp_Dir  -name "*.yaml" -exec perl -pi -e "s/@@CONSOLE_VER@@/${CONSOLE_VER}/g" {} \;