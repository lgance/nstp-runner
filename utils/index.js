
exports.implicitlyWait = (timeout)=>{
  return new Promise((resolve)=>{
      setTimeout(()=>{
        resolve();
      },timeout);
  })
};

exports.strMasking = (type,password)=>{
  return password.split('').reduce((prev,curr,index,arr)=>{
    if(index < 5){return prev+curr;}
    else{return prev+'*'};
  },"");
}

exports.explicitlyWait = async(selector,time)=>{
  return new Promise((resolve,reject)=>{
    
  });
}

