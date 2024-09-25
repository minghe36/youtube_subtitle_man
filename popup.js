document.addEventListener('DOMContentLoaded', function() {
  const apiKeyTranscriptInput = document.getElementById('apiKeyTranscript');
  const apiKeySummaryInput = document.getElementById('apiKeySummary');
  const saveButton = document.getElementById('save');
  const messageDiv = document.getElementById('message');
  const generateSummaryButton = document.getElementById('generateSummary');

  // 加载保存的API keys
  chrome.storage.sync.get(['apiKeyTranscript', 'apiKeySummary'], function(result) {
    apiKeyTranscriptInput.value = result.apiKeyTranscript || '';
    apiKeySummaryInput.value = result.apiKeySummary || '';
  });

  saveButton.addEventListener('click', function() {
    const apiKeyTranscript = apiKeyTranscriptInput.value.trim();
    const apiKeySummary = apiKeySummaryInput.value.trim();

    chrome.storage.sync.set({
      apiKeyTranscript: apiKeyTranscript,
      apiKeySummary: apiKeySummary
    }, function() {
      messageDiv.textContent = '保存成功！';
      
      // 将summary_key设置到background.js中
      chrome.runtime.sendMessage({
        action: 'setSummaryKey',
        summaryKey: apiKeySummary
      });
    });
  });

  generateSummaryButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "generateSummary"});
    });
    messageDiv.textContent = '正在生成中文总结...';
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "summaryGenerated") {
    document.getElementById('message').textContent = "中文总结已生成!";
    setTimeout(() => {
      document.getElementById('message').textContent = "";
    }, 3000);
  }
});