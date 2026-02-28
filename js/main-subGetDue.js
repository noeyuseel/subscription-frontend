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
    targetBox.innerHTML = '';
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
            <div class="sub-item-left">
                <p class="badge ${colorClass}">D-${diffDay}</p>
                <p class="due-name">${name}</p>
            </div>

            <div class="sub-item-right">
                <p class="due-price">${Number(price).toLocaleString()}원</p>
                <p class="due-date">결제일: ${dday}</p>
            </div>
        </li>
    `
    }).join("");
    targetBox.insertAdjacentHTML('beforeend', subItem);
}


document.addEventListener('DOMContentLoaded', async function () {
    requestFetch();
});

const upcomingWrapper = document.querySelector('.pagination-wrap.upcoming-pagination');
upcomingWrapper.addEventListener('click', e => {
    if (e.target.classList.contains('page-number')) {
        const currentActiveUpcoming = upcomingWrapper.querySelector('.active');
        const pageNumber = e.target.closest('.page-number');
        currentActiveUpcoming.classList.remove('active');
        pageNumber.classList.add('active');
        requestFetch();
    }
});

async function requestFetch() {
    const targetBox = document.querySelector('.sub-box1');
    const container = document.querySelector('.upcoming-pagination');
    let pageNumber = container.querySelector('.page-number.active');
    let page = !pageNumber ? 0 : pageNumber.innerText - 1;
    const params = {
        "page": page,
        "size": 3,
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
        if (tokenReissue.status === 200) {
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

        const currentIndex = parseInt(result.data.pageNumber / 3);
        const totalPages = result.data.totalPages;
        const pageSize = result.data.pageSize;
        const totalElements = result.data.totalElements;
        currentIdx = currentIndex;
        const pageNumber = document.querySelectorAll('.upcoming-pagination .page-numbers .page-number');

        const chip = document.querySelector(".service-alert-chip");
        if (totalElements > 3) {
            chip.classList.remove('hidden');
        } else {
            chip.classList.add('hidden');
        }

        if (currentIndex >= 1) {
            pageDueBtnPrev.classList.remove('hidden');
        } else {
            pageDueBtnPrev.classList.add('hidden');
        }
        const addNextPage = parseInt((totalPages - 1) / pageSize);
        if (currentIndex < addNextPage) {
            pageDueBtnNext.classList.remove('hidden');
        } else {
            pageDueBtnNext.classList.add('hidden');
        }
        if (currentIndex < parseInt(((totalPages - 1) / pageSize))) {
            for (let i = 0; i < pageNumber.length; i++) {
                pageNumber[i].classList.remove('hidden');
            }
        } else {
            for (let j = 0; j < pageNumber.length; j++) {
                if ((totalPages - 1) % 3 >= j) {
                    pageNumber[j].classList.remove('hidden');
                } else {
                    pageNumber[j].classList.add('hidden');
                }
            }
        }
    } else if (response.status === 404) {
        console.log("유저를 찾을 수 없습니다.");
    }
}


const pageDueBtnNext = upcomingWrapper.querySelector('.next');
pageDueBtnNext.onclick = function () {
    let page = upcomingWrapper.querySelectorAll('.page-number');
    for (let i = 0; i < 3; i++) {
        page[i].innerText = (currentIdx + 1) * 3 + (i + 1);
        if (i === 0) {
            page[i].classList.add('active');
        } else {
            page[i].classList.remove('active');
        }
    }

    requestFetch();
};

const pageDueBtnPrev = upcomingWrapper.querySelector('.prev');
pageDueBtnPrev.onclick = function () {
    let page = upcomingWrapper.querySelectorAll('.page-number');
    for (let i = 0; i < 3; i++) {
        page[i].innerText = (currentIdx - 1) * 3 + (i + 1);

        if (i === 2) {
            page[i].classList.add('active');
        } else {
            page[i].classList.remove('active');
        }
    }
    requestFetch();

};