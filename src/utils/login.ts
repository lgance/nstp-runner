import puppeteer from 'puppeteer';
import { PuppeteerExtra } from 'puppeteer-extra';
import { Logger } from './logger';
import * as Puppeteer from './puppeteer';


const isDebug = true;

export const LoginConsole = async ()=>{
   
  const browser = await Puppeteer.getBrowser({isHeadless:false});
  if(browser){
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    
    const id = process.argv[2];
    const pw = process.argv[3];
    const url = process.env.url || 'https://console.ncloud.com';

    await Puppeteer.goto(page,url);

    /** Login Value Check */    
    if(id && pw){
      const consolePW : string = strMasking(pw);

      if(isDebug){
        Logger.debug(`ID [${id}]`);
        Logger.debug(`PW [${consolePW}]`);
      }

      let loginPage:boolean = await isLoginPage(page);
      if(loginPage){
        await setID(page,id);
        await setPW(page,pw);

        await page.keyboard.press('Enter');
        await page.waitForNavigation();

        Logger.info('Login Button Action');

        // PasswordChangeCheck
        let currentURL = await page.url();
        let isDashBoard = await dashBoardCheck(currentURL,url);

        if(isDashBoard){
          Logger.info(`🚧  Attempt to log in Successfully`);
          Logger.info(`Current URL ${currentURL}`);
          Logger.info(`Navigate URL ${url}`);
        }
        else{
          Logger.info(`🚧 Console Navigate Failed`);
          Logger.info(`🚧 [Check] passwordAfterwards`);
          if(await passwordAfterwardsCheck(page,currentURL,url)){
            Logger.info(`🚧 [Check-Success] passwordAfterwards`);
            Logger.info(`🚧 dimmedCloseActions`);
            await dimmedCloseActions(page);
          }
          else{

          }
          
        }

        await page.waitFor(5000);
        await page.close();
        await browser.close();
      }
      /** Exist Session Console Navigate Success */
      else{
        Logger.info('Console Navigate Success');
      }
    }
    Puppeteer.setPage(page);
    return true;
  }
  else{
    Logger.error(`Browser Instance not Initialize`);
    throw new Error('Browser Instance Not Initialize');
  }
}
async function dimmedCloseActions(page:puppeteer.Page):Promise<boolean>{
  const selector = '.coach-mark';
  const dimmedEle = await Puppeteer.explicitlyWait(page,selector);

  if(dimmedEle!==false){

    let diText = await Puppeteer.getProps(page,dimmedEle,"innerText");
    let regex = /환영합니다.|님,|다시 보지 않기/gi;
    await page.waitFor(500);

    if(regex.test(diText)===true){
      Logger.info("🚧 Dimmed is output and Close Window.");
      let dimmedBtnArr = await Puppeteer.explicitlyWaits(dimmedEle,'.btn');
      let dimmedCloseBtn;

      //! dimmedBtnArr 이 undefined 거나 NULL일 경우에 대한 분기 처리 필요 

      await Array.prototype.reduce.call(dimmedBtnArr,async(prev,curr)=>{
        let nextItem = await prev;
        let btnText = await Puppeteer.getProps(dimmedEle,curr,'innerText');  
        let diffText = btnText.replace(/\r\n|\n| |\s/gi,"");
        
        if(/닫기/gi.test(diffText)){
          dimmedCloseBtn = curr;
        }
        return nextItem;
      },Promise.resolve());

        await Puppeteer.forcedClick(page,dimmedCloseBtn,"딤드 처리 제거",async ()=>{
          try{
            let afterDimmedEle = await Puppeteer.explicitlyWait(page,'.coach-mark',3,500);
            if(afterDimmedEle===false){
              return true;
            }
            else{
              return false;
            }
          }
          catch(err){
            console.error(err);
            return false;
          }
        })
      return true;
    }
    else{
      return false;
    }
  }
  else{
    Logger.info('🚧 Dimmed was not output .Process to the next Step .');
    return true;
  }

}
async function passwordAfterwardsCheck(page:puppeteer.Page,currentURL,navigateURL){
  const selector = '.loginSecure';
  const loginSecureEle = await Puppeteer.explicitlyWait(page,selector);

  /** Check passwordChange Request Page */
  if(loginSecureEle!==false){
    Logger.info(`🚧 The current page is the password change request page. `);
    Logger.info('🚧 Proceed to change the default setting afterwards.');

    let props = await Puppeteer.getProps(page,loginSecureEle,'innerText');
    let regEx = /비밀번호변경 안내|90일마다/gi;
    let changePasswordCheck = regEx.test(props);
    /** Check passwordChange Request Button */
    /** 30일 비밀번호 변경 버튼 유무 확인  */
    if(changePasswordCheck){ 
      Logger.info('[Check] nextChangeButton ');
      const selector = '.loginSecure button';
      const buttons = await Puppeteer.explicitlyWaits(page,selector);

      let nextChangeBtn;
      await Array.prototype.reduce.call(buttons,async(prev,curr)=>{
        const nextItem = await prev;
        let itemText = await Puppeteer.getProps(page,curr,'innerText');
        let diffText = itemText.replace(/\r\n|\n| |\s/gi,"");
        Logger.info(`[diffText] : ${diffText}`);

        if(/다음에변경하기/gi.test(diffText)){
          Logger.info('[Check-Success] nextChangeButton ');
          nextChangeBtn = curr;
        };

        return nextItem;
      },Promise.resolve());
      if(nextChangeBtn==="undefined" || 
      nextChangeBtn===undefined || 
      nextChangeBtn ==="null" || 
      nextChangeBtn===null){ 
        //! nextChange Button is NULL
         Logger.error('[Check-Failed] nextChange Button is not Exist'); 
         return false;
      }
      else{
        Logger.info(`[Click] passwordAfterwards Button`);
        // * Console로 변경 될 때 까지 클릭 
        await Puppeteer.forcedClick(page,nextChangeBtn,"다음에 변경하기",async ()=>{
          try {
            let regExp = /[A-Za-z.-]+/g;
            let currentURL:any = await page?.url();
            let currentProtocolUrl = currentURL.match(regExp)[1];
            let navigateProtocolUrl = navigateURL.match(regExp)[1];
            Logger.info(`[Current] ${currentProtocolUrl}  <----> [Target] ${navigateProtocolUrl}`)

            return currentProtocolUrl===navigateProtocolUrl;
          } catch (error) {
            console.error(error);
            return false;
          }
        });

        //? passwordAfterwardsCheck Success Return  
        return true;
      }
    }

    /** InValid ID or InValid Password */
    else{
      const loginRootElement = await Puppeteer.explicitlyWait(page,'.center-wrap.mh-20');
      let resultCheck;
      if(loginRootElement!==false){
        resultCheck = await Puppeteer.getProps(page,loginRootElement,'innerHTML');
      }

      if(resultCheck.match(/패스워드 오류/gi)){
        throw new Error('[Login Actions] PassWord Error');
      }
      else if(resultCheck.match(/아이디(메일)를 확인해 주세요/gi)){
        throw new Error('[Login Actions] ID/Mail Error');
      }
      else{
        throw new Error('[Login Actions] UnKnown Login Error');
      }
    }
  }
  else{
    Logger.error('not Exist loginSecureEle ');
    return false;
  }

}
async function dashBoardCheck(currentURL,navigateURL) :Promise<boolean> {
    let regExp = /[A-Za-z.-]+/g;
    let currentProtocolUrl = currentURL.match(regExp)[1];
    let navigateProtocolUrl = navigateURL.match(regExp)[1];
    Logger.info(`[Current] ${currentProtocolUrl}  <----> [Target] ${navigateProtocolUrl}`);
    return currentProtocolUrl===navigateProtocolUrl;
}
async function setID(page:puppeteer.Page,id:string){
  await page.focus('input[id=username]');
  await page.keyboard.type(id);
}
async function setPW(page:puppeteer.Page,pw:string){
  await page.focus('input[type=password]');
  await page.keyboard.type(pw);
}
async function isLoginPage(page){
  try{
    const selector = 'input[placeholder*=아이디]';
    const element:puppeteer.ElementHandle | boolean = await Puppeteer.explicitlyWait(page,selector);
  
    if(element!==false){
       Logger.info('🚧 Current Page is Login Page ');
       let props = await Puppeteer.getProps(page,element,'innerHTML');
       if(isDebug){
         Logger.debug(props);
       }
       return true;
    }
    else{
      Logger.error('🚧 Current Page is Not Login Page ')
      return false;
    }
   }
   catch(e){console.error(e); return false;}
}

function strMasking (password:string) :string {
  return password.split('').reduce((prev,curr,index)=>{
    if(index < 5){return prev+curr;}
     else{return prev+'*'};
  },"");
}

