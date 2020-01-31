
const { implicitlyWait, explicitlyWait,strMasking,safetyNavigate,getProps} = require('@utils');
const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const plguinStealth = require('puppeteer-extra-plugin-stealth');

const puppeteerOptions = {
  headless:true,
  ignoreHTTPSErros:true,
  defaultViewport :null,
  // defaultViewport : { width : 800, height : 600 },
  timeout:10000,
  args: ['--start-maximized']
  // slowMo :5,
}
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

TestRunner.initialize = async function({isHeadless}){
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
      '--start-maximized'
      // '--disable-headless-mode'
    ];
    
    const options = {
      args,
      headless: isHeadless,
      ignoreHTTPSErrors: true,
      defaultViewport :null,
  // defaultViewport : { width : 800, height : 600 },
      userDataDir: './tmp',
    }

    this.currentURL='';
    this.browser = await puppeteerExtra.launch(options);
    this.page = await this.browser.newPage();


    await safetyNavigate(this.page,this.targetURL);

    console.log(`🚧 ${await this.browser.userAgent()}`);

    // If everything correct then no 'HeadlessChrome' sub string on userAgent
    // const userAgent = await this.page.evaluate(() => navigator.userAgent );
    // console.log(userAgent);

    console.log(`🚧  Started headless Chrome...`)
    console.timeEnd('Init Time');
  }
  catch(e){
    console.log(`🚧  An error occurred during headless chrome operation.\r\n`);
    throw new Error(e);
  }
}
/**
 * Chaining Func
 */
TestRunner.loginActions = async function (){
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
    else{
      console.error('🚧  Attempt to log in Failure');
      await implicitlyWait(2500);
      await this.puppeteerClose();  
    }
  }else{
    throw new Error('[loginActions] Not Exist Login Configuration : Check your root directory .env');
  }
  return this;
}
TestRunner.loginFinal = async function(){
  try{
    if(this.currentURL=== this.targeURL){
      console.log('제대로 옴');
      console.log(this.currentURL);
      console.log(this.targetURL);
      console.log('🚧  Attempt to log in Successfully');
    }
    else{
      console.log('제대로 못옴');
      console.log('다시 재시도');
      this.page.waitFor(500);
      await safetyNavigate(this.page,this.targetURL);
    }
  }
  catch(e){
    console.log(e);
  }
}

TestRunner.loginCheck = async (page)=>{
  const selector = 'input[placeholder*=아이디]';
  const result = await explicitlyWait(page,selector);
  let props = await getProps(page,result,'innerHTML');

  if(result!==false){
     console.log('🚧 Current Page is Login Page ');
     console.log(props);
     return true;
  }
  else{
    console.log('🚧 Current Page is Not Login Page ');
    return false;
  }
}

TestRunner.allServices = async function(){
  console.log('allServices')

}

TestRunner.otherServices = async function(service){
  console.log('otherService');
  
}

TestRunner.puppeteerClose = async function(){
  await this.page.close();
  await this.browser.close();
}

TestRunner.run = async function(services){
  try{
    const service = services || 'ALL';

    await this.initialize({isHeadless:true});
    console.time('login');
    await this.loginActions();
    console.timeEnd('login');




    service.toUpperCase()==='ALL' ? await this.allServices() : await this.otherServices(service);

    await implicitlyWait(2500);
    this.puppeteerClose();
  }
  catch(err){
    console.log(err);
    process.exit(1);
  }
}
module.exports = TestRunner;