let urlParams = new URLSearchParams(window.location.search);
let sid = urlParams.get('sid');
let moduleId = urlParams.get('moduleId');

export const Domain = "https://cloud.feymer.com/bpmdevportal";
// export const Domain = "https://cloud.feymer.com/bpm";
export const Sid = sid;
export const ModuleId = moduleId;