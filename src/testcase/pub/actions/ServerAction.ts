import puppeteer from 'puppeteer';
import { PuppeteerExtra } from 'puppeteer-extra';
import * as dbConnector from '../../../utils/dbServerConnector';;

import {
  Logger,
  Puppeteer
} from '../../../utils'

declare let document:HTMLDocument | null | undefined| any;


interface NIC{
  NIC:string;
  Subnet:string;
}
interface INetworkInterface{
  eth0:string;
  eth1:NIC
}

enum StorageType {
  SSD='SSD',
  HDD='HDD'
}
enum CPUGenerationType{
  g1='g1',
  g2='g2'
}
enum PriceType {
  Month='Month',
  Day ='Day'
}


interface IIAASSettings {
  [key:string]:string | StorageType | CPUGenerationType | boolean| PriceType | undefined ;
  Zone?:string;
  SecureZone?:boolean;
  StorageType?:StorageType;
  Generation?:CPUGenerationType;
  ServerType?:string;
  PriceType?:PriceType;
  ServerCount?:string;
  ServerName?:string;
  ServerUsedHostName?:boolean;
  ServerProtectedTerminated?:boolean;
  Memo?:string;
  InitScript?:string;
}


interface VPCIAASSettings {
  VPC:string;
  Subnet?:string;
  StorageType?:StorageType;
  ServerType?:string;
  UsedStorageSecurity?:boolean;
  PriceType?:PriceType;
  ServerCount?:string;
  ServerName?:string;
  ServerUsedHostNamed?:boolean;
  NetworkInterface?:INetworkInterface;
  Placement?:boolean;
  PlacementName?:string;
  ServerProtectedTerminated?:boolean;
  Memo?:string;
  InitScript?:string;
}

function deleteSpaceString(string){
  return typeof string!=='undefined' ? string.replace(/\r\n|\n| |\s/gi,"") : false
}


export const ServerSelect = async(
  page:puppeteer.Page,
  findServerHostName:string
) => {
  let isVisibleTable = await Puppeteer.explicitlyVisibleWait(page,'table.tbl.select-tbl');

  if(!isVisibleTable){
    Logger.error('ServerOperateCheck Error is not Display table');
    throw new Error('ServerOperatedCheck is not Display table HTML');
  }

  let tableRowSelector = 'table.tbl.select-tbl > tbody';
  let tableRowEles = await Puppeteer.explicitlyWaits(page,tableRowSelector);

  let currentServerState='unKnown';
  let selectFlag = false;

  await Array.prototype.reduce.call(tableRowEles,async(prev,curr)=>{
    let nextItem = await prev;

    let notDetailRow:any = await Puppeteer.explicitlyWait(curr,'tr');

    let notDetailRowColumn = await Puppeteer.explicitlyWaits(notDetailRow,'td');
    let serverHostColumn = notDetailRowColumn[1];
    let operateColumn = notDetailRowColumn[4];

    let currServerHostName = await Puppeteer.getProps(page,serverHostColumn,'innerText');

    if(deleteSpaceString(currServerHostName)===findServerHostName){
      // Find HostName TD and CLick Table Row
      await curr.click();
      selectFlag = true;
    }
    return nextItem;
},Promise.resolve());


  return selectFlag;

}

// # 서버 관리 및 설정 변경 Drop Down 
export const ServerManageAndConfigurationButtonClick = async(
  page:puppeteer.Page,
  menu:string
):Promise<boolean> =>{
  let menuFlag = false;




  return menuFlag;

}


