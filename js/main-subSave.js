addBtn.onclick = function () {
    const token = localStorage.getItem('access');
    if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = "/login";
        return;
    }
    modal.classList.remove('hidden');
    inputName.value = "";
    updateStatus.innerText = "false";
    const initCategory = serviceList.querySelectorAll('.service-item');
    initCategory.forEach(item => {
        item.classList.remove('active');
    });
    inputPrice.value = "";
    const initCycle = document.querySelectorAll('.cycle-btn');
    initCycle.forEach(item => {
        item.classList.remove('active');
    });
    inputDate.value = "";
    const initAlarms = document.querySelectorAll('.alert-btn');
    initAlarms.forEach(item => {
        item.classList.remove('active');
    });

};


closeBtn.onclick = function () {
    modal.classList.add('hidden');
}


let activeService = document.querySelector('.service-item.active');
serviceList.addEventListener('click', (e) => {
    if (e.target.classList.contains('service-item')) {
        const service = e.target.closest('.service-item');
        if (activeService) {
            activeService.classList.remove('active');
        }
        service.classList.add('active');
        activeService = service;
    }
});


const alarms = document.querySelector('.input-box-scroll');
const alarmList = [];
alarms.addEventListener('click', (e) => {
    if (e.target.classList.contains('alert-btn')) {
        const currentAlarm = e.target.closest('.alert-btn');
        if (currentAlarm.classList.contains('active')) {
            let index = alarmList.indexOf(parseInt(currentAlarm.innerText));
            currentAlarm.classList.remove('active');
            if (currentAlarm.innerText === "알람 없음") {
                index = alarmList.indexOf(0);
            }
            alarmList.splice(index, 1);
        } else {
            currentAlarm.classList.add('active');

            if (currentAlarm.innerText === "알람 없음") {
                const activeAlarms = document.querySelectorAll('.alert-btn.active');
                activeAlarms.forEach(activeAlarm => {
                    activeAlarm.classList.remove('active');
                });
                currentAlarm.classList.add('active');
                alarmList.length = 0;
                alarmList.push(0);
                return;
            } else {
                const activeAlarms = document.querySelectorAll('.alert-btn.active');
                activeAlarms.forEach((alarm) => {
                    if (alarm.innerText === "알람 없음") {
                        alarm.classList.remove('active');
                        alarmList.splice(alarmList.indexOf(0), 1);
                    }
                })
            }
            alarmList.push(parseInt(currentAlarm.innerText));
        }

    }

});


submitBtn.onclick = async function () {
    const name = inputName.value;
    const realdate = inputDate.value;
    const dday = new Date(realdate);
    const price = inputPrice.value;
    const cycle = selectedCycle;
    const token = localStorage.getItem('access');
    const alarmValue = alarmList;

    let subId = document.querySelector('.subId');
    if (!name || !realdate || !price || !cycle || !cycleNumber.value || !subId) {
        alert("모든 필수 정보를 입력해 주세요!");
        return;
    }
    if (isNaN(dday.getTime())) {
        alert("올바른 날짜를 선택해 주세요.");
        return;
    }
    subId = subId.innerText;
    const requestJson = JSON.stringify({
        "id": subId,
        "category": activeService.innerText,
        "name": name,
        "paymentCycle": cycle,
        "cycleInterval": cycleNumber.value,
        "dday": dday,
        "price": price,
        "alarm": alarmValue
    });
    let response;
    if (updateStatus.innerText === "false") {
        response = await fetch(`${url}/api/subscription`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: requestJson
        });
    } else {
        response = await fetch(`${url}/api/subscription`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: requestJson
        });
    }
    if (response.status === 401) {
        const reissue = await fetch(`${url}/api/auth/reissue`, {
            method: "POST",
            credentials: "include"
        });
        if (reissue.status === 401) {
            window.location.href = "/login";
        } else if (reissue.status === 200) {
            const reissueResult = await reissue.json();
            localStorage.setItem('access', reissueResult.data.accessToken);
            let againResponse;
            if (updateStatus.innerText === "false") {
                againResponse = await fetch(`${url}/api/subscription`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: requestJson
                });
            } else {
                againResponse = await fetch(`${url}/api/subscription`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: requestJson
                });
            }
            if (againResponse.status === 200 || againResponse.status === 201) {
                modal.classList.add('hidden');
                console.log("저장 성공");
                window.location.reload();
            } else {
                console.log("유저를 찾을 수 없습니다");
            }
        }
    }
    if ((response.status === 201 || response.status === 200)) {
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
let selectedCycle = "";
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