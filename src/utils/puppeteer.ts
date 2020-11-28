import puppeteer from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import cloudscraper  from 'cloudscraper';

import { Logger, Puppeteer } from './';

type NullType = null | undefined | 'undefined' | "null";
/**
 * 
 * Manage browser instances with a singleton.
 *
 */
 let browserSingleton:puppeteer.Browser | undefined;
/**
 * 
 * Manage browser pages instances
 *
 */
interface IBrowserPages {}
let browserPages = {};
let browserPage :puppeteer.Page;

/**
  const options = {
        args,
        headless: isHeadless && true ,
        ignoreHTTPSErrors: true,
        defaultViewport :null,
       defaultViewport : { width : 800, height : 600 },
        userDataDir: './tmp',
      } 
*/

interface IOptions{
  isHeadless?: boolean | undefined;
  isDebug?:boolean | undefined;
}

export const getBrowser = async(options:IOptions)=>{
  if(!browserSingleton) browserSingleton = await initialize(options)
  return browserSingleton;
}


// export const setPage = async(page:puppeteer.Page,pageUniqueKey:string) =>{
//   if(!browserPages[pageUniqueKey]){
//     browserPages = page;
//   }
//   else{ Logger.debug(`${pageUniqueKey} is Already `)}
// }
export const close = async () =>{
  Logger.debug(`Automation Close this url ${await browserPage.url()}`)  
  await browserPage.waitFor(5000);
  await browserPage.close();
  await browserSingleton?.close();

}

export const getPage = async () : Promise<puppeteer.Page>=>{
  return browserPage;
}

export const setPage = async (page:puppeteer.Page) =>{
  if(!browserPage){
    browserPage = page;
  }
}
// export const getPage = async (pageUniqueKey:string) : puppeteer.Page =>{
//   return browserPages[pageUniqueKey];
// }




/**
 * Console LNB Menu Interface
 * ex: Compute - Server - Server 
 * {
 *  category : compute,
 *  service : Server,
 *  menu : Server , 
 *  
 * }
 */
interface IConsoleMenu{
  main?:string;  
}


/**
 * 메뉴의 예시 해당 메뉴 아이템을 DOM을 통해서 가지고 온후 비교 
 */
const vpcCompute = {
  Server : [
  'Server',
  'Server Image',
  'Storage',
  'Snapshot',
  'Init Script',
  'Network Interface',
  'ACG'
  ]
}
const classicCompute = {
  Server : [
    'Server',
    'Bare Metal Server',
    'Server Image',
    'Server Image Builder',
    'Storage',
    'Snapshot',
    'Public IP',
    'Init Script',
    'Private Subnet',
    'Network Interface',
    'ACG'  
  ]
}


export const selectedPlatform = async(testplatform:string) =>{
  Logger.info(`[Selected] Platform ${testplatform}`);

}

/**
 * BookMark 및 Products & Services로 선택하는 기능 배제 Prototype 끝나면 추가 
 * 현재는 프로토타입으로 기본 Step 으로 진행 
 * 또한 북마크 기능이 없기 때문에 북마크가 되어야 있어야 합니다.
 * 
 * 
 * Exception {
 *   Step 1.  Main Menu, SubMenu 로 이동
 *   Step 2 . 메뉴이동이 정상적이지 않은 경우 URL로 이동합니다. - 아직 기능 제외
 * }
 */

// : Promise<puppeteer.Page>=>{


export const navigateLNBMenu = (
  menuString:string[],
  testplatform:string,
  environment:string
) : Promise<string> =>{
  return new Promise(async(resolve,reject)=>{

    let [mainMenu,subMenu] = menuString;
    let env = environment.toLowerCase();
    let platform = testplatform.toLowerCase();
    let page = await Puppeteer.getPage();
    Logger.info(`[Click] main Menu <  ${mainMenu}   >`);
    Logger.info(`[Environment] is ${env}`);
    /**
     * mainMenu Click and Status Check 
     */
    let mainSelector;
    if(mainMenu==="Server" && platform==='classic'){
      mainSelector = '#Server > span';
    }
    else if(mainMenu==="Server" && platform==='vpc') {
      mainSelector = '#VPCServer > span';
    }

    let serviceMenu = await Puppeteer.explicitlyWait(page,mainSelector);
    if(serviceMenu!==false && typeof serviceMenu!=="boolean"){
    await serviceMenu.click();
    }
    else{
      Logger.error(`Not Found Element ${mainSelector}`);

      // 임시 코드 Bookmark 기능 이 없기 때문에 
      throw new Error('Not Found Main Menu Element');
    }
  


    Logger.info(`[Click] subMenu Menu <   ${subMenu}   >`);

    /** 
     * active ( main menu Open)
     * selected (submenu selected)
     * show ( current page )
     
    */
    let transSubmenuName = subMenu.replace(/\r\n|\n| |\s/gi,"");
    let submenuSelector ='li.active .slide a';
    let submenuEle =await Puppeteer.explicitlyWait(page,submenuSelector);
    if(submenuEle!==false && typeof submenuEle!=="boolean"){
      await submenuEle.click();
    }
    else{
      console.log(submenuEle);
      resolve("false");
    }
    // wait for page update 
    await page.waitForNavigation();

    /**
     * subMenu Click and Page Check 
     */
    let currentURL = await (await Puppeteer.getPage()).url();

    let errorSelector = 'div.page-body.error-box';

    let errorEle = await Puppeteer.explicitlyWait(page,errorSelector,1,1000);
    if(errorEle===false){
        resolve(currentURL);
    }
    else{
        resolve('FindConsoleErrorPage');
    };

  })
}
/**
 * goto Direct URL 
 * @param serviceUrl service FE URL
 */

