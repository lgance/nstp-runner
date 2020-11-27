import puppeteer from 'puppeteer';
import { PuppeteerExtra } from 'puppeteer-extra';

import {
  Logger,
  Puppeteer
} from '../../../utils'



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
  "ServerName":async function(page:puppeteer.Page,serverName:string){
    console.log(`${serverName} set Input `);
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

  let settingKeys = Object.keys(serverSettingObj);
  await Array.prototype.reduce.call(settingKeys,async(prev,curr,index,arr)=>{
    let nextItem = await prev;

    if(typeof settings[curr]==='undefined'){
      console.log(`Not Exist  ${curr}`);
    }
    else{
      await serverSettingObj[curr](page,curr)
    }

    return nextItem;
  },Promise.resolve())

  console.log('Complete Settings Server');

}



export const SetLoginKey = async(
  page:puppeteer.Page
) =>{

};


export const SetACG = async(
  page:puppeteer.Page
) =>{

};


export const Confirm = async(
  page:puppeteer.Page
) => {

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

