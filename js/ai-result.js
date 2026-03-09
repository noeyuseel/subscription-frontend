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

// 홈으로 이동 버튼 이벤트
mainPageBtn.onclick = () => {
    window.location.href = "/";
};

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

/**
 * 실제 서버에 데이터를 요청하는 함수
 */
async function aiRequestFetch() {
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
    }
    // 토큰 만료(401) 시 재발급 시도
    else if (response.status === 401) {
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
            let retryJson = await retryResponse.json();
            displayData(retryJson.data);
        } else {
            // 재발급도 실패하면 로그인 페이지로
            window.location.href = "/login";
        }
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', aiRequestFetch);