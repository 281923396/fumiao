let urlParams = new URLSearchParams(window.location.search);
let sid = urlParams.get('sid');
let moduleId = urlParams.get('moduleId');
let baseUrl = '';

// 要匹配的前缀
const prefix = 'https://cloud.feymer.com/bpm/';

// 判断当前页面 URL 是否以此开头
const isMatch = window.location.href.startsWith(prefix);

if (isMatch) {
  baseUrl = 'https://cloud.feymer.com/bpm/';
} else {
  baseUrl = 'https://cloud.feymer.com/bpmdevportal/';
}

const Config = {
    Sid: sid,
    ModuleId: moduleId,
    BaseUrl: baseUrl,
}

export default Config;
