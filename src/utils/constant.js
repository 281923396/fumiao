let urlParams = new URLSearchParams(window.location.search);
let sid = urlParams.get('sid');
let moduleId = urlParams.get('moduleId');

const Config = {
    Sid: sid,
    ModuleId: moduleId,
    BaseUrl: "https://cloud.feymer.com/bpmdevportal",
    // BaseUrl: "https://cloud.feymer.com/bpm",
}

export default Config;
