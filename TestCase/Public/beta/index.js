const uirunner = require('../../../ui-runner/index');
const { implicitlyWait}  = require('@utils');

function PRTC (){};


PRTC.server = async function(){
  try{
    await uirunner.run('pb');


    
    await implicitlyWait(5500);
    await uirunner.puppeteerClose();
  }
  catch(err){console.error(err);}
}

module.exports = PRTC;