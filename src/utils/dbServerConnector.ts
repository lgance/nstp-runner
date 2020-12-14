import axios from 'axios';

export const CreateAction = async(obj,UUID)=>{
  const dbServerURL = `http://${process.env.DB_MANAGER_SERVER}/action/${UUID}`

  let res = await sendDB(obj,'POST',dbServerURL);
  return res;
}

export const UpdateAction = async(obj,UUID)=>{
  const dbServerURL = `http://${process.env.DB_MANAGER_SERVER}/action/${UUID}`
  let res = await sendDB(obj,'PUT',dbServerURL);
  return res;
}

// updateObj
// "title_idx":"1"
// "result":""
// "op":"COMPLETE"

function sendDB(sendObj,_method,_url){
  return new Promise(async(resolve,reject)=>{
    try{
      const data = JSON.stringify(sendObj);
      const response = await axios({
        method:_method,
        url:_url,
        headers: { 
          'Content-Type': 'application/json'
        },
        data:data
      });

      resolve(response);
    }
    catch(err){
      reject(err);
    }
  })
}






