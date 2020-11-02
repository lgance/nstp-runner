import puppeteer from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import cloudscraper  from 'cloudscraper';

import { Logger } from './';



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
 * 
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
export const explicitlyWait = async(
  page:puppeteer.Page,
  selector:string,
  count:number = 3,
  time:number = 2000,
) =>{
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
) =>{
  let findElements:boolean | puppeteer.ElementHandle[] = false;
  let isCondition = 0;
  
  while(!findElements && (isCondition < count)) {
    findElements = await getSafetyElements(page,selector,time);
    ++isCondition;
  }
  return findElements;

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
    else{
      Logger.debug(`[${selector}] is getElement Success`);
    }
    return elementObj;
  }
  catch(e){
    
    Logger.debug(`Find Elements Error is Selector > ${selector}`);
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
    console.error('[getProps] page is Undefined or NULL ');
    return false;
  }
  else if(props===null || props===undefined || props==="undefined"){
    console.error('[getProps] props is undefined or NULL');
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
    Logger.info('innerHTML 의 빈값일 경우 outerHTML 로 한번 더 찾습니다.');
    propertyHandle = await element.getProperty('outerHTML');
    propertyValue = await propertyHandle.jsonValue();
  }
  else if(propertyValue==='' && props ==='innerText'){
    Logger.info('innerText 의 빈값일 경우 textContents 로 다시 한번 더 찾습니다.');
    propertyHandle = await element.getProperty('textContents');
    propertyValue = await propertyHandle.jsonValue();
  }
  return props==='className' ? "."+propertyValue.replace(/\s/gi,".") : propertyValue;
};

/** TS is not Used Function  */
function isNULL(element:puppeteer.ElementHandle | NullType ){
  if(element==="undefined" || element===undefined || element ==="null" || element===null){
    return false;
  }
  else{
    return element;
  }
}

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
