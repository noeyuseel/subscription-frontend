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
const category = document.querySelector('.service-item');
const inputDate = document.querySelector('#add-modal input[type="date"]');
const inputPrice = document.querySelector('#add-modal input[type="number"]');
const priceCycle = document.querySelector('.cycle-btn');
const cycleNumber = document.querySelector('.input-cycle');
const alarm = document.querySelector('.alert-btn');
const submitBtn = document.querySelector('.submit-service');

let selectedCycle = "월";


submitBtn.onclick = async function () {
    const name = inputName.value;
    const realdate = inputDate.value;
    const dday = new Date(realdate);
    const price = inputPrice.value;
    const cycle = selectedCycle;

    const token = localStorage.getItem('access');

    const response = await fetch(`${url}/api/subscription`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            "category": `${category}`,
            "name": `${name}`,
            "paymentCycle": `${cycle}`,
            "cycleInterval": `${cycleNumber}`,
            "dday": `${dday}`,
            "price": `${price}`,
            "alarm": [
                parseInt(alarm)
            ]
        })

    });
    if (response.status === 401) {
        const reissue = await fetch(`${url}/api/auth/reissue`, {
            method: "POST"
        });
        if (reissue.status === 401) {
            window.location.href = "/login";
        } else if (reissue.status === 200) {
            const reissueResult = await reissue.json();
            localStrage.setItem('access', reissueResult.data.accessToken);
            const againResponse = await fetch(`{url}/api/subscription`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${reissueResult.data.accessToken}`
                },
                body: JSON.stringify({
                    "category": `${category}`,
                    "name": `${name}`,
                    "paymentCycle": `${cycle}`,
                    "cycleInterval": `${cycleNumber}`,
                    "dday": `${dday}`,
                    "price": `${price}`,
                    "alarm": [
                        parseInt(alarm)
                    ]
                })
            });
            if (againResponse.status === 201) {
                modal.classList.add('hidden');
                console.log("저장 성공");
                window.location.reload();
            } else {
                console.log("유저를 찾을 수 없습니다");
            }
        }
    }
    if (response.status === 201) {
        modal.classList.add('hidden');
        console.log("저장 성공");
        window.location.reload();
    } else if (response.status === 404) {
        console.log("유저를 찾을 수 없습니다.")
    }
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
        if (text === "달마다") { text = "MONTH"; }
        else if (text === "년마다") { text = "YEAR"; }
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