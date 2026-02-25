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


function renderSubscriptionItemsDue(result, targetBox) {
    if (result.length === 0) {
        let noAlertSubItem = `<p class="no-alert-subscription">임박한 구독 목록이 없습니다.</p>`
        targetBox.insertAdjacentHTML('beforeend', noAlertSubItem);
    }

    const subItem = result.map(item => {
        const diffDay = getDiffDay(item.dday);
        const colorClass = getBadgeColor(diffDay);
        const name = item.name;
        const dday = item.dday;
        const price = item.price;

        return `<li class="sub-item">
                    <p class="badge ${colorClass}">D-${diffDay}</p>
                    <p>${name}</p>
                    <p>${dday}</p>
                    <p>${price}</p>
                </li>`

    }).join("");
    targetBox.insertAdjacentHTML('beforeend', subItem);
}


document.addEventListener('DOMContentLoaded', async function () {
    const targetBox = document.querySelector('.sub-box1');
    const params = {
        "page": 0,
        "size": 5,
        "day": 5
    };

    const queryString = new URLSearchParams(params).toString();
    const token = localStorage.getItem('access');
    const response = await fetch(`${url}/api/subscription/due?${queryString}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
        let tokenReissue = await fetch(`${url}/api/auth/reissue`, {
            method: "POST",
            credentials: "include"
        });
        if (tokenReissue.status === 401) {
            window.location.href = "/login";
        } else if (tokenReissue.status === 200) {
            tokenResult = await tokenReissue.json();
            localStorage.setItem('access', tokenResult.data.accessToken);
            const againResponse = await fetch(`${url}/api/subscription/due?${queryString}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${tokenResult.data.accessToken}` }
            });

            if (againResponse.status === 200) {
                const result = await againResponse.json();
                renderSubscriptionItemsDue(result.data.content, targetBox);

            } else if (againResponse.status === 404) {
                console.log("유저를 찾을 수 없습니다.");
            }
        }
    }
    if (response.status === 200) {
        const result = await response.json();
        renderSubscriptionItemsDue(result.data.content, targetBox);
    } else if (response.status === 404) {
        console.log("유저를 찾을 수 없습니다.");
    }
});
