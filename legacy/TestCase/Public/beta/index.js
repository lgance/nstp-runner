const uirunner = require('../../../ui-runner/index');
const { implicitlyWait}  = require('@utils');

function PRTC (){};


PRTC.server = async function(){
  try{
    await uirunner.run('PU');

    // await implicitlyWait(5500);

    // await uirunner.lnbSelect('Server','Server');

    // await uirunner.lnbSelect('Server','Bare Metal Server');

    const url = ''
    const url2='';
    await uirunner.createACG(url2);

    // await uirunner.navigate(url);

    await uirunner.puppeteerClose();
  }
  catch(err){
    console.log('PRTC server Functions');
    console.error(err);
    await uirunner.puppeteerClose();
  }
}

module.exports = PRTC;