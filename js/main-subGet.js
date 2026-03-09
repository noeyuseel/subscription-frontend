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
                <img class="mini-icon" src="${getServiceLogoPath(name)}">
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

function getServiceLogoPath(name) {
    const logoMap = {
        "Netflix": "/images/logo/netflix.png",
        "YouTube Premium": "/images/logo/youtube-premium.png",
        "Disney+": "/images/logo/disney-plus.png",
        "TVING": "/images/logo/tving.png",
        "Wavve": "/images/logo/wavve.png",
        "쿠팡 와우": "/images/logo/coupang-wow.png",
        "Melon": "/images/logo/melon.png",
        "Spotify": "/images/logo/spotify.png",
        "Apple Music": "/images/logo/apple-music.png",
        
    };

    return logoMap[name] || "/images/logo/other.png";
}


const subscriptionList = document.querySelector('.sub-box2.subListContainer');
document.addEventListener('DOMContentLoaded', async function () {

    subListRequestFetch();
});


async function subListRequestFetch() {
    let token = localStorage.getItem('access');
    if (token) {
        login.innerText = "로그아웃";
    }
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
            const noSub = `
                <li class="empty-state-item login-empty-state">
                    <div class="empty-state-icon">🔐</div>
                    <div class="empty-state-texts">
                        <p class="empty-state-title">로그인이 필요합니다</p>
                        <p class="empty-state-desc">로그인 후 나만의 구독 서비스를 추가해보세요.</p>
                    </div>
                    <a href="/login" class="empty-state-link">로그인</a>
                </li>
            `;
            login.innerText = "로그인";
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
                const noSub = `
                    <li class="empty-state-item subscription-empty-state">
                        <div class="empty-state-icon">❌</div>
                        <div class="empty-state-texts">
                            <p class="empty-state-title">구독 정보가 없습니다</p>
                            <p class="empty-state-desc">아직 등록된 구독 서비스가 없어요. 새 서비스를 추가해보세요.</p>
                        </div>
                    </li>
                `;
                subscriptionList.insertAdjacentHTML('beforeend', noSub);
            } else {
                renderSubscriptionItems(requestResult.data.content, subscriptionList);
            }

        }
    }
    else if (subGetResponse.status === 200) {
        const result = await subGetResponse.json();
        if (result.data.content.length === 0) {
            const noSub = `
            <li class="empty-state-item subscription-empty-state">
                <div class="empty-state-icon">❌</div>
                <div class="empty-state-texts">
                    <p class="empty-state-title">구독 정보가 없습니다</p>
                    <p class="empty-state-desc">아직 등록된 구독 서비스가 없어요. 새 서비스를 추가해보세요.</p>
                </div>
            </li>
        `;
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
