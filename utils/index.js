'use strict';

let cloudscraper = require('cloudscraper');
let scraper = cloudscraper;


/** Helper Function  */

// scrape Initialize
async function scrapeCloudflareHttpHeaderCookie(url){
  new Promise((resolve, reject) =>
      scraper.get(url, function(error, response, body) {
          if (error) {
              reject(error)
          } else {
              resolve(response.request.headers)
          }
      })
  )
}



async function getSafetyElement(page,selector,time){
  try{
    let elementObj = await page.$(selector);

    if(elementObj===null){
      throw new Error('elementObj is NULL');
    }
    else{
      console.log(`[${selector}] is Success`);
    }
    return elementObj;
  }
  catch(e){
    console.log(`Find Element Error is Selector > ${selector}`);
    console.log(`${time} after Retry`);
    await page.waitFor(time);
    return false;
  }
}


async function getSafetyElements(page,selector,time){
  try{
    let elementObj = await page.$$(selector);

    if(elementObj===null){
      throw new Error('elementObj is NULL');
    }
    else{
      console.log(`[${selector}] is Success elements `);
    }

    return elementObj;
  }
  catch(e){
    console.log(`Find Element Error is Selector > ${selector}`);
    console.log(`${time} after Retry`);
    await page.waitFor(time);
    return false;
  }
}


/** Module Exports */

exports.getProps = async (page,element,props)=>{
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
  else if(!this.isNULL(element)){
    console.error('[getProps] element is Undefined or NULL')
    return false;
  }


  let propertyHandle = await element.getProperty(props);
  let propertyValue = await propertyHandle.jsonValue();

  if(propertyValue==='' && props ==='innerHTML'){
    console.log('innerHTML 의 빈값일 경우 outerHTML 로 한번 더 찾습니다.');
    propertyHandle = await element.getProperty('outerHTML');
    propertyValue = await propertyHandle.jsonValue();
  }
  else if(propertyValue==='' && props ==='innerText'){
    console.log('innerText 의 빈값일 경우 textContents 로 다시 한번 더 찾습니다.');
    propertyHandle = await element.getProperty('textContents');
    propertyValue = await propertyHandle.jsonValue();
  }

  return props==='className' ? "."+propertyValue.replace(/\s/gi,".") : propertyValue;
}



exports.implicitlyWait = (timeout)=>{
  return new Promise((resolve)=>{
      setTimeout(()=>{
        resolve();
      },timeout);
  })
};
exports.explicitlyWait = async(
  page,
  selector,
  count,
  time
) => {
  let isSuccess = false;
  let _time = time || 2000;
  let _cnt = count || 3;
  let isCondition = 0;

  if(typeof selector===undefined  && typeof selector==="undefined"){
    return isSuccess;
  }
  while(!isSuccess && (isCondition < _cnt) ) {
    isSuccess = await getSafetyElement(page,selector,_time);
    if(isSuccess!==false){
        isCondition = _cnt + 1;
    }
    ++isCondition;
  }
  return isSuccess;
};

exports.explicitlyWaits = async(
  page,
  selector,
  count,
  time
) => {
  let isSuccess = false;
  let _time = time || 2000;
  let _cnt = count || 3;
  let isCondition = 0;

  while(!isSuccess && (isCondition < _cnt) ) {
    isSuccess = await getSafetyElements(page,selector,_time);
    if(isSuccess!==false){
        isCondition = 50;
    }
    ++isCondition;
  }
  return isSuccess;
};

/**
 * @description Not Implementation
 * @param {*} page 
 * @param {*} selector 
 * @param {*} forced 
 */




/**
 * 
 * @param  {...any} param 
 * * page,element,actions,time,count,conditionCallback
 */
