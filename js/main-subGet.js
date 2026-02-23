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

refreshTotal();
document.addEventListener('DOMContentLoaded', async function () {
    refreshTotal(); // 페이지 로드 시 총액 계산 실행
    let token = localstorage.getItem('access');
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
            method: "POST"
        });
        if (tokenReissue.status === 401) {
            window.location.href = "/login";
        } else if (tokenReissue.status === 200) {
            const tokenResult = tokenReissue.json();
            localStorage.setItem('access', tokenResult.data.accessToken);
            let response2 = await fetch(`${url}/api/subscription?${queryString}`
                , {
                    method: "GET",
                    headers: { 'Athorization': `Bearer ${tokenResult.data.accessToken}` }
                });
            const requestResult = response2.json();
            if (requestResult.data.content.length === 0) {
                const noSub = `<p>구독 정보가 없습니다.</p>`
                subscriptionList.insertAdjacent('beforeend', noSub);
            } else {
                const resultList = requestResult.data.content.map(item => {
                    let name = item.name;
                    let cycle = getCycle(item.paymentCycle, item.cycleInterval);
                    let dday = new Date(item.dday);
                    let day = dday.getDate();
                    let price = item.price;

                    return `
                        <li class="sub-box2">
                            <img class="mini-icon"></img>
                            <p class="service-name">${name}</p>
                            <p class="pay-date">${cycle} ${day}일마다</p>
                            <p class="service-price">${Number(price).toLocaleString()}원</p>
                            <button class="delete-btn">X</button>
                        </li>
                        `
                }).join("");

                subscriptionList.insertAdjacentHTML('beforeend', resultList);
            }

        }
    }
    else if (subGetResponse.status === 200) {
        const result = subGetResponse.json();
        if (result.data.content.length === 0) {
            const noSub = `<p>구독 정보가 없습니다.</p>`
            subscriptionList.insertAdjacent('beforeend', noSub);
        } else {
            const resultList = result.data.content.map(item => {
                let name = item.name;
                let cycle = getCycle(item.paymentCycle, item.cycleInterval);
                let dday = new Date(item.dday);
                let day = dday.getDate();
                let price = item.price;

                return `
                    <li class="sub-box2">
                        <img class="mini-icon"></img>
                        <p class="service-name">${name}</p>
                        <p class="pay-date">${cycle} ${day}일마다</p>
                        <p class="service-price">${Number(price).toLocaleString()}원</p>
                        <button class="delete-btn">X</button>
                    </li>
                    `
            }).join("");

            subscriptionList.insertAdjacentHTML('beforeend', resultList);
        }
    } else if (subGetResponse.status === 404) {
        console.log("유저를 찾을 수 없습니다.");
    }
});

function getCycle(paymentCycle, interval) {
    const result = "매";
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

const subscriptionBox = document.querySelectorAll('.main-box')[1];
const subscriptionList = document.querySelector('sub-box2');
subscriptionBox.onclick = function (event) {
    if (event.target.classList.contains('delete-btn')) {
        const targetBox = event.target.closest('.sub-box2');
        targetBox.remove();
        refreshTotal();

        const deleteResponse = async function () {
            await fetch(`${url}/api/subscription`, {
                method: "DELETE"
            });
            if (deleteResponse.status === 204) {
                console.log("구독 정보 삭제 성공");
            } else { console.log("구독 정보를 찾을 수 없습니다.") }
        }
        const response = async function () {
            const params = {
                "page": 0,
                "size": 1,
                "sort": [
                    "string"
                ]
            };
            const queryString = params.toString();
            await fetch(`${url}/api/subscription?${queryString}`, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                const newBoxHtml = `
                    <li class="sub-box2">
                        <img class="mini-icon"></img>
                        <p class="service-name">${name}</p>
                        <p class="pay-date">매${cycle} ${date}일</p>
                        <p class="service-price">${Number(price).toLocaleString()}원</p>
                        <button class="delete-btn">X</button>
                    </li>
                    `
                const subListBox = document.querySelectorAll('.sub-box2');
                subListBox.insertAdjacentHTML('beforeend', newBoxHtml);
            } else if (response.status === 404) {
                console.log("유저를 찾을 수 없습니다.");
            }
        }
    }
};


