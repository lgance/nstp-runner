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

async function getSafetyElement(page,selector,time){
  try{
    let elementObj = await page.$(selector);

    if(elementObj===null){
      throw new Error('elementObj is NULL');
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
  let propertyHandle = await element.getProperty(props);
  let propertyValue = await propertyHandle.jsonValue();

  if(propertyValue==='' && props ==='innerHTML'){
    console.log('innerHTML 의 빈값일 경우 outerHTML 로 한번 더 찾습니다.');
    propertyHandle = await element.getProperty('outerHTML');
    propertyValue = await propertyHandle.jsonValue();
  }

  return propertyValue;
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

  while(!isSuccess && (isCondition < _cnt) ) {
    isSuccess = await getSafetyElement(page,selector,_time);
    if(isSuccess!==false){
        isCondition = 50;
    }
    ++isCondition;
  }
  return isSuccess;
};

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