// 서버 정지 101
export const ServerStop = async(
  page:puppeteer.Page,
  serverHostName:string
) => {
  let testResult = 'N';
  // ? 테스트 시작
  if(process.env.DB_CONNECT==='use'){
    await dbConnector.UpdateAction({
      'title_idx':'101',
      'result':testResult,
      'op':'RUNNING'
    },process.env.nstpUUID)
  }

  // * Test Process 
  let next = await ServerSelect(page,serverHostName);
  if(next===false){
    testResult='F';
    throw new Error ('Server Stop Test Case Fail [ Server Select Fail ]')
  }
  console.log(next);
  next = await ServerManageAndConfigurationButtonClick(page,'시작');



  await page.waitFor(2000);

  // ? 테스트 종료 및 결과
  await dbConnector.UpdateAction({
    'title_idx':'101',
    'result':testResult,
    'op':'COMPLETE'
  },process.env.nstpUUID)


}

// 서버 스펙 변경  102
export const ServerSpecChange = async(
  page:puppeteer.Page,
  serverHostName:string
) => {

  let testResult = 'N';
  // ? 테스트 시작
  if(process.env.DB_CONNECT==='use'){
    await dbConnector.UpdateAction({
      'title_idx':'102',
      'result':testResult,
      'op':'RUNNING'
    },process.env.nstpUUID)
  }

  // * Test Process 



  await page.waitFor(2000);



  // ? 테스트 종료 및 결과
  await dbConnector.UpdateAction({
    'title_idx':'102',
    'result':testResult,
    'op':'COMPLETE'
  },process.env.nstpUUID)



}

// 서버 시작 103
export const ServerStart = async(
  page:puppeteer.Page,
  serverHostName:string
) =>{

  let testResult = 'N';
  // ? 테스트 시작
  if(process.env.DB_CONNECT==='use'){
    await dbConnector.UpdateAction({
      'title_idx':'103',
      'result':testResult,
      'op':'RUNNING'
    },process.env.nstpUUID)
  }

  // * Test Process 

  await page.waitFor(2000);




  if(process.env.DB_CONNECT==='use'){
    // ? 테스트 종료 및 결과
    await dbConnector.UpdateAction({
      'title_idx':'103',
      'result':testResult,
      'op':'COMPLETE'
    },process.env.nstpUUID)
  }


}
// 서버 재시작 104
export const ServerRestart = async(
  page:puppeteer.Page,
  serverHostName:string
) => {
  let testResult = 'N';
  // ? 테스트 시작
  if(process.env.DB_CONNECT==='use'){
    await dbConnector.UpdateAction({
      'title_idx':'104',
      'result':testResult,
      'op':'RUNNING'
    },process.env.nstpUUID)
  }

  // * Test Process 



  await page.waitFor(2000);


  if(process.env.DB_CONNECT==='use'){
    // ? 테스트 종료 및 결과
    await dbConnector.UpdateAction({
      'title_idx':'104',
      'result':testResult,
      'op':'COMPLETE'
    },process.env.nstpUUID)
  }
}

// 공인 IP 할당 및 확인 105 -> 임시 기능 
export const ServerAssociatedPublicIPandCheck = async(
  page:puppeteer.Page,
  serverHostName:string
) => {


  let testResult = 'N';
  // ? 테스트 시작
  if(process.env.DB_CONNECT==='use'){
    await dbConnector.UpdateAction({
      'title_idx':'105',
      'result':testResult,
      'op':'RUNNING'
    },process.env.nstpUUID)
  }

  // * Test Process 



  await page.waitFor(2000);



  if(process.env.DB_CONNECT==='use'){
    // ? 테스트 종료 및 결과
    await dbConnector.UpdateAction({
      'title_idx':'105',
      'result':testResult,
      'op':'COMPLETE'
    },process.env.nstpUUID)
  }



}
// 공인 IP 할당 및 접속 105
export const ServerAssociatedPublicIPandConnect = async(
  page:puppeteer.Page,
  serverHostName:string
) => {

}







