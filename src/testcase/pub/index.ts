import puppeteer from 'puppeteer';
import { Logger,Puppeteer } from '../../utils';

/*
  enviornment : 테스트 환경 
  1 - PlatForm Check
  2 - selected Platform ( Clssic, VPC ) 
  3 - selected LNB ( Server  - Server ) Main , Sub 

*/
export const PUBLIC = async (environment:string,)=>{

  let testPlatform = process.argv[5] || 'Classic';
  Logger.info(`Test Start ->>> ${environment}`);

  let page:puppeteer.Page = await Puppeteer.getPage();
  let platformSelector = 'div.platform button.btn.btn-sm.flat.btn-platform.active'  ;
  
  let platformEle = await Puppeteer.explicitlyWait(page,platformSelector);

  if(platformEle!==false){
   let currentPlatform:string = await Puppeteer.getProps(page,platformEle,'innerText');
    Logger.info(`[Current Selected Platform] > ${currentPlatform}`);
    Logger.info(`[testPlatform] ${testPlatform}`);
    // 타겟 플랫폼이 같은 경우 그대로 진행
    if(currentPlatform.toLowerCase()===testPlatform){
      Logger.info(`The Current platform and the test platform are the same `);
    }
    // 타겟 플랫폼이 다를 경우 해당 플랫폼을 선택 후 진행 
    else{
      Logger.info(`[Selected Another] Platform ${currentPlatform}`);
      await Puppeteer.selectedPlatform(testPlatform);
    }

    // Temporary Code 
    await IAAS({
      environment:environment,
      testPlatform:testPlatform,
      osImage:"Centos-7.8"
    });

    return true;
  }
  else{
    Logger.error('Console is not Display');
    return false;
  }

}

interface IIAASOptions {
  environment:string;
  testPlatform:string;
  osImage:string;
}


/**
 * IAAS ( Compute ) Automation Function 
 */
const IAAS = async (testOptions : IIAASOptions) =>{
  let {osImage,testPlatform,environment} =testOptions;
  
  Logger.info(`[ Test OS Image ] ${osImage}`)
  Logger.debug(`[ Test Env      ] ${environment}`)
  Logger.debug(`[ Test Platform ] ${testPlatform}`)
  await Puppeteer.navigateLNBMenu(['Server','Server'],testPlatform,environment);


}



