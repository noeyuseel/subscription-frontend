document.addEventListener('DOMContentLoaded', () => {

    requestTotalMoneyValue();
    requestMoneySummary();
});

async function requestTotalMoneyValue() {
    const totalMoneyTrend = document.querySelector('.total-money-trend');
    const trendValue = totalMoneyTrend.querySelector('.trend-value');
    const totalDisplay = document.querySelector('.total-money');

    const date = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date()).replace(/\. /g, '-').replace('.', '');

    let token = localStorage.getItem('access');
    let param = {
        "date": date
    }

    const queryString = new URLSearchParams(param).toString();
    let response = await fetch(`${url}/api/history/total-money?${queryString}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 200) {
        console.log("조회 성공");
        let json = await response.json();
        let totalMoney = json.data.totalMoney;
        let percentage = json.data.lastPercentage;
        totalDisplay.innerHTML = totalMoney.toLocaleString() + "원";
        trendValue.innerText = percentage + "%";

    } else if (response.status === 401) {
        console.log('인증에 실패했습니다.');
        let tokenReissue = await fetch(`${url}/api/auth/reissue`, {
            method: 'POST',
            credentials: 'include'
        });
        if (tokenReissue.status === 200) {
            let tokenReissueJson = await tokenReissue.json();
            localStorage.setItem('access', tokenReissueJson.data.accessToken);
            let param = {
                "date": date
            }
            const queryString = new URLSearchParams(param).toString();
            let response2 = await fetch(`${url}/api/history/total-money?${queryString}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${tokenReissueJson.data.accessToken}` }
            });

            let response2Json = response2.json();
            let totalMoney = response2Json.data.totalMoney;
            let lastPercentage = response2.data.lastPercentage;

            totalDisplay.innerHTML = totalMoney.toLocaleString() + "원";
            trendValue.innerText = lastPercentage + "%";
        }
    } else if (response.status === 404) {
        console.log("유저 혹은 구독 정보를 찾을 수 없습니다.")
    }
};

async function requestMoneySummary() {
    const moneySummarySimple = document.querySelector('.money-summary-simple');
    const monthlyPaymentCount = moneySummarySimple.querySelector('.money-summary-count');

    const date = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date()).replace(/\. /g, '-').replace('.', '');

    let param = {
        "date": date
    }
    const queryString = new URLSearchParams(param).toString();
    let token = localStorage.getItem('access');
    let response = await fetch(`${url}/api/history/total-count?${queryString}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 200) {
        let responseJson = await response.json();
        let count = responseJson.data;
        monthlyPaymentCount.innerText = count + "건";
    } else if (response.status === 401) {
        console.log('인증에 실패했습니다.');
        let tokenReissue = await fetch(`${url}/api/auth/reissue`, {
            method: 'POST',
            credentials: 'include'
        });
        if (tokenReissue.status === 200) {
            let tokenReissueJson = await tokenReissue.json();
            localStorage.setItem('access', tokenReissueJson.data.accessToken);
            let param = {
                "date": date
            }
            const queryString = new URLSearchParams(param).toString();
            let response2 = await fetch(`${url}/api/history/total-count?${queryString}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${tokenReissueJson.data.accessToken}` }
            });

            let response2Json = response2.json();
            let count = response2Json.data;
            monthlyPaymentCount.innerText = count + "건";
        }
    } else if (response.status === 404) {
        console.log("유저 혹은 구독 정보를 찾을 수 없습니다.");
    }

}
