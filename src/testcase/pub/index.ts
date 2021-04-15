import puppeteer from 'puppeteer';
import { dbConnector, Logger,Puppeteer } from '../../utils';

import axios from 'axios';
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
      // osImage:"centos-7.8-64"
      osImage:"ubuntu-18.04"
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
    
    // false 면 바로 운영중 체크 함  임시 코드
    let isCreate = true;

    if(process.env.DB_CONNECT==='use'){
      const TestCase = [
        {"title_idx":"100","message":"서버 생성 테스트 "},
        {"title_idx":"101","message":"서버 정지 테스트 "},
        {"title_idx":"102","message":"스펙 변경 테스트 "},
        {"title_idx":"103","message":"서버 시작 테스트 "},
        {"title_idx":"104","message":"서버 재시작 테스트 "},
        {"title_idx":"105","message":"공인 IP 할당 및 접속 테스트 "},
      ]
      if(!isCreate){
        TestCase.shift();
      }
      const id = process.argv[2];
      // # Create Test Case
      await TestCase.reduce(async(prev,curr,index)=>{
        const nextItem = await prev;

        const sendObj = {
          "title_idx":curr.title_idx,
          "stepimage":"",
          "pr_no":curr.title_idx,
          "serv_no":curr.title_idx,
          "message":curr.message,
          "account":id,
          "op":"WAIT"
        };

        await dbConnector.CreateAction(sendObj,process.env.nstpUUID);
        return nextItem;

      },Promise.resolve());
    }

    Logger.info(`[ Test OS Image ] ${osImage}`)
    Logger.debug(`[ Test Env      ] ${environment}`)
    Logger.debug(`[ Test Platform ] ${testPlatform}`)
    
    /**
     * Navigate Server Page 
     */
    let navigateURL = await Puppeteer.navigateLNBMenu(['Server','Server'],testPlatform,environment);
    let diffArray = navigateURL.split('/');
    let opState:string ='unKnown';
    if(diffArray[diffArray.length-1]==='server' ){
      Logger.info(`LNB Result ${navigateURL}`);


      /** 서버를 추가로 생성해야 하는 경우  */
      if(!!isCreate){
        /**
         * 서버 생성 부터 최종확인 까지는 SPA 페이지로 구성되어있기 때문에 page.waitForNavigation 사용시 timeout 발생 
         */

        // ? 테스트 시작
        if(process.env.DB_CONNECT==='use'){
          await dbConnector.UpdateAction({
            'title_idx':'100',
            'result':'N',
            'op':'RUNNING'
          },process.env.nstpUUID)
        }

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
        opState = await ServerAction.ServerOperateCheck(currPage,serverHostName);

      }
      else{

        //  nstp-0f4d-5e11-491b-9723	
        // # 서버 운영중 확인 
        opState = await ServerAction.ServerOperateCheck(currPage,"nstp-0f4d-5e11-491b-9723",true);

       
      //  await ServerAction.ServerDropDropCheck(currPage);

      
      // const isVisible = await currPage.evaluate(() => {
      //   console.log('test DropDown');
      //   const e = document.querySelector('.dropdown-menu');
      //   if (!e)
      //     return false;

      //   const style = window.getComputedStyle(e);

      //   console.log(style.perspectiveOrigin);  // 기대값 "105px 104.5px"

      //   return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      // });

      //   console.log(isVisible); // 기대값 'hidden'

      
      }
      let tempString="nstp-0f4d-5e11-491b-9723";

      if(opState==='운영중'){

        // # 서버 정지 
        await ServerAction.ServerStop(currPage,tempString);
        // # 서버 스펙 변경
        await ServerAction.ServerSpecChange(currPage,tempString);
        // # 서버 시작 
        await ServerAction.ServerStart(currPage,tempString);
        // # 서버 재시작
        await ServerAction.ServerRestart(currPage,tempString);

        // # 공인 IP 할당
        await ServerAction.ServerAssociatedPublicIPandCheck(currPage,tempString);

        // # 공인 IP 할당 및 접속
        await ServerAction.ServerAssociatedPublicIPandConnect(currPage,tempString);


      }

    }
    else{
      Logger.info(`LNB Result ${navigateURL}`);  
    }
  }
  catch(err){
    console.warn('IAAS Test Error');
    console.error(err);
    console.error(err.message);
  }

};

/**
 * Temporary Code
 * 
 */

async function TestCaseSet(uuid){

  const servNo = 99;
  const prNo = 1;
  const UUID = uuid;
  const account = process.argv[2];
  const op = 'WAIT';

  const TestCaseArray =['1','2','100','101','102','103','104'];
  // const TestCaseArray =['1'];
  const TestSetURL = `${process.env.DB_MANAGER_SERVER}/action/${UUID}`
  await TestCaseArray.forEach(async(item,index)=>{
    const sendObj = {
      "title_idx":item,
      "stepimage":"",
      "pr_no":prNo,
      "serv_no":servNo,
      "message":"서버 자동화 테스트",
      "account":account,
      "op":op
    }
    let tt = await axios.post(TestSetURL,{
      sendObj
    })
  });

}
function waitTime(time){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      resolve(true);
    },time);
  })
}
async function TestCaseUpdate(uuid){
  
}

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