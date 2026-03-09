const sortOpen = document.querySelector('.sort-open-btn');
const sortMenu = document.querySelector('#sort-dropdown-menu');
sortOpen.onclick = () => {
    sortMenu.classList.contains('hidden') ? sortMenu.classList.remove('hidden') : sortMenu.classList.add('hidden');
}

let currentSort = null;

sortMenu.addEventListener('click', async e => {
    const target = e.target.closest('.sort-option');
    if (!target) return;
    let currentDataSort = target.dataset.sort.toUpperCase();
    let currentDataOrder = target.dataset.order.toUpperCase();
    sortMenu.querySelectorAll('.sort-option').forEach(item => {
        if (item === target) {
            if (item.classList.contains('active')) {
                item.classList.remove('active');
                currentSort = null;
                findName.dispatchEvent(new Event('input'));
            } else {
                item.classList.add('active');
            }
            return;
        }
    });

    currentSort = `${currentDataSort}_${currentDataOrder}`;
    findName.dispatchEvent(new Event('input'));
})

const findName = document.querySelector('.my-service-search-input');
findName.oninput = async function () {
    let textValue = findName.value ? findName.value : "";

    const searchCondition = {
        "sortType": currentSort ? currentSort : "",
        "subscriptionName": textValue
    };

    const pageable = {
        "page": 0,
        "size": 10
    };

    const allParams = new URLSearchParams({
        ...searchCondition,
        ...pageable
    });
    let token = localStorage.getItem('access');
    let response = await fetch(`${url}/api/subscription/filter?${allParams.toString()}`, {
        method: "GET",
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
        let tokenReissue = await fetch(`${url}/api/auth/reissue`, {
            method: "POST",
            credentials: "include"
        });
        if (tokenReissue.status === 200) {
            let json = await tokenReissue.json();
            localStorage.setItem('access', json.data.accessToken);
            let response2 = await fetch(`${url}/api/subscription/filter?${allParams.toString()}`, {
                method: "GET",
                headers: { 'Authorization': `Bearer ${json.data.accessToken}` }
            });
            let response2Json = await response2.json();
            renderSubscriptionItems(response2Json.data.content, subscriptionList);
        } else if (tokenReissue.status === 401) {
            window.location.href = "/login";
        }

    } else if (response.status === 404) {
        console.log("유저를 찾을 수 없습니다.");
    } else if (response.status === 200) {
        let responseJson = await response.json();
        renderSubscriptionItems(responseJson.data.content, subscriptionList);
    }

}

const clearName = document.querySelector('.my-service-search-clear');
clearName.onclick = () => {
    findName.value = '';
    findName.dispatchEvent(new Event('input'));
}

