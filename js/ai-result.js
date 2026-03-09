const url = "https://구독관리서비스.site";

// 개별 태그별 변수 선언
const mainPageBtn = document.querySelector('.topbar-btn');
const heroLabel = document.querySelector('.analysis-hero-label');
const heroTitle = document.querySelector('.analysis-hero-title');
const heroDesc = document.querySelector('.analysis-hero-desc');
const heroTagsContainer = document.querySelector('.analysis-hero-tags');
const cardGridContainer = document.querySelector('.analysis-card-grid');
const insightListContainer = document.querySelector('.analysis-insight-list');
const sideTitle = document.querySelector('.analysis-side-title');
const sideDesc = document.querySelector('.analysis-side-desc');
const sideBox = document.querySelector('.analysis-side-box');
const insightMain = document.querySelector('.analysis-insight-main');

// 로딩 관련 요소
const loadingOverlay = document.querySelector('#analysisLoading');
const loadingTip = document.querySelector('#analysisLoadingTip');

const loadingMessages = [
    "가장 많이 쓰는 카테고리를 먼저 확인하고 있어요...",
    "장기 유지 중인 서비스 패턴을 살펴보는 중이에요...",
    "지출 흐름을 바탕으로 소비 성향을 정리하고 있어요...",
    "중복되거나 비슷한 구독이 있는지 비교하는 중이에요...",
    "당신한테 맞는 한 줄 요약을 만드는 중이에요..."
];

let loadingMessageInterval = null;

// 홈으로 이동 버튼 이벤트
mainPageBtn.onclick = () => {
    window.location.href = "/";
};

function showLoading() {
    if (!loadingOverlay) return;
    loadingOverlay.classList.remove('is-hidden');
    loadingOverlay.classList.add('is-active');
}

function hideLoading() {
    if (!loadingOverlay) return;
    loadingOverlay.classList.add('is-hidden');

    setTimeout(() => {
        loadingOverlay.classList.remove('is-active');
    }, 350);
}

function rotateLoadingMessages() {
    if (!loadingTip) return;

    let index = 0;
    loadingTip.textContent = loadingMessages[index];

    loadingMessageInterval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        loadingTip.textContent = loadingMessages[index];
    }, 1700);
}

function stopRotateLoadingMessages() {
    if (loadingMessageInterval) {
        clearInterval(loadingMessageInterval);
        loadingMessageInterval = null;
    }
}

/**
 * 전달받은 데이터를 HTML 요소들에 매핑하는 함수
 */
function displayData(resData) {
    const userType = resData.userTypeAnalysis;
    const coreInterpretations = resData.coreInterpretations;
    const aiInsights = resData.aiInsights;
    const summary = resData.oneLineSummary;

    // 1. 히로(상단) 영역 데이터 바인딩
    heroLabel.textContent = `사용자님의 현재 구독 중인 서비스를 분석한 결과`;
    heroTitle.textContent = userType.title;
    heroDesc.textContent = userType.description;
    heroTagsContainer.innerHTML = userType.tags
        .map(tag => `<span class="analysis-tag">${tag}</span>`)
        .join('');

    // 2. 핵심 해석 카드 리스트 생성
    cardGridContainer.innerHTML = coreInterpretations.map((item, index) => {
        const cardNumber = String(index + 1).padStart(2, '0');
        return `
            <article class="analysis-card">
                <p class="analysis-card-kicker">핵심 해석 ${cardNumber}</p>
                <h4 class="analysis-card-title">${item.title}</h4>
                <p class="analysis-card-desc">${item.description}</p>
            </article>`;
    }).join('');

    // 3. AI 인사이트 리스트 생성
    insightListContainer.innerHTML = aiInsights.map((item, index) => {
        const insightIcon = String(index + 1).padStart(2, '0');
        return `
            <div class="analysis-insight-item">
                <div class="analysis-insight-icon">${insightIcon}</div>
                <div class="analysis-insight-texts">
                    <p class="analysis-insight-title">${item.title}</p>
                    <p class="analysis-insight-desc">${item.description}</p>
                </div>
            </div>`;
    }).join('');

    // 4. 우측 사이드 바 요약 데이터 바인딩
    sideTitle.innerHTML = summary.summaryTitle;
    sideDesc.innerHTML = summary.summaryDescription;
}

function showErrorMessage() {
    heroTitle.textContent = "분석 결과를 불러오지 못했어요";
    heroDesc.textContent = "구독 목록이 있는지 확인해 주세요!";
    heroTagsContainer.innerHTML = `<span class="analysis-tag">불러오기 실패</span>`;
    cardGridContainer.style.display = "none";
    insightListContainer.style.display = "none";
    sideTitle.style.display = "none";
    sideDesc.style.display = "none";
    sideBox.style.display = "none";
    insightMain.style.display = "none";
    cardGridContainer.innerHTML = "";
    insightListContainer.innerHTML = "";
    sideTitle.innerHTML = "";
    sideDesc.innerHTML = "";
    sideBox.innerHTML = "";
    insightMain.innerHTML = "";
}

/**
 * 실제 서버에 데이터를 요청하는 함수
 */
async function aiRequestFetch() {
    showLoading();
    rotateLoadingMessages();

    try {
        let token = localStorage.getItem('access');

        // 첫 번째 시도
        let response = await fetch(`${url}/api/ai`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        // 성공 시 데이터 바로 출력
        if (response.status === 200) {
            const responseJson = await response.json();
            displayData(responseJson.data);
            return;
        }

        // 토큰 만료(401) 시 재발급 시도
        if (response.status === 401) {
            let tokenReissue = await fetch(`${url}/api/auth/reissue`, {
                method: "POST",
                credentials: "include"
            });

            if (tokenReissue.status === 200) {
                let json = await tokenReissue.json();
                let newToken = json.data.accessToken;
                localStorage.setItem('access', newToken);

                // 재발급받은 토큰으로 다시 요청
                let retryResponse = await fetch(`${url}/api/ai`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${newToken}` }
                });

                if (retryResponse.status === 200) {
                    let retryJson = await retryResponse.json();
                    displayData(retryJson.data);
                    return;
                } else {
                    window.location.href = "/login";
                    return;
                }
            } else {
                // 재발급도 실패하면 로그인 페이지로
                window.location.href = "/login";
                return;
            }
        }

        // 401 아니고 다른 에러면 에러 화면
        showErrorMessage();

    } catch (error) {
        console.error("AI 결과 요청 실패:", error);
        showErrorMessage();
    } finally {
        stopRotateLoadingMessages();
        hideLoading();
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', aiRequestFetch);