export const ConsoleCreateServer = async (page:puppeteer.Page) =>{
  const consoleHeaderBtnSelector = 'div.page-header button';
  const btnArray = await Puppeteer.explicitlyWaits(page,consoleHeaderBtnSelector);
  
  if(btnArray!==false && typeof btnArray!=="boolean"){
    const findText="서버생성";
    let serverCreateButtonEle;
    await Array.prototype.reduce.call(btnArray,async(prev,curr,index,arr)=>{
      const nextItem = await prev;
      Logger.debug(`Loop ${index}`);      

      let headerButtonText = await Puppeteer.getProps(page,curr,'innerText');
      if(deleteSpaceString(headerButtonText) ===findText){
        Logger.info(`Find CreateServer Button ${index}`);
        serverCreateButtonEle=curr;
      }
      return nextItem;
    },Promise.resolve());
    

    await serverCreateButtonEle.click();
    await page.waitForNavigation();

    return true;
  }
  else{
    Logger.error(`Not Found Element ${consoleHeaderBtnSelector}`);
    throw new Error('[Failed] Console Create Server Action ');
  }

}

/**
 * 
 * @param page Puppeteer Page
 * @param osImage Select Server Image Name 
 */
export const SelectOSImage = async (page:puppeteer.Page,osImage:string) =>{
  
  /**
   * TBD Boot Disk Size Select
   * 50GB
   * 100GB(Windows,Server,MSSQL 은 부팅디스크 크기가 100인 모델만 있습니다.)
   */
  //! 부팅 디스크 크기 선택하는 로직 

  /**
   * TBD Image Type Select
   * OS
   * Application
   * DBMS
   */
  //! 이미지 타입 선택하는 로직

  /**
   * TBD OS Image Type Select
   * All 
   * CentOS
   * Ubuntu
   * Windows
   */
  //! OS 이미지 타입 선택하는 로직

  /**
   * TBD Server Type Select
   */
  //! 서버 타입 선택하는 로직


  // ? 해당 선택 후에 서버 이미지 이름을 찾은 후에 다음 버튼 선택 
  // * 현재는 테스트 시연용이기 때문에  centos-7.8-64 와 ubuntu-18.04 를 테스트하도록 하겠습니다. 
  let serverImagetableRowSelector = 'div.box.server-create-select-image .tbl > tbody > tr';
  let serverImageRowEles = await Puppeteer.explicitlyWaits(page,serverImagetableRowSelector);
  
  if(serverImageRowEles!==false && typeof serverImageRowEles!=="boolean"){
    console.log(`Test OS Image ${osImage}`);

    let nextButtonEle;
    await Array.prototype.reduce.call(serverImageRowEles,async(prev,curr,index,arr)=>{
      const nextItem = await prev;

      Logger.debug(`Loop ${index}`);
      
      let serverImageEle:any = await Puppeteer.explicitlyWait(curr,'td');
      let serverImageEleText = deleteSpaceString(await Puppeteer.getProps(page,serverImageEle,'innerText'));
     
      if(serverImageEleText===osImage){
        Logger.info(`Find Test OS Image ${serverImageEleText}`);
        nextButtonEle = await Puppeteer.explicitlyWait(curr,'button');
      }
      return nextItem;

    },Promise.resolve());

    await nextButtonEle.click();
    // await page.waitForNavigation(); SPA 페이지 기 때문에 페이지 이동이 발생하지않음
    // waitForNavigation 사용시 timeout 발생 

  }
  else{
    throw new Error('Server Image List Not Display');
  }
}





