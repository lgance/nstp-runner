import {
  Logger,
  paramValidator,
  LoginConsole
} from './utils';

import {
  PUB_REAL,PUB_BETA
} from './app';

const main = async ()=>{
  try{
    const TestConsole:string = paramValidator();
    /*
     Safety Navigate Console
    */
    await LoginConsole();

    switch(TestConsole.toUpperCase()){
      case 'PUB_BETA':
        await PUB_BETA();
        break;
      case 'PUB_REAL':
        console.log(PUB_REAL);
        break;
      case 'FIN_REAL':

        break;
      case 'FIN_BETA':

        break;
      default:
          Logger.info('Non Selected TestConsole');
        return;
    }
  }
  catch(err){
    Logger.error(err);
    process.exit(1);
  }
}
main();


// const main = async () => {
//   const browser = await Puppeteer.getBrowser({ isHeadless: false })
//   if (browser) {
//       // const page = await browser.newPage()
//       const context = await browser.createIncognitoBrowserContext();

//       const page = await context.newPage();

//       // * An example of crawling a page with CloudFlare applied.
//       Logger.debug('🚧  Crawling in progress...')

//       // const url = 'https://namu.wiki/w/Cloudflare'
//       // const url = `http:console.ncloud.com`;
//       const url = 'https://console.ncloud.com/';
//       await Puppeteer.goto(page, url)
//       await page.screenshot({ path: 'example.png' })

//       Logger.debug('🚧  Crawling is complete.')
//       Logger.debug('🚧  Exit the Puppetier...')
//       browser.close()
//   }
// }

// main()
