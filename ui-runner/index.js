
/**
 * .env Sample
 * path : /test-runner/.env
 * content
 * 
 * ID=auto.test@naver.com
 * PW=auto1004!
 * target=pu_beta
 * PU_BETA=http:beta-pu/
 * PU=https://console.ncloud.com/
 * GOV_BETA=http:beta-gov/
 * GOV=https://console.gov-ncloud.com/
 * FIN_BETA=https:beta-fin/
 * FIN=https://console.fin-ncloud.com/
 */

const { implicitlyWait, explicitlyWait,strMasking,safetyNavigate,getProps,explicitlyWaits,isNULL,forcedClick} = require('@utils');
const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const plguinStealth = require('puppeteer-extra-plugin-stealth');

const testPlatForm = {
  "FIN":process.env.FIN,
  "FIN_BETA":process.env.FIN_BETA,
  "GOV":process.env.GOV,
  "GOV_BETA":process.env.GOV_BETA,
  "PU":process.env.PU,
  "PU_BETA":process.env.PU_BETA
}

function isOverLay(){
	return Array.prototype.reduce.call(document.querySelectorAll('button'),(prev,curr)=>{
		let innerText = curr.innerText.trim();	
		console.log(innerText);
		if(innerText==='콘솔 시작하기'){
			console.log('catch');
			return true;
        }
		return prev;
    },false);
}

function logRequest(interceptedRequest){
  console.log('A request was mode : ',interceptedRequest.url());
}
// page.on('request',logRequest);
// page.removeListener('request',logRequest);

function TestRunner(){}

/*
  Starting Point  
*/

TestRunner.run = async function(targetNCP){
  try{
    await this.initialize({
      target:targetNCP,
      isHeadless:false
    });
    //* Login Actions
    console.time('login');
    await this.loginActions();
    console.timeEnd('login');

    // * Dimmed Close Actions
    console.time('DimmedClose');
    await this.dimmedCloseActions();
    console.timeEnd('DimmedClose');

    // ! Console Navigate Complete 
    await this.lnbSelect();

  }
  catch(err){
    console.log(err);
    process.exit(1);
  }
}
TestRunner.lnbSelect = async function(menuObj){
  try {
    console.log('lnbSelect');

  } catch (error) {
    console.error(error);
  }
}

TestRunner.initialize = async function({isHeadless,target}){
  try{
    console.time('Init Time');    
    console.log(`🚧  Initialize Installing ..`)
    console.log(`🚧  Starting headless Chrome..`)
    console.log(`🚧  You can exit at any time with Ctrl + C. \n`)
    this.targetURL = testPlatForm[process.env.target.toUpperCase()];
    console.log(`🚧 URL ${this.targetURL}`);
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--lang=ko-KR',
      // '--start-maximized' // 잠시 막음
      // '--disable-headless-mode'
    ];
    const options = {
      args,
      headless: isHeadless && true ,
      ignoreHTTPSErrors: true,
      defaultViewport :null,
  // defaultViewport : { width : 800, height : 600 },
      userDataDir: './tmp',
    }
    this.currentURL='';
    this.browser = await puppeteerExtra.launch(options);
    this.context = await this.browser.createIncognitoBrowserContext();
    // this.page = await this.browser.newPage();

    // ? Browser Secret Mode 
    this.page = await this.context.newPage();
    await safetyNavigate(this.page,this.targetURL);

    console.log(`🚧 ${await this.browser.userAgent()}`);
    console.log(`🚧  Started headless Chrome...`)
    console.timeEnd('Init Time');
  }
  catch(e){
    console.log(`🚧  An error occurred during headless chrome operation.\r\n`);
    throw new Error(e);
  }
}

// * 딤드 체크 후 종료 하는 액션 
TestRunner.dimmedCloseActions = async function(){
  try {
    const selector = '.coach-mark';
    const result = await explicitlyWait(this.page,selector);
    
    if(result!==false){
      let diText = await getProps(this.page,result,'innerText');
      let regex = /환영합니다.|님,|다시 보지 않기/gi;
      this.page.waitFor(500);
      if(regex.test(diText)===true){
        console.warn("🚧 Dimmed is output and Close Window.");
      }
    }
    else{
      console.warn('🚧 Dimmed was not output .Process to the next Step .');
      return false;
    }
  } catch (error) {
    console.error(error);
  }
}

// * 로그인 페이지가 맞는지 체크 
TestRunner.loginCheck = async (page)=>{
  try{
  const selector = 'input[placeholder*=아이디]';
  const result = await explicitlyWait(page,selector);

  if(result!==false){1
     console.log('🚧 Current Page is Login Page ');
     let props = await getProps(page,result,'innerHTML');
     console.log(props);
     return true;
  }
  else{
    console.log('🚧 Current Page is Not Login Page ');
    return false;
  }
 }
 catch(e){console.error(e);}
}