let serverSettingObj = {
  "Zone":async function(){},
  "SecureZone":async function(){},
  "StorageType":async function(){},
  "GenerationType":async function(){},
  "ServerType":async function(){},
  "ServerTypeSpec":async function(){},
  "PriceType":async function(){},
  "ServerCount":async function(){},
  "ServerName":async function(page:puppeteer.Page,serverHostName:string){
    
    // const createServerDiv = 'div.server-create-set-up-server';
    // const createServerEle:any = await Puppeteer.explicitlyWait(page,createServerDiv);
    // console.log('input viewport test');
    // console.log(await createServerEle.isIntersectingViewport());
    // console.log('input viewport test after');
    // const rowSelector = 'div.box-body div.form-group.row';


    // const rootDiv = await Puppeteer.explicitlyVisibleWait(page,rowSelector,3,1000);
    // if(!rootDiv){
    //   Logger.error('Root Div is not Visible ');
    //   throw new Error ('server Settings Error');
    // }
    const rowSelector = 'div.server-create-set-up-server div.box-body div.form-group.row';
    const rowElements = await Puppeteer.explicitlyWaits(page,rowSelector);
    const findText='서버이름';

    await Array.prototype.reduce.call(rowElements,async(prev,curr,index,arr)=>{
      let nextItem = await prev;
      
      let rowLabelEle = await Puppeteer.explicitlyWait(curr,'label');
      if(rowLabelEle!==false && typeof rowLabelEle !=='boolean'){
        let rowText = await Puppeteer.getProps(page,rowLabelEle,'innerText');

        if(rowText.replace(/\r\n| |\s/gi,"")===findText){
          Logger.debug(`Find ServerName ROW ${rowText} ${serverHostName}`);

          let inputEle:any = await Puppeteer.explicitlyVisibleWait(curr,'input');
          let inputEleHTML = await Puppeteer.getProps(page,inputEle,'innerHTML');
          console.log(inputEleHTML);

          await inputEle.type(serverHostName);
          // await page.focus(inputEle);
          // await page.keyboard.type(serverHostName);
        }
      }
      return nextItem;
    },Promise.resolve() );

    console.log(`${serverHostName} set Input `);
  },
  "HostName":async function(){},
  "ProtectedSettings":async function(){},
  "Memo":async function(){},
  "InitScript":async function(){}
}

export const SettingsServer  = async(
  page:puppeteer.Page,
  settings : IIAASSettings            
) =>{
  console.log('Settings Classic Server');
  console.log(`ServerName ${settings.ServerName}`);

  const rowSelector = 'div.server-create-set-up-server div.box-body div.form-group.row';

  const rootDiv:any= await Puppeteer.explicitlyVisibleWait(page,rowSelector,3,1000);
  if(!rootDiv){
    Logger.error('Root Div is not Visible ');
    throw new Error ('server Settings Error');
  }


  let settingKeys = Object.keys(serverSettingObj);
  await Array.prototype.reduce.call(settingKeys,async(prev,curr,index,arr)=>{
    let nextItem = await prev;

    if(typeof settings[curr]==='undefined'){
      // console.log(`Not Exist  ${curr}`);
    }
    else{
      await serverSettingObj[curr](page,settings[curr]);
    }

    return nextItem;
  },Promise.resolve())

  console.log('Complete Settings Server');
  
  
  let buttonEles = await Puppeteer.explicitlyWaits(page,'div.server-create-set-up-server button[type=button]');
  await Array.prototype.reduce.call(buttonEles,async(prev,curr,index,arr)=>{
    let nextItem = await prev;
      let innerText = await Puppeteer.getProps(page,curr,'innerText');
      if(deleteSpaceString(innerText)==="다음"){
         await curr.click();
      }
    return nextItem;
  },Promise.resolve());

}



export const SetLoginKey = async(
  page:puppeteer.Page
) =>{
  Logger.info('setLoginKey Action');

  // # Page Display Check 
  let setLoginKeyPageSelector = 'div.server-create-authentication';
  let visibleButton:any = await Puppeteer.explicitlyVisibleWait(page,setLoginKeyPageSelector);

  if(!visibleButton){
    Logger.error('setLoginKey Action next Button not Display');
    throw new Error('setLoginKey Action');
  }

  // Login Key Next Button Display Check 
  let setLoginKeyButtonSelector = 'div.server-create-authentication button[type=button]'
  let nextButton:boolean | puppeteer.ElementHandle = await Puppeteer.getVisibleButton(page,setLoginKeyButtonSelector,"다음",2,1000);
  
  if(typeof nextButton !=='boolean'){
    await nextButton.click();
  }
  else{
    Logger.error(`setLoginKey Action next Button not Display ${nextButton}`);
    throw new Error('setLoginKey Action');
  }

};