export const navigateURL = async (serviceUrl : string ) =>{
  Logger.info(`navigate Service used Url ${serviceUrl}`);


}
/**
 * 
 * @param  {...any} param 
 * * page,element,actions,time,count,conditionCallback
 */

export const forcedClick = (...param:any[]) =>{
  return new Promise(async(resolve,reject)=>{
    let _page = param[0]; // page
    let _element = param[1]; // element
    let _actions = param[2] || 'Click Actions';  // actions
    let _time = typeof param[3] ==='function' ? 500 : param[3] || 500;   // time
    let _count = typeof param[4] ==='function' ? 3 : param[4]|| 3;    // count
    let conditionCallback = param[param.length-1];  // last conditioncallback
    let isCondition = 0 ;


    if(_element==="undefined" || 
    _element===undefined || 
    _element ==="null" || 
    _element===null
     ){ 
       //! element is NULL
       reject(false);
     }
    else{
      while(isCondition < _count){
        await _element.click();
        await _page.waitFor(_time);
        
        if(await conditionCallback()){
          Logger.info(`[🚧 Click-Success] ${_actions}`);
          isCondition = _count + 1;
        }
        else{
          Logger.error(`[🚧 Click-Fail] ${_actions}`);
          isCondition++;
        }
      }
      resolve(true);
    }
  })
}

/**
 * @param page : Puppeteer Page
 * @param selector : HTML Element querySelector
 * @param count : find count
 * @param time : loop time 
 */
export const explicitlyWait = async(
  page:puppeteer.Page,
  selector:string,
  count:number = 3,
  time:number = 2000,
): Promise<puppeteer.ElementHandle | boolean >  =>{
  let findElement:boolean | puppeteer.ElementHandle = false;
  let isCondition = 0;
  
  while(!findElement && (isCondition < count)) {
    findElement = await getSafetyElement(page,selector,time);
    ++isCondition;
  }
  return findElement;
}

export const explicitlyWaits = async(
  page:puppeteer.Page | puppeteer.ElementHandle,
  selector:string,
  count:number = 3,
  time:number = 2000,
) :Promise<puppeteer.ElementHandle[]| boolean> =>{
  let findElements:boolean | puppeteer.ElementHandle[] = false;
  let isCondition = 0;
  
  while(!findElements && (isCondition < count)) {
    findElements = await getSafetyElements(page,selector,time);
    ++isCondition;
  }
  return findElements;

}

export const explicitlyVisibleWait = async(
  page:puppeteer.Page,
  selector:string,
  count:number = 3,
  time:number = 2000,
): Promise<puppeteer.ElementHandle | boolean >  =>{
  let findElement:boolean | puppeteer.ElementHandle = false;
  let isCondition = 0;
  
  while(!findElement && (isCondition < count)) {
    findElement = await getSafetyVisibleElement(page,selector,time);
    ++isCondition;
  }
  return findElement;
}
const getSafetyVisibleElement = async(
  page:puppeteer.Page | puppeteer.ElementHandle,
  selector:string,
  time:number
)=>{
  try{
    let elementObj = await page.$(selector);
    if(elementObj===null){
      throw new Error('elementObj is NULL');
    }
    else if((await elementObj.isIntersectingViewport())===false){
      throw new Error('elementObj is not Visible');
    }
    else{
      Logger.debug(`[${selector}] is getVisibleElement Success`);
    }
    return elementObj;
  }
  catch(e){
    Logger.debug(`Find Element Visible Error is Selector > ${selector}`);
    Logger.debug(`${time} after Retry`);
    await waitTime(time);
    return false;
  }
}


