let urlParams = new URLSearchParams(window.location.search);
let sid = urlParams.get('sid');
let moduleId = urlParams.get('moduleId');

export const Sid = sid;
export const ModuleId = moduleId;


// 测试环境地址
export const Domain = "https://cloud.feymer.com/bpmdevportal";

//生产环境地址
// export const Domain = "https://cloud.feymer.com/bpm";  
