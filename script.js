// DOM 元素
const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const submitPassword = document.getElementById('submitPassword');
const passwordError = document.getElementById('passwordError');
const mainContainer = document.getElementById('mainContainer');
const videoLink = document.getElementById('videoLink');
const pasteButton = document.getElementById('pasteButton');
const parseButton = document.getElementById('parseButton');
const resultSection = document.getElementById('resultSection');
const videoTitle = document.getElementById('videoTitle');
const coverImage = document.getElementById('coverImage');
const downloadCover = document.getElementById('downloadCover');
const downloadVideo = document.getElementById('downloadVideo');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const retryButton = document.getElementById('retryButton');

// 当前解析结果缓存
let currentResult = null;

// 密码验证
submitPassword.addEventListener('click', () => {
    const password = passwordInput.value.trim();
    if (password === '123456') {
        passwordModal.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        mainContainer.classList.add('fade-in');
    } else {
        passwordError.classList.remove('hidden');
        passwordInput.classList.add('border-red-500');
        setTimeout(() => {
            passwordError.classList.add('hidden');
            passwordInput.classList.remove('border-red-500');
        }, 3000);
    }
});

// 密码输入框回车事件
passwordInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        submitPassword.click();
    }
});

// 粘贴按钮功能
pasteButton.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        videoLink.value = text;
        // 自动提取URL
        extractUrlFromText(text);
    } catch (err) {
        console.error('无法读取剪贴板内容:', err);
        alert('无法读取剪贴板内容，请手动粘贴');
    }
});

// 从文本中提取URL
function extractUrlFromText(text) {
    // 正则表达式匹配 http 或 https URL
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlRegex);
    
    if (urls && urls.length > 0) {
        // 只保留第一个URL
        videoLink.value = urls[0];
        return urls[0];
    }
    return null;
}

// 解析按钮点击事件
parseButton.addEventListener('click', () => {
    parseVideoLink();
});

// 视频链接输入框回车事件
videoLink.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        parseVideoLink();
    }
});

// 重试按钮点击事件
retryButton.addEventListener('click', () => {
    errorState.classList.add('hidden');
    parseVideoLink();
});

// 解析视频链接
function parseVideoLink() {
    const text = videoLink.value.trim();
    if (!text) {
        alert('请输入视频链接');
        return;
    }

    // 提取URL
    const url = extractUrlFromText(text);
    if (!url) {
        alert('未找到有效的链接，请检查输入');
        return;
    }

    // 显示加载状态
    resultSection.classList.add('hidden');
    errorState.classList.add('hidden');
    loadingState.classList.remove('hidden');

    // 调用API解析视频
    fetchVideoData(url);
}

// 调用API获取视频数据
function fetchVideoData(url) {
    // API地址（已设置为真实的API密钥）
    const apiKey = '30d2b81633c8448eb19b02f2f8dfdfce';
    const apiUrl = `https://api.guijianpan.com/waterRemoveDetail/xxmQsyByAk?ak=${apiKey}&link=${encodeURIComponent(url)}`;

    // 注意：由于浏览器的CORS限制，实际环境中可能需要设置代理
    console.log('调用API:', apiUrl);

    // 使用真实API调用
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误');
            }
            return response.json();
        })
        .then(data => {
            handleApiResponse(data);
        })
        .catch(error => {
            console.error('API请求失败:', error);
            loadingState.classList.add('hidden');
            errorMessage.textContent = '解析失败，请稍后重试';
            errorState.classList.remove('hidden');
        });
}

// 处理API响应
function handleApiResponse(data) {
    loadingState.classList.add('hidden');

    if (data.code === '10000' && data.content && data.content.success) {
        // 缓存当前结果
        currentResult = data.content;

        // 显示结果
        videoTitle.textContent = currentResult.title || '无标题';
        coverImage.src = currentResult.cover || '';
        coverImage.alt = currentResult.title || '视频封面';

        // 显示结果区域
        resultSection.classList.remove('hidden');
        resultSection.classList.add('fade-in');
    } else {
        // 显示错误信息
        errorMessage.textContent = data.msg || '解析失败，请检查链接是否正确';
        errorState.classList.remove('hidden');
    }
}

// 下载封面
downloadCover.addEventListener('click', () => {
    if (currentResult && currentResult.cover) {
        downloadFile(currentResult.cover, '封面.jpg');
    }
});

// 下载视频
downloadVideo.addEventListener('click', () => {
    if (currentResult && currentResult.url) {
        downloadFile(currentResult.url, '视频.mp4');
    }
});

// 下载文件函数
function downloadFile(url, filename) {
    // 创建隐藏的a标签用于下载
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // 触发下载
    link.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(link);
    }, 100);

    // 显示下载成功提示
    showToast('下载已开始，请稍候...');
}

// 简单的提示框函数
function showToast(message) {
    // 检查是否已存在提示框
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-dark text-white px-6 py-3 rounded-lg shadow-lg z-50 opacity-0 transition-all duration-300';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    
    // 显示提示框
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // 3秒后隐藏提示框
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// 添加页面加载动画
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// 响应式调整
window.addEventListener('resize', () => {
    adjustLayout();
});

function adjustLayout() {
    // 可以在这里添加响应式布局调整代码
}