export const SetACG = async(
  page:puppeteer.Page
) =>{
  Logger.info('setACG Action');

  // div.server-create-select-image FE에서 재사용중으로 바로 button 으로 체크 
  // SetACG Next Button Display Check 
  let setACGButtonSelector = 'div.server-create-select-image button[type=button]';
  let nextButton:boolean | puppeteer.ElementHandle = await Puppeteer.getVisibleButton(page,setACGButtonSelector,"다음");
  
  if(typeof nextButton !=='boolean'){
    await nextButton.click();
  }
  else{
    Logger.error(`setACG Action next Button not Display ${nextButton}`);
    throw new Error('setACG next Button not Found');
  }


  
  // let setACGButtonSelector = 'div.server-create-select-image button[type=button]';

  // let buttonEles = await Puppeteer.explicitlyWaits(page,setACGButtonSelector);
  
  // let isCondition = 0;
  // let count = 3;

  // let nextButton = false;
  // let termFlag = true;

  // // true 이거나 true 
  // while((isCondition < count) && termFlag ){
    
  //   await Array.prototype.reduce.call(buttonEles,async(prev,curr)=>{
  //       let nextItem = await prev;

  //       let innerText = await Puppeteer.getProps(page,curr,'innerText');
  //       // console.log(deleteSpaceString(innerText));
  //       // console.log(await curr.isIntersectingViewport());
  //       if(deleteSpaceString(innerText)==="다음" && await curr.isIntersectingViewport()){
  //         //  await curr.click(); 
          
  //         nextButton = curr;
  //         termFlag = false;
  //       }

  //       return nextItem;
  //   },Promise.resolve());

  //   ++isCondition;
  // }

  // if(!nextButton){throw new Error('setACG next Button not Found')}
  // else{await nextButton.click();}
};


export const Confirm = async(
  page:puppeteer.Page
) => {
  Logger.info('setConfirm Action');

  // await page.keyboard.down('PageDown');  
  // // await page.keyboard.press('PageDown');  
  // await page.keyboard.up('PageDown');  

  let reviewButtonSelector ='div.server-create-review button[type=button]';
  // let reviewButtonSelector = 'div.server-create-review .btn.btn-lg.success';
  let visibleButton:any = await Puppeteer.explicitlyVisibleWait(page,reviewButtonSelector);

  if(!visibleButton){
    Logger.error('ReView Action Server Create Button not Display');
    throw new Error('setConfirm Action');
  }

  let buttonEles = await Puppeteer.explicitlyWaits(page,reviewButtonSelector);

  await Array.prototype.reduce.call(buttonEles,async(prev,curr)=>{
      let nextItem = await prev;
        let innerText = await Puppeteer.getProps(page,curr,'innerText');

        console.log(innerText);
        console.log(await curr.isIntersectingViewport());

        if(deleteSpaceString(innerText)==="서버생성" ){
          await curr.click();
          // if(await curr.isIntersectingViewport()){
          //   await curr.click();
          // }
          // else{
          //   console.log('Confirm Review Create Button is not Displayed');
          // }
        }
      return nextItem;
    },Promise.resolve());


  let modalBtnSelector = 'div.modal-dialog button[type=button]';
  let modalDialogBtn = await Puppeteer.explicitlyVisibleWait(page,modalBtnSelector);
    
  if(modalDialogBtn!==false && typeof modalDialogBtn!=="boolean"){
    await Puppeteer.modalCapture(page,'serverCreate Confirm');
    await modalDialogBtn.click();
    if(process.env.DB_CONNECT==='use'){
      // ? 테스트 종료 및 결과
      await dbConnector.UpdateAction({
        'title_idx':'100',
        'result':'P',
        'op':'COMPLETE'
      },process.env.nstpUUID)
    }
  }
  else{
    Logger.error('Not Display Modal Dialog Button');
  }

}

interface IOperateCheck {
  expectedOperation?:string

}


