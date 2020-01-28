



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

