import {
  Logger,
  paramValidator,
  LoginConsole
} from './utils';

import {
  PUB_REAL,PUB_BETA
} from './app';

const main = async ()=>{
  try{
    const TestConsole:string = paramValidator();
    /*
     Safety Navigate Console
    */
    await LoginConsole();

    switch(TestConsole.toUpperCase()){
      case 'PUB_BETA':
        await PUB_BETA();
        break;
      case 'PUB_REAL':
        console.log(PUB_REAL);
        break;
      case 'FIN_REAL':

        break;
      case 'FIN_BETA':

        break;
      default:
          Logger.info('Non Selected TestConsole');
        return;
    }
  }
  catch(err){
    Logger.error(err);
    process.exit(1);
  }
}
main();