function waitTime(time){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      resolve(true);
    },time);
  })
}
const getSafetyElements = async(
  page:puppeteer.Page | puppeteer.ElementHandle,
  selector:string,
  time:number,
)=>{
  try{
    let elementObj = await page.$$(selector);
    if(elementObj===null){
      throw new Error('elementObj is NULL');
    }
    else if(elementObj.length===0){
      throw new Error('elementObj is Length 0 ');
    }
    else{
      Logger.debug(`[${selector}] is getElements Success`);
    }
    return elementObj;
  }
  catch(e){
    
    Logger.debug(`Find Elements Error ${e.message} is Selector > ${selector}`);
    Logger.debug(`${time} after Retry`);
    await waitTime(time);
    return false;
  }
}

const getSafetyElement = async(
  page:puppeteer.Page | puppeteer.ElementHandle,
  selector:string,
  time:number
)=>{
  try{
    let elementObj = await page.$(selector);
    if(elementObj===null){
      throw new Error('elementObj is NULL');
    }
    else{
      Logger.debug(`[${selector}] is getElement Success`);
    }
    return elementObj;
  }
  catch(e){
    Logger.debug(`Find Element Error is Selector > ${selector}`);
    Logger.debug(`${time} after Retry`);
    // await page.waitFor(time);
    await waitTime(time);
    return false;
  }
}
export const getButton= async(
  page:puppeteer.Page,
  buttonName:string
)=>{

}

// export async function getButton(page: puppeteer.Page, buttonName: string) {
//   try {
//     const buttons = await page.$$('button.btn');
//     for (const button of buttons) {
//       if (await button.isIntersectingViewport()) {
//         const btnName: any = await(await button.getProperty('textContent')).jsonValue();
//         if (btnName.includes(buttonName)) {
//           return button;
//         }
//       }
//     }
//   } catch(e) {
//     console.log(e);
//     return false;
//   }
// }





export const getProps = async (
  page:puppeteer.Page | NullType | puppeteer.ElementHandle ,
  element:puppeteer.ElementHandle | NullType,
  props:string
) =>{
  const htmlAttribute = ["accept","accept-charset","accesskey","action","align","async",
  "autocomplete","autofocus","autoplay","bgcolor","border","charset","chehcked","cite",
  "class","color","cols","colspan","content","contenteditable","controls","coords","data","data-*","datetime",
  "default","defer","dir","dirname","disabled","download","draggable","enctype","for","form","formaction","headers",
  "height","hidden","high","href","hrefllang","http-equiv","id","innerText","innerHTML","ismap","kind","label","lang","list","loop","low","max",
  "maxlength","media","method","min","multiple","muted","name","novalidate","onabort","onafterprint","onbeforeprint",
  "onbeforeunload","onblur","oncanplay","oncanplaythrough","onchange","onclick","oncontextmenu","oncopy","oncuechange","oncut",
  "ondblclick","ondrag","ondragend","ondragenter","ondragleave","ondragstart","ondrop","ondurationchange","onemptied","onended","onerror",
  "onfocus","onhashchange","oninput","oninvalid","onkeydown","onkeypress","onkeyup","onload","onloadeddata","onloadedmetadata","onloadstart","onmousedown","onmousemove","onmouseout","onmouseover","onmouseup","onmousewhell","onoffline","ononline","onpagehide","onpageshow",
  "onpaste","onpause","onplay","onplaying","onpopstate","onprogress","onratechange","onreset","onresize","onscroll","onsearch","onseeked",
  "onselect","onstalled","onstorage","onsubmit","onsuspend","ontimeupdate","ontoggle","onunload","onvolumechange","onwaiting","onwheel",
  "open","optimum","pattern","placeholder","poster","preload","readonly","rel","require","reversed","rows","rowspan","sandbox","scope",
  "selected","shape","size","sizes","span","spellcheck","src","srcdoc","srclang","srcset","start","step","style","tabindex","textContent","target","title",
  "translate","type","usemap","value","width","wrap"];

  if(page===null || page ===undefined || page==="undefined"){
    Logger.error('[getProps] page is Undefined or NULL ');
    return false;
  }
  else if(props===null || props===undefined || props==="undefined"){
    Logger.error('[getProps] props is undefined or NULL');
    return false;
  }
  /* 
    else if(!isNULL(element)){ 
    TypeScript에서는  따로 함수로 빼게 되면 Object is possibly 'null' or 'undefined' 오류 발생 
  */
  else if(element==="undefined" || element===undefined || element ==="null" || element===null){
    Logger.error('[getProps] element is Undefined or NULL');
    return false;
  }

  let propertyHandle:puppeteer.JSHandle = await element.getProperty(props);
  let propertyValue:any = await propertyHandle.jsonValue();

  if(propertyValue==='' && props ==='innerHTML'){
    Logger.debug('innerHTML 의 빈값일 경우 outerHTML 로 한번 더 찾습니다.');
    propertyHandle = await element.getProperty('outerHTML');
    propertyValue = await propertyHandle.jsonValue();
  }
  else if(propertyValue==='' && props ==='innerText'){
    Logger.debug('innerText 의 빈값일 경우 textContents 로 다시 한번 더 찾습니다.');
    propertyHandle = await element.getProperty('textContents');
    propertyValue = await propertyHandle.jsonValue();
  }
  return props==='className' ? "."+propertyValue.replace(/\s/gi,".") : propertyValue;
};


