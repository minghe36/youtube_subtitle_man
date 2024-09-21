// 等待页面加载完成
window.addEventListener('load', () => {
  setTimeout(initializeInterface, 2000); // 2秒延迟
});

function initializeInterface() {
  if (window.location.hostname === 'www.youtube.com' && window.location.pathname.startsWith('/watch')) {
    const targetContainer = document.getElementById('secondary-inner');
    if (targetContainer) {
      const transcriptInterface = createTranscriptInterface();
      targetContainer.insertBefore(transcriptInterface, targetContainer.firstChild);
      
      // 检查并加载缓存的字幕
      const videoId = new URLSearchParams(window.location.search).get('v');
      loadCachedSubtitles(videoId);
    }
  }
}

// 添加新函数来加载缓存的字幕
async function loadCachedSubtitles(videoId) {
  const cachedSubtitles = await getCachedSubtitles(videoId);
  if (cachedSubtitles) {
    const contentContainer = document.getElementById('youtube_subtitle_man_content');
    const resultArea = document.getElementById('transcript-result');
    
    contentContainer.innerHTML = '';
    cachedSubtitles.forEach(subtitle => {
      addSubtitleToContainer(subtitle, videoId, contentContainer);
    });
    
    resultArea.textContent = '已加载缓存的中文文稿';
    setTimeout(() => {
      resultArea.textContent = '';
    }, 3000);
  }
}

function createTranscriptInterface() {
  const transcriptInterface = document.createElement('div');
  transcriptInterface.id = 'yt-subtitle-interface';
  transcriptInterface.style.padding = '10px';
  transcriptInterface.style.marginBottom = '10px';
  transcriptInterface.style.backgroundColor = '#f9f9f9';
  transcriptInterface.style.borderRadius = '4px';

  const title = document.createElement('h3');
  title.textContent = 'YouTube字幕君';
  title.style.fontSize = '16px';
  title.style.marginBottom = '10px';

  const generateButton = document.createElement('button');
  generateButton.textContent = '生成中文文稿';
  generateButton.style.background = 'linear-gradient(to right, #ff416c, #ff4b2b)';
  generateButton.style.border = 'none';
  generateButton.style.color = 'white';
  generateButton.style.padding = '10px 20px';
  generateButton.style.fontSize = '14px';
  generateButton.style.borderRadius = '4px';
  generateButton.style.cursor = 'pointer';

  // 创建复制文稿按钮
  const copyButton = document.createElement('button');
  copyButton.textContent = '复制文稿';
  copyButton.style.background = '#1a73e8'; // 设置为蓝色
  copyButton.style.border = 'none';
  copyButton.style.color = 'white';
  copyButton.style.padding = '10px 20px';
  copyButton.style.fontSize = '14px';
  copyButton.style.borderRadius = '4px';
  copyButton.style.cursor = 'pointer';
  copyButton.style.marginLeft = '10px';

  // 创建复选框和标签
  const hideTimeCheckbox = document.createElement('input');
  hideTimeCheckbox.type = 'checkbox';
  hideTimeCheckbox.id = 'hide-time-checkbox';
  hideTimeCheckbox.style.marginLeft = '10px';

  const hideTimeLabel = document.createElement('label');
  hideTimeLabel.htmlFor = 'hide-time-checkbox';
  hideTimeLabel.textContent = '隐藏时间';
  hideTimeLabel.style.fontSize = '14px';
  hideTimeLabel.style.marginLeft = '5px';

  // 创建一个容器来放置按钮和复选框
  const controlsContainer = document.createElement('div');
  controlsContainer.style.display = 'flex';
  controlsContainer.style.alignItems = 'center';
  controlsContainer.appendChild(generateButton);
  controlsContainer.appendChild(copyButton);  // 添加复制按钮
  controlsContainer.appendChild(hideTimeCheckbox);
  controlsContainer.appendChild(hideTimeLabel);

  // 创建一个容器来放置按钮和复选框
  const resultArea = document.createElement('div');
  resultArea.id = 'transcript-result';
  resultArea.style.marginTop = '10px';
  resultArea.style.fontSize = '12px';
  resultArea.style.height = '24px';  // 添加这行
  resultArea.style.lineHeight = '24px';  // 添加这行，使文本垂直居中
  resultArea.style.overflow = 'hidden';  // 添加这行，防止内容溢出

  const contentContainer = document.createElement('div');
  contentContainer.id = 'youtube_subtitle_man_content';
  contentContainer.style.padding = '10px';
  contentContainer.style.backgroundColor = '#fff';
  contentContainer.style.border = '1px solid #ddd';
  contentContainer.style.borderRadius = '4px';
  contentContainer.style.maxHeight = '300px';
  contentContainer.style.overflowY = 'auto';
  contentContainer.style.fontSize = '14px';  // 添加这行
  contentContainer.style.lineHeight = '1.5';  // 添加这行

  generateButton.addEventListener('click', () => handleGenerateClick(resultArea, contentContainer));
  copyButton.addEventListener('click', () => handleCopyClick(contentContainer, resultArea));  // 添加复制按钮的点击事件

  // 添加复选框的事件监听器
  hideTimeCheckbox.addEventListener('change', () => {
    const timestamps = document.querySelectorAll('.youtube_subtitle_man__timestamp');
    timestamps.forEach(timestamp => {
      timestamp.style.display = hideTimeCheckbox.checked ? 'none' : 'inline';
    });
  });

  transcriptInterface.appendChild(title);
  transcriptInterface.appendChild(controlsContainer);
  transcriptInterface.appendChild(resultArea);
  transcriptInterface.appendChild(contentContainer);

  return transcriptInterface;
}

