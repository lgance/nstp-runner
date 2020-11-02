
import * as cloudscraper from 'cloudscraper';
import * as puppeteer from 'puppeteer';


type NullType = null | undefined | 'undefined';

class Util {
  private scraper:any;

  constructor(){
    this.scraper = cloudscraper;
  }

  public async getSafetyElement(page:puppeteer.Page,selector:string,time:number){
    try{
      let elementObj:puppeteer.ElementHandle | null = await page.$(selector);
  
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

public async getSafetyElements(page:puppeteer.Page,selector:string,time:number){
    try{
      let elementObj:puppeteer.ElementHandle[] | null = await page.$$(selector);
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

  public async getProps(page:puppeteer.Page|NullType,element:puppeteer.ElementHandle,props:string){
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

    if(page===null || page === undefined || page==="undefined"){
      console.error('[getProps] page is Undefined or NULL ');
      return false;
    }
    else if(props===null || props===undefined || props==="undefined"){
      console.error('[getProps] props is undefined or NULL');
      return false;
    }
    else if(!this.isNull(element)){
      console.error('[getProps] element is Undefined or NULL')
      return false;
    }
  
    let propertyHandle:puppeteer.JSHandle = await element.getProperty(props);
    let propertyValue:any = await propertyHandle.jsonValue();
  
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

  private isNull(element:any){
    try{
      if(element==="undefined" || element===undefined || element ==="null" || element===null){
        return false;
      }
      else{
        return element;
      }
    }
    catch(err){console.error(err);}
  }

  public async scrapeCloudflareHttpHeaderCookie(url:string){
    new Promise((resolve, reject) =>
        this.scraper.get(url, function(error:any, response:any, body:any) {
            if (error) {
                reject(error)
            } else {
                resolve(response.request.headers)
            }
        })
    )
  }
}

export default Util;