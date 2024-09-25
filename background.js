chrome.runtime.onInstalled.addListener(() => {
  console.log('youtube字幕君插件已安装');
});

let summary_key = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setSummaryKey') {
    summary_key = request.summaryKey;
    console.log('Summary key set:', summary_key);
  }
  // ... 其他消息处理 ...
});