async function handleGenerateClick(resultArea, contentContainer) {
  resultArea.textContent = '正在获取视频信息...';
  contentContainer.textContent = '';
  try {
    const videoId = new URLSearchParams(window.location.search).get('v');
    const cachedSubtitles = await getCachedSubtitles(videoId);
    
    if (cachedSubtitles) {
      resultArea.textContent = '正在加载缓存的中文文稿...';
      cachedSubtitles.forEach(subtitle => {
        addSubtitleToContainer(subtitle, videoId, contentContainer);
      });
      resultArea.textContent = '已加载缓存的中文文稿';
    } else {
      const { title, captionUrl } = await getVideoInfo();
      if (captionUrl) {
        resultArea.textContent = '正在获取字幕内容...';
        const caption = await getCaptions(captionUrl);
        resultArea.textContent = '正在生成中文文稿...';
        contentContainer.textContent = '正在调用API生成中文文稿...';
        await generateChineseTranscript(title, caption, contentContainer);
      } else {
        resultArea.textContent = '未找到英文字幕';
        contentContainer.textContent = '无法生成中文文稿';
      }
    }
  } catch (error) {
    resultArea.textContent = '获取信息失败';
    contentContainer.textContent = error.message;
  }
  
  setTimeout(() => {
    resultArea.textContent = '';
  }, 3000);
}

// 添加新的函数来处理复制功能
function handleCopyClick(contentContainer, resultArea) {
  const subtitleItems = contentContainer.querySelectorAll('.youtube_subtitle_man_item');
  if (subtitleItems.length === 0) {
    resultArea.textContent = '没有可复制的文稿内容';
    return;
  }

  let fullText = '';
  subtitleItems.forEach(item => {
    const textElement = item.querySelector('.youtube_subtitle_man_text');
    if (textElement) {
      fullText += textElement.textContent.trim() + ' ';
    }
  });

  // 去除多余的空格
  fullText = fullText.replace(/\s+/g, ' ').trim();

  // 复制到剪贴板
  navigator.clipboard.writeText(fullText).then(() => {
    resultArea.textContent = '文稿已复制到剪贴板';
    setTimeout(() => {
      resultArea.textContent = '';
    }, 3000);
  }, (err) => {
    console.error('无法复制文本: ', err);
    resultArea.textContent = '复制失败,请重试';
  });
}

