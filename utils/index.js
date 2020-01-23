
exports.wait = (timeout)=>{
  return new Promise((resolve)=>{
      setTimeout(()=>{
        resolve();
      },timeout);
  })
};

exports.loginCheck = async (page)=>{

  const result = await page.evaluateHandle(()=> {
      let result = document.querySelector("input[placeholder=아이디]");
      return result;
  });
  console.log(result._context._client._sessionId);

};




