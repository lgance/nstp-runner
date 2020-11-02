import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import path from 'path';
// const axios = require('axios');

/* //? define config variable  */
// const uploadFilePath = path.resolve(__dirname,'test-png2.png');
// const uploadUrl = 'http://127.0.0.1/upload';
const returnTimeout = 5000;

// sendReport(uploadUrl,uploadFilePath)
// .then(res=>{
//   console.log(res);
// })
// .catch(err=>{
//   console.error(err);
// })


function sendReport(uploadUrl:string,uploadFilePath:string){
  return new Promise((resolve,reject)=>{
    if(fs.existsSync(uploadFilePath)){
      const stream = fs.createReadStream(uploadFilePath);
      const form = new FormData();
      form.append('dump',stream);
      axios.post(uploadUrl,form,{
        headers:form.getHeaders(),
        timeout:returnTimeout
      })
      .then(res=>{resolve(res.data)})
      .catch(err=>{reject(false);})
    }
    else{
      reject('not Exist File');
    }
  })
}