exports.forcedClick = async(...param)=>{
  try{
    let _page = param[0]; // page
    let _element = param[1]; // element
    let _actions = param[2] || 'Click Actions';  // actions
    let _time = typeof param[3] ==='function' ? 500 : param[3] || 500;   // time
    let _count = typeof param[4] ==='function' ? 3 : param[4]|| 3;    // count
    let conditionCallback = param[param.length-1];  // last conditioncallback
    let isCondition = 0 ;

    if(this.isNULL(_element)){
      while(isCondition < _count){
        await _element.click();
        await _page.waitFor(_time);
        
        if(await conditionCallback()){
          console.log(`[🚧 Click Success] ${_actions}`);
          isCondition = _count + 1;
        }
        else{
          console.log(`[🚧 Click Fail] ${_actions}`);
          isCondition++;
        }
      }
    }
    else{
      // element is NULL
      return false;
    }

    // let isSuccess = false;
    // let _time = time || 2000;
    // let _cnt = count || 3;
    // let isCondition  = 0 ;

    // while(!isSuccess && (isCondition < _cnt) ) {
    //   let result = await nextChangeBtn.click();

    //   //  isSuccess;
      
    //   if(isSuccess!==false){
    //       isCondition = 50;
    //   }
    //   ++isCondition;
    // }
    // return isSuccess;
  }
  catch(err){console.error(err);}
}
exports.safetyNavigate = async (
  page,
  navigateUrl,
  waitCode = 'networkidle0'
) => {
  try{
    let isSuccess = false;
    while (!isSuccess) isSuccess = await navigatePage(page, navigateUrl, waitCode)
  }
  catch(e){console.log(e);}
};



async function navigatePage( page, naviagteUrl, waitCode){
  try{
    let hookHeaders = await scrapeCloudflareHttpHeaderCookie(naviagteUrl);
    // Anti Cloud Flare
    await page.setRequestInterception(true)
    page.on('request', request => {
        const headers = request.headers()
        request.continue({ ...hookHeaders })
    })

    // @ts-ignore
    await page.goto(naviagteUrl, {
        waitUntil: ['load', waitCode],
    })

    return true;
  }
  catch(e){
    console.log('Navigate Error ');
    console.log('After 5s Retry ');
    console.log(`Error URL ${naviagteUrl}`);
    console.log(e);
    await page.waitFor(5000);
    
    return false;
  }
};


exports.isNULL = (element)=>{
  try{
    if(element==="undefined" || element===undefined || element ==="null" || element===null){
      return false;
    }
    else{
      return element;
    }
}
catch(err){console.error(e);}

}

// 비밀번호 마스킹 default : password 
exports.strMasking = (password,type)=>{
  if(typeof type!=="undefined"){

  }
  else{
    return password.split('').reduce((prev,curr,index,arr)=>{
      if(index < 5){return prev+curr;}
      else{return prev+'*'};
    },"");
  }
}



/**
 * ! Deprecated    This Function used in Test Runner 
 */
exports.dimmedCheckAndCloseAction = async () => {
  function getTextEle(e,trimCondition){
    let eleText = e.textContent === undefined ?  
              (e.innerText===undefined ? false : e.innerText    )
           : e.textContent;
    if(trimCondition===true){return eleText.replace(/\r\n|\n| |\s/gi,"");}
    else{return eleText;}
  }
  function checkDimmedClose(){
    setTimeout(()=>{
      if(document.querySelector('.coach-mark') === null){
          console.warn('🚧 Dimmed Close ');    
      }
      else{
          console.warn('🚧 Dimmed Not Close');
          // dimmed Close Exception   do Something
      }
    },1000);
  }
  function consoleDimmedCheck(){
   let dimmedEle = document.querySelector('.coach-mark');
   let dimmedCheck = dimmedEle === null ? false : true ;
  
   if(dimmedCheck){
     let diText = dimmedEle.innerText;
     let regex = /환영합니다.|님,|다시 보지 않기/gi;
     if(regex.test(diText)===true){
      console.warn("🚧 Dimmed is output and Close Window.");
      let dimmedBtnArr = dimmedEle.querySelectorAll('.btn');
      let dimmedCloseBtn = Array.prototype.filter.call(dimmedBtnArr,(item,index,arr)=> /닫기/gi.test(getTextEle(item,true)))[0];
       dimmedCloseBtn.click();
     }
   }
   else{
     console.warn('🚧 Dimmed was not output .Process to the next Step .');
     return false;
   }
  }



  
  consoleDimmedCheck();
  checkDimmedClose();   
}