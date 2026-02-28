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
    targetBox.innerHTML = '';
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
    
            <div class="sub-list-left">
                <img class="mini-icon"></img>
                <p class="service-name">${name}</p>
            </div>
    
            <div class="sub-list-right">
                <p class="service-price">${Number(price).toLocaleString()}원</p>
    
                <div class="sub-list-bottom">
                    <p class="pay-date">${cycle} ${day}일마다</p>
    
                    <div class="sub-list-actions">
                        <button class="pencil"><img class="pencilImg" src="/images/pencil.png"></button>
                        <button class="delete-btn">X</button>
                    </div>
                </div>
            </div>
    
            <p class="hidden savedInterval">${interval}</p>
            <p class="hidden savedDday">${savedDday}</p>
            <p class="hidden savedAlarms">${alarms}</p>
        </li>
    `
    }).join("");

    targetBox.insertAdjacentHTML('beforeend', resultList);
};



const subscriptionList = document.querySelector('.sub-box2.subListContainer');
document.addEventListener('DOMContentLoaded', async function () {

    refreshTotal(); // 페이지 로드 시 총액 계산 실행
    subListRequestFetch();
    refreshTotal();
});


async function subListRequestFetch() {
    let token = localStorage.getItem('access');
    let pageNumber = document.querySelector('.mysub-pagination .page-number.active').innerText;
    const param =
    {
        "page": parseInt(pageNumber) - 1,
        "size": 5,
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
            const noSub = `<a href="/login">로그인 후 나만의 구독 서비스를 추가하세요!.</a>`
            subscriptionList.insertAdjacentHTML('beforeend', noSub)
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
            const currentIndex = parseInt(result.data.pageNumber / 5);
            const totalPages = result.data.totalPages;
            const pageSize = result.data.pageSize;
            currentIdx = currentIndex;
            const pageNumber = document.querySelectorAll('.mysub-pagination .page-numbers .page-number');


            if (currentIndex >= 1) {
                pageBtnPrev.classList.remove('hidden');
            } else {
                pageBtnPrev.classList.add('hidden');
            }
            const addNextPage = parseInt((totalPages - 1) / pageSize);
            if (currentIndex < addNextPage) {
                pageBtnNext.classList.remove('hidden');
            } else {
                pageBtnNext.classList.add('hidden');
            }
            if (currentIndex < parseInt(((totalPages - 1) / pageSize))) {
                for (let i = 0; i < pageNumber.length; i++) {
                    pageNumber[i].classList.remove('hidden');
                }
            } else {
                for (let j = 0; j < pageNumber.length; j++) {
                    if ((totalPages - 1) % 5 >= j) {
                        pageNumber[j].classList.remove('hidden');
                    } else {
                        pageNumber[j].classList.add('hidden');
                    }
                }
            }


        }
    } else if (subGetResponse.status === 404) {
        console.log("유저를 찾을 수 없습니다.");
    }
};


const mySub = document.querySelector('.pagination-wrap.mysub-pagination');
mySub.addEventListener('click', e => {
    if (e.target.classList.contains('page-number')) {
        const currentActive = mySub.querySelector('.active');
        let page = e.target.closest('.page-number');
        currentActive.classList.remove('active');
        page.classList.add('active');
        subListRequestFetch();
    }
});

let currentIdx = 0;

const pageBtnNext = mySub.querySelector('#next');
pageBtnNext.onclick = function () {
    let page = mySub.querySelectorAll('.page-number');
    for (let i = 0; i < 5; i++) {
        page[i].innerText = (currentIdx + 1) * 5 + (i + 1);
        if (i === 0) {
            page[i].classList.add('active');
        } else {
            page[i].classList.remove('active');
        }
    }

    subListRequestFetch();
};

const pageBtnPrev = mySub.querySelector('#prev');
pageBtnPrev.onclick = function () {
    let page = mySub.querySelectorAll('.page-number');
    for (let i = 0; i < 5; i++) {
        page[i].innerText = (currentIdx - 1) * 5 + (i + 1);

        if (i === 4) {
            page[i].classList.add('active');
        } else {
            page[i].classList.remove('active');
        }
    }
    subListRequestFetch();

};













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