const initialize = async ({isHeadless = false, isDebug = true })=>{
    // * Code for executing request module with DEPREECATED
    // * Needed when using cloudscraper .
    // * https://github.com/nodejs/help/issues/1936#issuecomment-565482178
    require('tls').DEFAULT_MIN_VERSION = 'TLSv1'
    
    if (isDebug) {
      Logger.debug(`🚧  Initial run in progress...`)
      Logger.debug(`🚧  Starting Headless Chrome...`)
      Logger.debug(`🚧  You can exit with Ctrl+C at any time.\n`)
    }

    try {
      const args = [
          // ! 해당 window-position 을 주게 되면 0.0 위치가 생기기 때문에
          // ! --start-maximized 가 동작하지않음 
          // '--window-position=0,0',
          // '--window-size=1920,1080',
          '--start-maximized',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--ignore-certifcate-errors',
          '--ignore-certifcate-errors-spki-list',
          // "--start-fullscreen", -> F11 눌렀을때의 스크린 
          // '--start-maximized'  동작안되서 pass
          // '--disable-headless-mode'
          // '--lang=ko-KR',
      ];

      const options = {
          args,
          headless: isHeadless,
          ignoreHTTPSErrors: true,
          userDataDir: './tmp',
          defaultViewport:null
      }

      const browser = await puppeteerExtra.launch(options)
      if (isDebug) Logger.debug(`🚧  Headless Chrome has been started.`)

      // @ts-ignore
      puppeteerExtra.setMaxListeners = () => { }

      // * Apply the stealth plug-in.
      puppeteerExtra.use(stealthPlugin())
      return browser;
  } catch (e) {
      if (isDebug) {
          Logger.debug(`🚧  Error occurred during headless chrome operation.`)
          Logger.debug(e)
      }
  }
 return undefined;
}


/**
 * 
 * @param page 
 * @param targetUrl 
 * @param options 
 */


/**
 * * Go to that page using puppeteer.
 * * (with stealth mode applied)
 */
export const goto = async (
  page: puppeteer.Page,
  targetUrl: string,
  options: {
      waitUntil: string[],
      isDebug: boolean,
      timeout: number,
  } = {
          waitUntil: ['load', 'networkidle0'],
          isDebug: true,
          timeout: 10000, 
      },
) => {
  try {
      // * Get the imitation cookies.
      const hookHeaders: any = await getImitationCookie(targetUrl)
      await page.setRequestInterception(true)

      // * Anti Cloud Flare
      page.on('request', (request) => request.continue(hookHeaders))

      await page.goto(targetUrl, {
          // @ts-ignore
          waitUntil: options.waitUntil,
          timeout: options.timeout,
      })
      return true;
  } catch (e) {
      if (options.isDebug) {
          Logger.debug('🚧 An error occurred while connecting to the page.')
          Logger.debug('🚧 After 5 seconds, try accessing the page again.')
          Logger.debug(`🚧 Page with error: ${targetUrl}\n`)
          Logger.debug(e);
      }

      await page.waitFor(5000);
      return false
  }
}

/**
 * * Makes cookies look real.
 */
export const getImitationCookie = (url:string) => {
  return new Promise((resolve, reject) =>
      // @ts-ignore
      cloudscraper.get(url, (error, response, body) => {
          if (error) {
              reject(error)
          } else {
              resolve(response.request.headers)
          }
      })
  )
}



/**
 * not Used Function
 */

/** TS is not Used Function  */
function isNULL(element:puppeteer.ElementHandle | NullType ){
  if(element==="undefined" || element===undefined || element ==="null" || element===null){
    return false;
  }
  else{
    return element;
  }
}