/**
 * Chaining Func
 */
TestRunner.loginActions = async function (){
  try{
    let id = process.env.ID;
    let pw  = process.env.PW;
  
    if(id && pw){
      let consolePw = strMasking(pw);
      console.log(`🚧  Attempt to log in [ ID : ${id} ] `);
      console.log(`🚧  Attempt to log in [ PW : ${consolePw} ]\r\n `);
  
      let retValue = await this.loginCheck(this.page);
  
      if(retValue){
        await this.page.focus('input[id=username]');
        await this.page.keyboard.type(id);
        await this.page.focus('input[type=password]');
        await this.page.keyboard.type(pw);
        await this.page.keyboard.press('Enter');
        await this.page.waitForNavigation();
        this.currentURL = await this.page.url();
  
        console.log(this.targetURL);
  
        await this.loginFinal();
      }
      //? Login Page 가 아닌 경우 브라우저 세션에 의해 콘솔로 바로 들어가게 된 경우 
      else{
        console.log('Console Success');
        await implicitlyWait(2500);
        await this.puppeteerClose();  
      }
    }else{
      throw new Error('[loginActions] Not Exist Login Configuration : Check your root directory .env');
    }
    return this;
  }
  catch(e){console.error(e);}
}
TestRunner.loginFinal = async function(){
  try{
    if(this.currentURL=== this.targeURL){
      console.log(this.currentURL);
      console.log(this.targetURL);
      console.log('🚧  Attempt to log in Successfully');
    }
    else{
      console.log('Console Navigate Failed');
      console.log(`[CurrentURL] ${this.currentURL}`);
      console.log(`[TargetURL] ${this.targetURL}`);
      const selector = '.loginSecure';
      const loginSecureEle = await explicitlyWait(this.page,selector);

      // * 비밀번호 변경 안내 페이지 인지 
      if(loginSecureEle!==false){
        let props = await getProps(this.page,loginSecureEle,'innerText');
        let regEx = /비밀번호변경 안내|90일마다/gi;
        let changePasswordCheck = regEx.test(props);
        // * 비밀번호 변경 안내 페이지 버튼이 있는지 
        if(changePasswordCheck){
          const selector = '.loginSecure button';
          const buttons = await explicitlyWaits(this.page,selector);

          let nextChangeBtn;
          await Array.prototype.reduce.call(buttons,async (prev,curr)=>{
            const nextItem = await prev;

            let itemText = await getProps(this.page,curr,'innerText');
            let diffText = itemText.replace(/\r\n|\n| |\s/gi,"");
            // console.log(`[itemText] : ${itemText}`);
            console.log(`[diffText] : ${diffText}`);

            if(/다음에변경하기/gi.test(diffText)){
              nextChangeBtn = curr;
            }

            return nextItem;
          },Promise.resolve());

          // forced CLick Actions 
          // * 다음에 변경하기 버튼이 있는지 
          if(isNULL(nextChangeBtn)){
            console.log('[nextChangeButton Click] ');

            // * Console로 변경 될 때 까지 클릭 
            await forcedClick(this.page,nextChangeBtn,"다음에 변경하기",async ()=>{
              try {
                let regExp = /[A-Za-z.-]+/g;
                this.currentURL = await this.page.url();
                
                let currentProtocolUrl = this.currentURL.match(regExp)[1];
                let targetProtocolUrl = this.targetURL.match(regExp)[1];
                console.log(`[Current] ${currentProtocolUrl}  <----> [Target] ${targetProtocolUrl}`)
  
                return currentProtocolUrl===targetProtocolUrl;
              } catch (error) {
                console.error(error);
              }
            });
            // let isCondition = 0 ;
            // let _cnt = 3;
            // let regExp = /[A-Za-z.-]+/g;
            // while(isCondition < _cnt){
            //   await nextChangeBtn.click();
            //   await this.page.waitFor(500);
            //   this.currentURL = await this.page.url();
            //   let currentProtocolUrl = this.currentURL.match(regExp)[1];
            //   let targetProtocolUrl = this.targetURL.match(regExp)[1];

            //   console.log(`[Current] ${currentProtocolUrl}  <----> [Target] ${targetProtocolUrl}`)

            //   if(currentProtocolUrl===targetProtocolUrl){
            //     console.log('[Click Success]');
            //     isCondition = _cnt + 1; // loop 종료 조건 
            //   }
            //   else{
            //     console.log('[Click Fail]');
            //   }
            // }
            
          }
        }
      }else{
        throw new Error('[Login Actions] UnKnown Login Error');
      }
    }
  }
  catch(e){
    console.log(e);
  }
}


// * 종료전 URL 및 페이지 종료 -> 브라우저 종료 
TestRunner.puppeteerClose = async function(){
  console.log(await this.page.url());
  await this.page.close();
  await this.browser.close();
}
module.exports = TestRunner;

