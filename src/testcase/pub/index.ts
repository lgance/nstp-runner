import puppeteer from 'puppeteer';
import { Logger,Puppeteer } from '../../utils';

import { ServerAction } from './actions'
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

  if(platformEle!==false && typeof platformEle !=="boolean"){
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
      // osImage:"Centos-7.8"
      osImage:"centos-7.8-64"
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




let serverHostName = createUUID();
/**
 * IAAS ( Compute ) Automation Function 
 */
const IAAS = async (testOptions : IIAASOptions) =>{
  try{
    let {osImage,testPlatform,environment} =testOptions;
    let currPage = await Puppeteer.getPage();
    
    // false 면 바로 운영중 체크 함 
    let isCreate = false;

    Logger.info(`[ Test OS Image ] ${osImage}`)
    Logger.debug(`[ Test Env      ] ${environment}`)
    Logger.debug(`[ Test Platform ] ${testPlatform}`)

    /**
     * Navigate Server Page 
     */
    let navigateURL = await Puppeteer.navigateLNBMenu(['Server','Server'],testPlatform,environment);
    let diffArray = navigateURL.split('/');
    if(diffArray[diffArray.length-1]==='server' ){
      Logger.info(`LNB Result ${navigateURL}`);


      /** 서버를 추가로 생성해야 하는 경우  */
      if(!!isCreate){
        /**
         * 서버 생성 부터 최종확인 까지는 SPA 페이지로 구성되어있기 때문에 page.waitForNavigation 사용시 timeout 발생 
         */
        // # 서버 생성 버튼
        await ServerAction.ConsoleCreateServer(currPage);

        // # 서버 이미지 선택 
        await ServerAction.SelectOSImage(currPage,osImage);
        enum PriceType {
          Month='Month',
          Day ='Day'
        }

        // # 서버 설정
        if(testPlatform==='vpc'){
          await ServerAction.SettingsVPCServer(currPage,{
            VPC:""
          });
        }
        else if(testPlatform==="classic"){
          await ServerAction.SettingsServer(currPage,{
            ServerName:serverHostName
          });
        }
        else{
          Logger.error(`Test Plat Form Error  ->>>> ${testPlatform} `)
          throw new Error('is not Exist Test Platform');
        }
        
        // # 인증키 설정 
        await ServerAction.SetLoginKey(currPage);

        // # 네트워크 접근 설정 
        await ServerAction.SetACG(currPage);

        // # 최종 확인
        await ServerAction.Confirm(currPage);

        // # 서버 생성중 확인
        await ServerAction.ServerOperateCheck(currPage,serverHostName);

      }
      else{
        // # 서버 운영중 확인 
       await ServerAction.ServerOperateCheck(currPage,"nstp-ee9f-ef3e-4605-a7f7");

      }
   
    }
    else{
      Logger.info(`LNB Result ${navigateURL}`);  
    }
  }
  catch(err){
    console.warn('IAAS Test Error');
    console.error(err);
  }

};

/**
 * Temporary Code
 * 
 */

function createUUID(): string {
  let d = new Date().getTime();
  if (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
  ) {
    d += performance.now(); // use high -precision timer if available
  }

  return 'nstp-xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  })
 }


 /**
  * 
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  */