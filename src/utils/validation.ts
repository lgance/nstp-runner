import { Logger } from './logger';
import 'dotenv/config';
/*
  TODO .env Sample 
  !ID=[myNcloudID]
  !PW=[myNcloudPW]
  ?DB_PORT=80
  ?PUBLIC_PATH='../'
  ?VIEWS_PATH=''
  ?DB_HOST=''
  ?DB_NAME=''
  ?DB_PORT=''
  ?DB_USERNAME=''
  ?FIN_REAL=
  ?FIN_BETA=
  ?GOV_REAL=
  ?GOV_BETA=
  ?PUB_REAL=console.ncloud.com
  ?PUB_BETA=
  ?PRODUCTION
  test
  dev
  production
    
*/
/** fin, fin_Beta,gov,gov_beta,pu,pu_beta */
function platformValidate(param:string) : void {
  const testPlatForm = {
    "FIN_REAL":process.env.FIN_REAL,
    "FIN_BETA":process.env.FIN_BETA,
    "GOV_REAL":process.env.GOV_REAL,
    "GOV_BETA":process.env.GOV_BETA,
    "PUB_REAL":process.env.PUB_REAL,
    "PUB_BETA":process.env.PUB_BETA
  }
  if(param==="undefined" || param===undefined || param===null){
    Logger.error('Please Check your Runtime Parameter ');
    Logger.error(`1. param is -> ${param}`);
    process.exit(0);
  }

  
  let _param:string = param.toUpperCase();
  const url = testPlatForm[_param];

  if(url==="undefined" || url===undefined || url===null){
    Logger.error(`undefined Get URL : ${url}`);
    Logger.error('Check List');
    Logger.error('1. Platform Param ');
    Logger.error('2. Directory Root Check your .env File ');
    process.exit(0);
  }
  process.env.url=url;
  return url;
}
export const paramValidator = ()=>{
  console.log(process.argv[6])
  if(process.env.NODE_ENV==='development'){
      Logger.info('Development Env');
  }
  else{
    if(process.argv.length <= 5){
      Logger.error('Parameter Validation Error');
      Logger.error('Please set [ID], [PassWord], [TargetPlatForm] ');
      Logger.error(`Current Param ID : ${process.argv[2]}`)    
      Logger.error(`Current Param Password : ${process.argv[3]}`)    
      Logger.error(`Current Param Test Console : ${process.argv[4]}`)  
      throw new Error('Param Validation Error');  
    }
    else if(typeof process.argv[6]==="undefined"){
      Logger.error('UUID is not Exist');
      throw new Error('Required UUID Param');
    }
    let ID = process.argv[2];
    var emailReg = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    if(!emailReg.test(ID)){
      throw new Error(`ID Email Error is not Email ${ID}`);
    }

  
    Logger.info(`Automation URL ${platformValidate(process.argv[4])}`);
  
    
    for(let i=2;i<process.argv.length;i++){
      Logger.info(process.argv[i]);
    }
    // global UUID variable
    process.env.nstpUUID = process.argv[6];
  }
  
  return process.argv[4];
}