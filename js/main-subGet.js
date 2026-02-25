function refreshTotal() {
    const priceElement = document.querySelectorAll('.service-price');
    let totalPrice = 0;
    priceElement.forEach(el => {
        const priceText = el.innerText.replace(/[^0-9]/g, '');
        if (priceText) {
            totalPrice += parseInt(priceText);
        }
    });

    const totalDisplay = document.querySelector('.total-money');
    totalDisplay.innerHTML = totalPrice.toLocaleString() + "원";
}


function renderSubscriptionItems(result, targetBox) {
    const resultList = result.map(item => {
        let name = item.name;
        let cycle = getCycle(item.paymentCycle, item.cycleInterval);
        let dday = new Date(item.dday);
        let day = dday.getDate();
        let price = item.price;
        let id = item.id;
        let category = item.category;
        let interval = item.cycleInterval;
        let savedDday = item.dday;
        let alarms = item.alarm;

        return `
            <li class="sub-list">
                <p class="hidden savedId">${id}</p>
                <p class="hidden savedCategory">${category}</p>
                <img class="mini-icon"></img>
                <p class="service-name">${name}</p>
                <p class="pay-date">${cycle} ${day}일마다</p>
                <p class="hidden savedInterval">${interval}</p>
                <p class="service-price">${Number(price).toLocaleString()}원</p>
                <p class="hidden savedDday">${savedDday}</p>
                <p class="hidden savedAlarms">${alarms}</p>
                <button class="pencil"><img class="pencilImg" src="/images/pencil.png"></button>
                <button class="delete-btn">X</button>
            </li>
        `
    }).join("");

    targetBox.insertAdjacentHTML('beforeend', resultList);
};


document.addEventListener('DOMContentLoaded', async function () {
    const subscriptionList = document.querySelector('.sub-box2');
    refreshTotal(); // 페이지 로드 시 총액 계산 실행
    let token = localStorage.getItem('access');
    const param =
    {
        "page": 0,
        "size": 10,
    };
    const queryString = new URLSearchParams(param).toString();
    let subGetResponse = await fetch(`${url}/api/subscription?${queryString}`
        , {
            method: "GET",
            headers: { 'Authorization': `Bearer ${token}` }
        });
    if (subGetResponse.status === 401) {
        let tokenReissue = await fetch(`${url}/api/auth/reissue`, {
            method: "POST",
            credentials: "include"
        });
        if (tokenReissue.status === 401) {
            window.location.href = "/login";
        } else if (tokenReissue.status === 200) {
            const tokenResult = await tokenReissue.json();
            localStorage.setItem('access', tokenResult.data.accessToken);
            let response2 = await fetch(`${url}/api/subscription?${queryString}`
                , {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${tokenResult.data.accessToken}` }
                });
            const requestResult = await response2.json();
            if (requestResult.data.content.length === 0) {
                const noSub = `<p>구독 정보가 없습니다.</p>`
                subscriptionList.insertAdjacentHTML('beforeend', noSub);
            } else {
                renderSubscriptionItems(requestResult.data.content, subscriptionList);
            }

        }
    }
    else if (subGetResponse.status === 200) {
        const result = await subGetResponse.json();
        if (result.data.content.length === 0) {
            const noSub = `<p>구독 정보가 없습니다.</p>`
            subscriptionList.insertAdjacentHTML('beforeend', noSub);
        } else {
            renderSubscriptionItems(result.data.content, subscriptionList);
        }
    } else if (subGetResponse.status === 404) {
        console.log("유저를 찾을 수 없습니다.");
    }
    refreshTotal();
});

function getCycle(paymentCycle, interval) {
    let result = "매";
    if (paymentCycle === 'MONTH') {
        if (interval === 1) {
            result += "월"
        } else { result += ` ${interval}` + "개월"; }
    } else {
        if (interval === 1) {
            result += "년"
        } else { result += ` ${interval}` + "년"; }
    }
    return result;
}