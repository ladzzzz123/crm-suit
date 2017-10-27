const Courier = require("node-process-bearer").Courier;
const logger = require("node-process-bearer").logger.getLogger();
const mysql = require("mysql");
let request = require("request");
const fs = require("fs");
const CONFIG = require("../config/ad-preview.json");

let export_func = {
    name: "ad-preview",
    asyncUploadFile: (file, ad_pos, opter) => {
        return new Promise((resolve, reject) => {
            let reader = fs.createReadStream(file.path);
            let newPath = `${opter}_${ad_pos}.jpg`;
            let stream = fs.createWriteStream(CONFIG.savePath + newPath);
            reader.pipe(stream);
            let url = CONFIG.visitPath + newPath;
            resolve({ status: "success", msg: "上传附件成功", path: url });
        });
    },
};

let courier = new Courier(export_func);
courier.listening();