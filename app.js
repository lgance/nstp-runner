require('dotenv').config();
require('module-alias/register');

const PRTC = require('./TestCase/Public/beta');

// ? param - target Image -> Sanity Test Start
// ! default Centos
PRTC.server();


/*
  TODO .env Sample 
  !ID=[myNcloudID]
  !PW=[myNcloudPW]
  ?target='pu'
  ?FIN=''
  ?FIN_BETA=''
  ?GOV=''
  ?GOV_BETA=''
  ?PU='https://console.ncloud.com/'
  ?PU_BETA=''
 */

