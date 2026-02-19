let logoutBtn = document.querySelector('.logout-btn');
logoutBtn.onclick = function () {
    const check = confirm('정말 로그아웃하시겠씁니까?');
    if (check) {
        alert("로그아웃 되었씁니다^^ 감사합니당 또 오세요");
        window.location.href = "/login";
    }
};

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


const mainBox = document.querySelectorAll('.main-box')[1];
mainBox.onclick = function (event) {
    if (event.target.classList.contains('delete-btn')) {
        const targetBox = event.target.closest('.sub-box2');
        targetBox.remove();
        refreshTotal();
    }
};

const addBtn = document.querySelector('.add-service-btn');
const modal = document.querySelector('#add-modal');
const closeBtn = document.querySelector('.close-btn');

addBtn.onclick = function () {
    modal.classList.remove('hidden');
};

closeBtn.onclick = function () {
    modal.classList.add('hidden');
}

const inputName = document.querySelector('#add-modal input[type="text"]');
const inputDate = document.querySelector('#add-modal input[type="date"]');
const inputPrice = document.querySelector('#add-modal input[type="number"]');
const priceCycle = document.querySelector('.cycle-btn');
const submitBtn = document.querySelector('.submit-service');

let selectedCycle = "월";


submitBtn.onclick = function () {
    const name = inputName.value;
    const realdate = inputDate.value;
    const date = new Date(realdate).getDate();
    const price = inputPrice.value;
    const cycle = selectedCycle;
    const newBoxHtml = `
            <div class="sub-box2">
                <img class="mini-icon"></img>
                <p class="service-name">${name}</p>
                <p class="pay-date">매${cycle} ${date}일</p>
                <p class="service-price">${Number(price).toLocaleString()}원</p>
                <button class="delete-btn">X</button>
            </div>
            `
    const subListBox = document.querySelectorAll('.main-box')[1];
    subListBox.insertAdjacentHTML('beforeend', newBoxHtml);
    refreshTotal();

    modal.classList.add('hidden');

    const targetDate = new Date(realdate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let badgeColor = ""
    if (dDay === 1) {
        badgeColor = 'd-day-red';
    } else if (dDay <= 3) {
        badgeColor = 'd-day-yellow';
    } else if (dDay <= 7) {
        badgeColor = 'd-day-green';
    }

    const refreshUpdateItem = `
    <div class="sub-box1 id=upcoming-list">
        <span class="badge ${badgeColor}">D-${dDay}</span>
        <p class="upcoming-item">${name}</p>
        <p item-price>${Number(price).toLocaleString()}+원</p>
        <p item-date>${targetDate.getMonth() + 1}/${targetDate.getDate()}</p>
    </div>
`
    const upcomingBox = document.querySelectorAll('.main-box')[0];
    upcomingBox.insertAdjacentHTML('beforeend', refreshUpdateItem)
}

const serviceItems = document.querySelectorAll('.service-item');
serviceItems.forEach(item => {
    item.onclick = function () {
        inputName.value = this.innerText;
    };
});

const cycleButtons = document.querySelectorAll('.cycle-btn');

cycleButtons.forEach(btn => {
    btn.onclick = function () {
        cycleButtons.forEach(b => b.classList.remove('active'));

        this.classList.add('active');

        let text = this.innerText.replace(/[0-9]/g, '');
        if (text === "개월") text = "월";
        selectedCycle = text;
    };
});

const alertBtns = document.querySelectorAll('.alert-btn');
alertBtns.forEach(btn => {
    btn.onclick = function () {
        alertBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    };
});