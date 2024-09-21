document.addEventListener('DOMContentLoaded', function() {
  var apiKeyInput = document.getElementById('apiKey');
  var saveButton = document.getElementById('save');
  var message = document.getElementById('message');

  // 加载保存的设置
  chrome.storage.sync.get(['difyApiKey'], function(items) {
    apiKeyInput.value = items.difyApiKey || '';
  });

  saveButton.addEventListener('click', function() {
    var apiKey = apiKeyInput.value;
    chrome.storage.sync.set({
      difyApiKey: apiKey
    }, function() {
      message.textContent = '设置已保存';
      setTimeout(function() {
        message.textContent = '';
      }, 750);
    });
  });
});

// 以下是原有的功能，暂时注释掉，如果之后需要可以重新启用
/*
document.getElementById('generate').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "generateSubtitle"});
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "subtitleGenerated") {
    document.getElementById('result').textContent = "中文文稿已生成!";
  }
});
*/