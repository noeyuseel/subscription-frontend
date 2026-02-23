
const alertBox = document.querySelectorAll('.main-box')[0];
function getDiffDay(targetDateString) {
    const targetDate = new Date(targetDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
}

function getBadgeColor(diffDay) {
    if (diffDay <= 2) return 'red';
    if (diffDay <= 4) return 'orange';
    return 'green';
}

alertBox.onclick = async function () {
    const targetBox = document.querySelector('.sub-box1');
    const params = {
        "page": 0,
        "size": 0,
        "sort": ["string"],
        "day": 5

    };
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${url}/api/subscription/due?${queryString}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },

    });
    let result = await response.json();
    if (response.status === 200) {
        if (result.data.length === 0) {
            let noAlertSubItem = `<p class="no-alert-subscription">임박한 구독 목록이 없습니다.</p>`
            targetBox.insertAdjacentHTML('beforeend', noAlertSubItem);
        }

        const diffDay = getDiffDay(result.dday);
        const colorClass = getBadgeColor(diffDay);

        // 결제일 계산 로직, 뱃지 색깔 구분 로직, 주기에 따라 한글로 변환하는 로직 필요
        let subItem = `<li class="sub-item">
                    <p class="badge ${colorClass}">D-${diffDay}</p>
                    <p>${result.name}</p>
                    <p>${cycle}</p>
                </li>`
        targetBox.insertAdjacentHTML('beforeend', subItem);
    } else if (response.status === 404) {
        console.log("유저를 찾을 수 없습니다.");
    }
};
