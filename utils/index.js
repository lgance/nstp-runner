let cloudscraper = require('cloudscraper');
let scraper = cloudscraper;

// 명시적 대기 
exports.implicitlyWait = (timeout)=>{
  return new Promise((resolve)=>{
      setTimeout(()=>{
        resolve();
      },timeout);
  })
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

// 암시적 대기 
exports.explicitlyWait = async(selector,time)=>{
  return new Promise((resolve,reject)=>{
    // To do 
    
  });
}

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


exports.saftyNavigate = async (
  page,
  navigateUrl,
  waitCode = 'networkidle0'
) =>{
  let isSuccess = false;
  while (!isSuccess) isSuccess = await navigatePage(page, navigateUrl, waitCode)
};


