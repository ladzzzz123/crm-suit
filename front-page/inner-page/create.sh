#!/bin/bash 
# function create_page create page with this func

create_page() {
    page_name=$1
    https=$2
    grecord=$3
    share=$4
    vue=$5
    util=$6
    dialer=$7
    es6=$8
    template_name="full-index"

    echo "input $https $grecord $share $vue"
    echo "create floder..."
    echo $page_name
    mkdir $page_name
    if [ ! $? -eq 0 ]
    then 
        echo "error"
        exit 0
    fi
    cd ./$page_name
    echo "create src folder..."
    mkdir ./src
    echo "process input params..."
    if [ $https = "y" ]
    then
        echo "need export https"
        cp ../prototype/$template_name-s.html ./index-s.html
    fi
    # cp template html file
    cp ../prototype/$template_name.html ./index.html

    # create js
    touch ./src/main.js
    if [ $es6 = "y" ]
    then
        echo "export es6 env"
        cp ../prototype/.babelrc ./
        echo "/* jshint esversion: 6 */" >> ./src/main.js
        if [ $vue = "y" ]
        then
            cp ../prototype/webpack.config.vue.js ./webpack.config.js
            echo 'import Vue from "vue"; ' >> ./src/main.js
        else
            cp ../prototype/webpack.config.es6.js ./webpack.config.js
        fi
        
    else
        cp ../prototype/webpack.config.org.js ./webpack.config.js
    fi 


    if [ $share = "y" ]
    then
        echo "need export share"
        if [ $es6 = "y" ]
        then   
            echo '
import { shareManager } from "dialer_module/env";
const currentUrl = location.href.split("#")[0];
const curPath = location.href.substr(0, [location.href.lastIndexOf("/")]);      
let shareParams = {' >> ./src/main.js
        else
            echo '
var share = require("dialer_module/share");
var currentUrl = location.href.split("#")[0];
var curPath = location.href.substr(0, [location.href.lastIndexOf("/")]);
var shareParams = {' >> ./src/main.js
        fi
        echo 'approaches: ["wechat", "timeline"], //要分享途径，{wechat: "微信好友", timeline: "微信朋友圈"...}
    dlg_title: "分享到",
    title: "", //分享标题
    content: "", //分享描述
    from: "web_call", //分享的tag，用于统计分享次数，默认为web_call,通常情况下不需要修改
    url: currentUrl, //分享的链接
    wechat_share_url: currentUrl, //用于微信二次分享的链接
    keep_org_url: true, //分享链接是否需要转换为短链接，true表示不需要保持原有链接，不需要转换
    image_url: curPath + "/img/icon.jpg", //分享的小图标
    img_url: curPath + "/img/icon.jpg" //分享的小图标
};
            '  >> ./src/main.js
    fi

    if [ $grecord = "y" ]
    then
        echo "need export google record"
        if [ $es6 = "y" ]
        then
            echo 'import { recorder } from "dialer_module/env";' >> ./src/main.js
        else
            echo 'var recorder = require("dialer_module/recorder");' >> ./src/main.js
        fi
        echo "recorder.init(\"$page_name\");" >> ./src/main.js
    fi 

    if [ $util = "y" ]
    then
        echo "need export util.js"
        if [ $es6 = "y" ]
        then        
            echo 'import { util as mUtil } from "dialer_module/env";' >> ./src/main.js
        else
            echo "var mUtil = require(\"dialer_module/util\");" >> ./src/main.js
        fi
    fi 
    if [ $dialer = "y" ]
    then
        echo "need export dialer env"
        if [ $es6 = "y" ]
        then 
            echo 'import { dialerEnv } from "dialer_module/env";' >> ./src/main.js
        else    
            echo "var dialerEnv = require(\"dialer_module/dialer\");" >> ./src/main.js
        fi
    fi 

    # process res folder
    echo "process res"
    cp -rf ../prototype/res ./
    echo "success!"
}
# function end


echo "Welcome! Please type the new webpage name:" 
read -p "page name: " page
read -p "use es6? (y/n): " es6
read -p "use vue? (y/n): " vue
read -p "need https? (y/n): " https
read -p "need google data record? (y/n): " grecord
read -p "need process share? (y/n): " share
read -p "need util? (y/n): " util
read -p "need dialer env? (y/n): " dialer
echo "input: $page"
if [ ! -d "$page" ]; then
    create_page $page $https $grecord $share $vue $util $dialer $es6
else
    echo "page exist!!"
    exit 0
fi

