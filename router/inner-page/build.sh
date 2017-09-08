#!/bin/bash 

if [ ! $1 ]
then
    echo "param missing!"
    exit 0
else
    echo "process..."

    if [ $3 -a $3 = "true" ]
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
    echo "buliding..."
    mkdir ./$1-dist
    for l_file in ./* 
    do
        if echo "Seek file: $l_file" | grep "index.html"
        then
            cp ./index.html ./$1-dist/$1.html
        elif echo "Seek file: $l_file" | grep "index-s.html"
        then
            cp ./index-s.html ./$1-dist/$1-s.html
        elif echo "Seek file: $l_file" | grep ".html"
        then
            cp $l_file ./$1-dist/$l_file
        fi
    done

    if [ $2 ]
    then
        echo "$2"
        if [ $2 = "debug" ]
        then
            # webpack-dev-server
            ps -ef | grep 'python -m SimpleHTTPServer 8000' | awk '{print $2}' | xargs kill -9
            ps -ef | grep 'Python -m SimpleHTTPServer 8000' | awk '{print $2}' | xargs kill -9
            cd $1-dist
            python -m SimpleHTTPServer 8000 &
            cd ..
            webpack -w --display-error-details
        elif [ $2 = "release" ]
        then
            webpack --config webpack.config.js -p
            cp -rf ./$1-dist ../release/
            rm -rf ./$1-dist
        else
            webpack
        fi
    else
        echo "webpacking..."
        webpack --config webpack.config.js -p
    fi
fi

