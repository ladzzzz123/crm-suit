#!/bin/bash 

if [ ! $1 ]
then
    echo "param missing!"
    exit 0
else
    echo "process..."

    if [ $2 -a $2 = "true" ]
    then
        echo "packing dialer_module"
        cd ../dialer_module
        rm dialer_module-1.0.0.tgz
        mr-doc --source ./lib --output ./doc
        npm pack
        echo "install dialer_module"
        cd $OLDPWD
        npm install ../dialer_module/dialer_module-1.0.0.tgz
    fi
    cd ./$1
    echo "cleaning..."
    rm -rf ./$1-dist
    mkdir ./$1-dist
    echo "webpacking..."
    webpack -w --display-error-details &
    cp ./index.html ./$1-dist/index.html
    webpack-dev-server --content-base ./$1-dist/
fi