export const ServerOperateCheck = async(
  page:puppeteer.Page,
  findServerHostName:string,
  checkFlag=false 
)=>{

  let isVisibleTable = await Puppeteer.explicitlyVisibleWait(page,'table.tbl.select-tbl');

  if(!isVisibleTable){
    Logger.error('ServerOperateCheck Error is not Display table');
    if(process.env.DB_CONNECT==='use'){
      // ? 테스트 종료 및 결과
      await dbConnector.UpdateAction({
        'title_idx':'100',
        'result':'F',
        'op':'COMPLETE'
      },process.env.nstpUUID)
    }
    throw new Error('ServerOperatedCheck is not Display table HTML');
  }

  let tableRowSelector = 'table.tbl.select-tbl > tbody';
  let tableRowEles = await Puppeteer.explicitlyWaits(page,tableRowSelector);

  let maximumTime = 900000;
  let waitTime = 0;
  let isCondition = true;
  // 1 minute
  // let period = 60000;
  // 30 minute
  let period = 30000;
  let currentServerState='unKnown';

  // true  90만 > 91   true && 900000  > 0 
  while(isCondition && (maximumTime > waitTime)){
  
  await Array.prototype.reduce.call(tableRowEles,async(prev,curr)=>{
      let nextItem = await prev;

      let notDetailRow:any = await Puppeteer.explicitlyWait(curr,'tr');

      let notDetailRowColumn = await Puppeteer.explicitlyWaits(notDetailRow,'td');
      let serverHostColumn = notDetailRowColumn[1];
      let operateColumn = notDetailRowColumn[4];

      let currServerHostName = await Puppeteer.getProps(page,serverHostColumn,'innerText');

      if(deleteSpaceString(currServerHostName)===findServerHostName){
        let operateStatus = await Puppeteer.getProps(page,operateColumn,'innerText');
        let diffOperateStr = deleteSpaceString(operateStatus);
        currentServerState = diffOperateStr;
          Logger.debug(`Server Status Check 
          Server [ ${currServerHostName} ] 
          Status [ ${operateStatus} ]`);

          if(diffOperateStr==="운영중"){
            // loop exit
            isCondition = false;
            
          }
          else if(checkFlag===true){
            isCondition = false;
          }
          else {
            // wait 1 minute and loop continue
            await page.waitFor(period);
            waitTime += period;
          }
      }
      return nextItem;
  },Promise.resolve());

  }
  // Server Create Timeout Exception
  if(maximumTime < waitTime){
    Logger.error(`Server Create Timeout ${currentServerState}`);
    throw new Error(`Server Create Timeout ${currentServerState}`);
  }

  // # return Server State ;
  return currentServerState;
}

export const ServerDropDropCheck = async(
  page:puppeteer.Page
) =>{
  let dropDown = await Puppeteer.explicitlyWaits(page,'.dropdown-menu');

  await Array.prototype.reduce.call(dropDown,async(prev,curr,index)=>{
    const nextItem = await prev;

    const innerText = await Puppeteer.getProps(page,curr,'innerHTML');
    console.log(await curr.isIntersectingViewport());
    console.log(innerText);

    return nextItem;
  },Promise.resolve())
}



/**
 * VPC Server Settings
 * @param page 
 * @param settings 
 */

export const SettingsVPCServer  = async(
  page:puppeteer.Page,
  settings : VPCIAASSettings           
) =>{
  

}













async function setZone(){}
async function setSecureZone(){}
async function setStorageType(){}
async function setGenerationType(){}
async function setServerType(){}
async function setServerTypeSpec(){}
async function setPriceType(){}
async function setServerCount(){}
async function setServerName(page:puppeteer.Page,serverName?:string){
  let serverNameSelector =''
  let serverNameInputEle = await Puppeteer.explicitlyWait(page,serverNameSelector);
  if(serverNameInputEle!==false && typeof serverNameInputEle!=="boolean"){


  }
}
async function setHostName(){}
async function setProtectedSettings(){}
async function setMemo(){}
async function setInitScript(){}

