import {
  Logger,
  paramValidator,
  LoginConsole,
  Puppeteer
} from './utils';

import { Worker, isMainThread,parentPort} from 'worker_threads';

import {
  PUBLIC
} from './app';

// npm start idpw@naver.com ##### pub_beta classic UUID
const main = async ()=>{
  try{
    
    /** NSTP Test Runner Param Validation */
    const TestConsole:string = paramValidator();
    /*
     Safety Navigate Console
    */
    await LoginConsole();
    
    switch(TestConsole.toUpperCase()){
      case 'PUB_BETA':
        await PUBLIC('beta');
        break;
      case 'PUB_REAL':
        await PUBLIC('real');
        break;
      case 'FIN_REAL':

        break;
      case 'FIN_BETA':

        break;
      default:
          Logger.info('Non Selected TestConsole');
        return;
    }

    await Puppeteer.close();
    
  }
  catch(err){
    Logger.error(err);
    process.exit(1);
  }
}
main();


/**
 * .env Sample
 * 
  DB_PORT=80     // Data Base Port 
  DB_HOST=''     // 
  DB_NAME=''
  DB_PORT=''
  DB_USERNAME=''
  PUBLIC_PATH='../'  // isStepDebug  ScreenShot Image Public Path
  VIEWS_PATH=''      //  Views Folder used Template Engine 
  FIN_REAL=console.fin-ncloud.com
  FIN_BETA=
  GOV_REAL=console.gov-ncloud.com
  GOV_BETA=
  PUB_REAL=https://console.ncloud.com
  PUB_BETA=
  PRODUCTION=dev   
    {
      dev : A request is issued every time a step is taken.
      test : Non Request 
      production : Debug log X Request to Server Next Step 
    }
 */


