const express = require('express')
const {spawn,exec} = require('child_process');

const app = express();
const port = 7070;

const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/', (req, res) => {
  console.log(req);
  
  res.send('Hello World!')
})
app.put('/',async(req,res)=>{
  console.log(req);
  res.send('Put test');
})

app.post('/',async(req,res)=>{
  console.log(req);
  res.send('Post test');
})

app.post('/run',async (req,res)=>{
  const {id,pw}  = req.body;
  console.log(`Test Call ${req.body}`);
  const env = 'pub_beta';
  const platform = 'classic';
  const uuid = createUUID();
  
  const TaskObject = {
    "account":id,
    "password":pw,
    "env":env,
    "platform":platform,
    "uuid":uuid
  }

  runTestRunnerExec(TaskObject);
  res.send(uuid);
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});


function runTestRunnerExec(TaskObject){
  let command =`npm start ${TaskObject.account} ${TaskObject.password} ${TaskObject.env} ${TaskObject.platform} ${TaskObject.uuid}`;
  exec(command,(err,out,stderr)=>{
    console.log(out);
  });
}


// npm start account passwd pub_beta classic uuid
function runTestRunnerSpawn(account,pw,env,platform,uuid){
  return new Promise(async(resolve,reject)=>{
    try{
      let _command = 'npm';
      let _runnerOptions = ['start',account,pw,env,platform,uuid];

    }
    catch(err){
      reject(false);
      console.error(err);
    }
  })  
}

function createUUID() {
  let d = new Date().getTime();
  if (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
  ) {
    d += performance.now(); // use high -precision timer if available
  }

  return 'task-xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  })
 }
