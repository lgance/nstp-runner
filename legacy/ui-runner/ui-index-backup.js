
/**
 * .env Sample
 * path : /test-runner/.env
 * content
 * 
 * ID=auto.test@naver.com
 * PW=auto1004!
 * target=pu_beta
 * PU_BETA=
 * PU=https://console.ncloud.com/
 * GOV_BETA=
 * GOV=https://console.gov-ncloud.com/
 * FIN_BETA=
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

/**
 * 
 * @param {*} message 로깅 메시지 
 * @param {*} logObject 
 */
function _LOG(message,logObject){
  console.log(`************* [${message}] *************`);
  if(typeof logObject!=="undefined" || typeof logObject!==undefined){
    console.error(logObject);
  }
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




  Initialize -> loginActions -> dimmedCloseActions -> lnb Select 

*/

TestRunner.run = async function(targetNCP){
  try{
    await this.initialize({
      target:targetNCP,
      isHeadless:false
    });
    
    //* Login Actions
    console.time('login');
    if(await this.loginActions()){
    console.timeEnd('login');
        // ? Login Success
        // * Dimmed Close Actions
        console.time('DimmedClose');
        await this.dimmedCloseActions();
        console.timeEnd('DimmedClose');

        //  ? Dimmed Close Success 
        // ! Console Navigate Complete 
        // let menuObject = {}
        // await this.lnbSelect('Server','Server');
      }
    else{
      // ! Login Fail 
      return false;
    }
  }
  catch(err){
    console.log(err);
    this.puppeteerClose();
  }
}


/**
 * @param {*} menuObj 
 * @description PlatForm 유무에 따라 체크 default 아직 안정함
 * 
 * * Test Case 
 * TODO Server -> Server
 * TODO Server -> Bare Metal Server
 * TODO Server -> Server Image
 * TODO Server -> Server Image Builder
 * TODO Server -> Storage
 * TODO Server -> Snapshot 
 * TODO Server -> Public IP
 * TODO Server -> Init Script
 * TODO Server -> Private Subnet 
 * TODO Server -> Network Interface
 * TODO Server -> ACG
 * 
 * ? 위의 케이스 완료 후 테스트 해야할 메뉴 이동 응용 케이스
 * TODO Cloud Insight(Monitoring) -> Configuration -> Event Rule 혹은 Template 
 * TODO Server -> Server -> Public IP -> Init Script -> ACG -> Server(타이틀) -> Server Image 
 * TODO Server -> Init Script -> ACG -> Load Balancer     
 * 
 * TODO 1. 북마크가 있는 경우 
 * TODO 2. 북마크가 없는 경우
 * TODO 3. 북마크는 없는데 최근에 선택을 해서 Recently Viewed 에 있는 경우 
 * 
 * 
 */

TestRunner.lnbSelect = async function(menuObj){
    console.log(menuobj);
    console.log('lnbSelect');
}

TestRunner.getRootMenu = async function(menuItem){

}

TestRunner.initialize = async function({isHeadless,target}){
  try{
    _LOG('initialize');
    console.time('Init Time');    
    console.log(`🚧  Initialize Installing ..`)
    console.log(`🚧  Starting headless Chrome..`)
    console.log(`🚧  You can exit at any time with Ctrl + C. \n`)
    // this.targetURL = testPlatForm[process.env.target.toUpperCase()];

    let _target = target.toUpperCase();
    this.targetURL = testPlatForm[_target];
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
    _LOG('dimmedCloseActions Init');

    const selector = '.coach-mark';
    const dimmedEle = await explicitlyWait(this.page,selector);
    
    if(dimmedEle!==false){
      _LOG('dimmedCloseActions Check')
      let diText = await getProps(this.page,dimmedEle,'innerText');
      let regex = /환영합니다.|님,|다시 보지 않기/gi;
      this.page.waitFor(500);
      if(regex.test(diText)===true){
        _LOG('dimmedCloseActions Start');
        console.warn("🚧 Dimmed is output and Close Window.");
        let dimmedBtnArr = await explicitlyWaits(dimmedEle,'.btn');
        let dimmedCloseBtn;
        await Array.prototype.reduce.call(dimmedBtnArr,async(prev,curr,index,arr)=>{
          let nextItem = await prev;
          let btnText = await getProps(dimmedEle,curr,'innerText');  
          let diffText = btnText.replace(/\r\n|\n| |\s/gi,"");
          
          if(/닫기/gi.test(diffText)){
            dimmedCloseBtn = curr;
          }
          return nextItem;
        },Promise.resolve());

        await forcedClick(this.page,dimmedCloseBtn,"딤드 처리 제거",async ()=>{
          try{
            let afterDimmedEle = await explicitlyWait(this.page,'.coach-mark',3,500);
            if(afterDimmedEle===false){
              return true;
            }
            else{
              return false;
            }
          }
          catch(err){
            console.error(err);
          }
        })
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
    _LOG('loginActions');
    let id = process.env.ID;
    let pw  = process.env.PW;
  
    if(id && pw){
      _LOG('ID PW Input');
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
  
        let finalResult = await this.loginFinal();
        if(finalResult===false){
          _LOG('login Failure');
          return false;
        }
        else{
          _LOG('login Success');
          return true;
        }
      }
      //? Login Page 가 아닌 경우 브라우저 세션에 의해 콘솔로 바로 들어가게 된 경우 
      else{
        _LOG('login Success - not Login Actions');
        return false;
      }
    }else{
      throw new Error('[loginActions] Not Exist Login Configuration : Check your root directory .env');
    }
    return this;
  }
  catch(e){console.error(e); return false;}
}
TestRunner.loginFinal = async function(){
  try{
    _LOG('Final Login Check');
    if(this.dashBoardCheck(this.targetURL)){
      _LOG('Final Login Success');
      console.log(this.currentURL);
      console.log(this.targetURL);
      console.log('🚧  Attempt to log in Successfully');

      return true;
    }
    else{
      _LOG('Login Fail Check URL');
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
          }
        }
      }else{
        const loginRootElement = await explicitlyWait(this.page,'.center-wrap.mh-20');
        const resultCheck  = await getProps(this.page,loginRootElement,'innerHTML');

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
  }
  catch(e){
    console.log(e);
    return false;
  }
}


TestRunner.dashBoardCheck = async function(targetURL){
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
}
// * 종료전 URL 및 페이지 종료 -> 브라우저 종료 
TestRunner.puppeteerClose = async function(){
  console.log(await this.page.url());
  await this.page.close();
  await this.browser.close();
  // await process.exit(0);
}


module.exports = TestRunner;

