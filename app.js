require('dotenv').config();
require('module-alias/register');
const testRunner = require('./runner');

testRunner.run();

// const testRunner = async () =>{
//     try{
//         const browser = await puppeteer.launch(puppeteerOptions);
//         const page = await browser.newPage();
       
//         await page.goto('https://console.ncloud.com',{waitUntil:'networkidle2'});

//         /* Dash Board  */
//         // await navigateDashBoard("Server",page);
//         console.log(await page.url());
//         await page.waitFor(5000);
//         await page.close();
//         await browser.close();
//     }
//     catch(err){
//         console.log(err);
//         process.exit(1);
//     }
// }
// // testRunner();

// async function automationLogin(object,page){
//     try{
//         await page.waitForSelector('input[id=username]');
//         await page.click('input[id=username]');
//         await page.type('input[id=username]',object.id);
//         await page.type('input[type=password]',object.pw);
//         await page.keyboard.press('Enter');
//         // await page.click('.btn.lg.point.wf.mt-8.mb-15');

//         let nextChangeStr = 'article.loginSecure button.btn.lg.point';

//         console.log('네비게이터 시작');
     

//         console.log('네비게이터 끝');
//         let handleElement = await page.waitForSelector(nextChangeStr,{visible:true});

//         let getText = await getTextEle(handleElement);
        
//         console.log(getText);

        
//         await handleElement.click();

        
//     }
//     catch(err){
//         console.log('로그인 ');
//         console.log(err);
//     }
// }
// async function navigateDashBoard(service,page){
//     try{
//         console.log('[navigateDashBoard]');
//         let welcomeBtn = await page.waitForSelector('.welcome-close',{visible:true,timeout:2000});
//         await welcomeBtn.click();
//         // await ServerPage(page);
//     }
//     catch(err){
//         console.log('[navigateDashBoard]');
//         console.log(err);
//     }
// }
// async function ServerPage(page){
//     try {
//         console.log('Server Page');
//         await page.waitForSelector('.btn-wrap',{visible:true});
//         await wait(2000);
//         let btnArr = await page.$$('.btn-wrap button');

//         for await (const btn of btnArr){
//              console.log(btn.innerText);
//         }

//         // await btnArr.forEach(async(item,index)=>{
//         //     let jsHandle = await item.getProperty('innerText');
//         //     let getText = await jsHandle.jsonValue();
//         //     if(getText.replace(/ /gi,'')==='서버생성'){
//         //         // 서버 생성 버튼
//         //         console.log(getText);
//         //         await item.click();
//         //     }
//         //     return '';
//         // });


//     } catch (error) {
//         console.error('[Server Page]');
//         console.log(error);
//     }
// }


// async function isLocatorReady(element, page) {
//     const isVisibleHandle = await page.evaluateHandle((e) => 
//   {
//       const style = window.getComputedStyle(e);
//       return (style && style.display !== 'none' && 
//       style.visibility !== 'hidden' && style.opacity !== '0');
//    }, element);
//     var visible = await isVisibleHandle.jsonValue();
//     const box = await element.boxModel();
//     if (visible && box) {
//       return true;
//     }
//     return false;
//   }

// async function getTextEle(ele){
//   let jsHandle = await ele.getProperty('innerText');
//   let getText = await jsHandle.jsonValue();
//   return getText;
// }