// 修改 generateChineseTranscript 函数以保存生成的字幕
async function generateChineseTranscript(title, caption, contentContainer) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    contentContainer.textContent = '请先在插件设置中配置Dify API Key';
    return;
  }

  const videoId = new URLSearchParams(window.location.search).get('v');
  console.log('Calling Dify API...');
  const response = await fetch('https://api.dify.ai/v1/workflows/run', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: { caption, title },
      response_mode: "streaming",
      user: "45eb62c1-5a56-4f4e-9ee0-745deb67675e"
    })
  });

  const reader = response.body.getReader();
  let accumulatedData = '';
  let currentSubtitle = { text: '', start: null, dur: null };
  
  contentContainer.innerHTML = ''; // 清空容器

  const generatedSubtitles = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = new TextDecoder().decode(value);
    console.log('Received chunk:', chunk);
    accumulatedData += chunk;
    
    let newlineIndex;
    while ((newlineIndex = accumulatedData.indexOf('\n')) !== -1) {
      const line = accumulatedData.slice(0, newlineIndex);
      accumulatedData = accumulatedData.slice(newlineIndex + 1);
      
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          console.log('Parsed data:', data);
          if (data.event === 'text_chunk') {
            const text = data.data.text;
            currentSubtitle.text += text;

            // 检查是否包含完整的字幕项
            if (currentSubtitle.text.includes('}')) {
              const subtitleMatch = currentSubtitle.text.match(/{[^}]+}/);
              if (subtitleMatch) {
                const subtitleObj = JSON.parse(subtitleMatch[0]);
                addSubtitleToContainer(subtitleObj, videoId, contentContainer);
                generatedSubtitles.push(subtitleObj);  // 将生成的字幕对象添加到数组中
                currentSubtitle = { text: currentSubtitle.text.slice(subtitleMatch.index + subtitleMatch[0].length), start: null, dur: null };
              }
            }
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    }
  }

  // 保存生成的字幕到缓存
  await cacheSubtitles(videoId, generatedSubtitles);

  console.log('Transcript generation completed');
  const resultElement = document.getElementById('transcript-result');
  resultElement.textContent = '中文文稿生成完成';
  
  // 添加以下代码来隐藏提示
  setTimeout(() => {
    resultElement.textContent = '';
  }, 3000); // 3秒后隐藏提示
}

function addSubtitleToContainer(subtitle, videoId, container) {
  console.log('Adding subtitle to container:', subtitle);
  const t = Math.floor(subtitle.start);
  const hhmmss = formatTime(t);
  const hideTimeCheckbox = document.getElementById('hide-time-checkbox');
  const timestampStyle = hideTimeCheckbox && hideTimeCheckbox.checked ? 'display: none;' : '';
  const subtitleHtml = `
    <div class="youtube_subtitle_man_item" style="display: flex; align-items: center; margin-bottom: 8px;">
      <a class="youtube_subtitle_man__timestamp" style="min-width: 70px; text-decoration: none; color: #065fd4; margin-right: 10px; ${timestampStyle}" href="/watch?v=${videoId}&t=${t}s" data-timestamp-href="/watch?v=${videoId}&t=${t}s" data-start-time="${t}">${hhmmss}</a>
      <div class="youtube_subtitle_man_text" style="flex: 1;">${subtitle.text}</div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', subtitleHtml);
  
  console.log('Container HTML after addition:', container.innerHTML);
}

function formatTime(seconds) {
  const date = new Date(seconds * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const secs = date.getUTCSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
}

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['difyApiKey'], function(result) {
      resolve(result.difyApiKey);
    });
  });
}

async function getVideoInfo() {
  const response = await fetch(window.location.href);
  const html = await response.text();
  
  const titleMatch = html.match(/<title>(.+?)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown Title';

  const captionTracksMatch = html.match(/"captionTracks":(\[.*?\])/);
  if (captionTracksMatch) {
    const captionTracks = JSON.parse(captionTracksMatch[1]);
    const englishTrack = captionTracks.find(track => track.languageCode === 'en');
    if (englishTrack) {
      return { title, captionUrl: englishTrack.baseUrl };
    }
  }
  
  return { title, captionUrl: null };
}

async function getCaptions(url) {
  const response = await fetch(url);
  const xml = await response.text();
  return xml;
}

// 添加新函数来获取缓存的字幕
async function getCachedSubtitles(videoId) {
  return new Promise((resolve) => {
    chrome.storage.local.get([videoId], function(result) {
      resolve(result[videoId] || null);
    });
  });
}

// 添加新函数来缓存字幕
async function cacheSubtitles(videoId, subtitles) {
  return new Promise((resolve) => {
    chrome.storage.local.set({[videoId]: subtitles}, function() {
      resolve();
    });
  });
}

// 保留原有的消息监听逻辑
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateSubtitle") {
    // 这里添加获取YouTube视频字幕的逻辑
    // 然后调用dify API生成中文文稿
    // 完成后发送消息给popup
    chrome.runtime.sendMessage({action: "subtitleGenerated"});
  }
});