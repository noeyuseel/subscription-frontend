function clearValidationErrors() {
    document.querySelectorAll('.field-error-message').forEach(el => el.remove());
    document.querySelectorAll('.field-error-target').forEach(el => {
        el.classList.remove('field-error-target');
    });
}

function clearFieldError(targetEl) {
    const container = targetEl.closest('.add-container');
    if (!container) return;

    const message = container.querySelector('.field-error-message');
    if (message) message.remove();

    const highlight = container.querySelector('.field-error-target');
    if (highlight) highlight.classList.remove('field-error-target');
}

function showValidationError(targetEl, message) {
    clearValidationErrors();

    const container = targetEl.closest('.add-container') || targetEl;

    const highlightTarget =
        targetEl.closest('.input-box') ||
        targetEl.closest('.service-list') ||
        targetEl.closest('.input-box-scroll') ||
        targetEl.closest('.cycle-select-row') ||
        targetEl.closest('.cycle-list') ||
        targetEl;

    highlightTarget.classList.add('field-error-target');

    const errorText = document.createElement('p');
    errorText.className = 'field-error-message';
    errorText.textContent = message;
    container.appendChild(errorText);

    container.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

    const focusTarget = targetEl.matches('input, button')
        ? targetEl
        : targetEl.querySelector('input, button');

    if (focusTarget) {
        setTimeout(() => {
            focusTarget.focus();
        }, 250);
    }

    return false;
}

function mapCycleTextToValue(text) {
    const pureText = text.replace(/[0-9]/g, '').trim();

    if (pureText === "달마다") return "MONTH";
    if (pureText === "년마다") return "YEAR";

    return "";
}

function getSelectedCycleValue() {
    const activeCycleBtn = document.querySelector('.cycle-btn.active');
    if (!activeCycleBtn) return "";
    return mapCycleTextToValue(activeCycleBtn.innerText);
}

function getSelectedAlarmValues() {
    const selectedAlarms = document.querySelectorAll('.alert-btn.active');
    const values = [];

    selectedAlarms.forEach(btn => {
        const text = btn.innerText.trim();

        if (text === "알람 없음") {
            values.push(0);
        } else {
            const num = parseInt(text, 10);
            if (!isNaN(num)) values.push(num);
        }
    });

    return values;
}

function resetModalForm() {
    clearValidationErrors();

    inputName.value = "";
    updateStatus.innerText = "false";

    const initCategory = serviceList.querySelectorAll('.service-item');
    initCategory.forEach(item => {
        item.classList.remove('active');
    });
    activeService = null;

    inputPrice.value = "";

    const initCycle = document.querySelectorAll('.cycle-btn');
    initCycle.forEach(item => {
        item.classList.remove('active');
    });
    selectedCycle = "";

    cycleNumber.value = "";
    inputDate.value = "";

    const initAlarms = document.querySelectorAll('.alert-btn');
    initAlarms.forEach(item => {
        item.classList.remove('active');
    });
    alarmList.length = 0;
}

addBtn.onclick = function () {
    const token = localStorage.getItem('access');

    if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = "/login";
        return;
    }

    modal.classList.remove('hidden');
    resetModalForm();
};

closeBtn.onclick = function () {
    modal.classList.add('hidden');
    clearValidationErrors();
};

let activeService = document.querySelector('.service-item.active');

serviceList.addEventListener('click', (e) => {
    if (!e.target.classList.contains('service-item')) return;

    const service = e.target.closest('.service-item');
    const currentActive = serviceList.querySelector('.service-item.active');

    if (currentActive) {
        currentActive.classList.remove('active');
    }

    service.classList.add('active');
    activeService = service;
    inputName.value = service.innerText;

    clearFieldError(serviceList);
    clearFieldError(inputName);
});

const alarms = document.querySelector('.input-box-scroll');
const alarmList = [];

alarms.addEventListener('click', (e) => {
    if (!e.target.classList.contains('alert-btn')) return;

    const currentAlarm = e.target.closest('.alert-btn');
    const currentText = currentAlarm.innerText.trim();

    if (currentAlarm.classList.contains('active')) {
        currentAlarm.classList.remove('active');

        if (currentText === "알람 없음") {
            const index = alarmList.indexOf(0);
            if (index !== -1) alarmList.splice(index, 1);
        } else {
            const num = parseInt(currentText, 10);
            const index = alarmList.indexOf(num);
            if (index !== -1) alarmList.splice(index, 1);
        }
    } else {
        if (currentText === "알람 없음") {
            const activeAlarms = document.querySelectorAll('.alert-btn.active');
            activeAlarms.forEach(alarm => {
                alarm.classList.remove('active');
            });

            alarmList.length = 0;
            currentAlarm.classList.add('active');
            alarmList.push(0);
        } else {
            const noAlarmBtn = Array.from(document.querySelectorAll('.alert-btn.active'))
                .find(alarm => alarm.innerText.trim() === "알람 없음");

            if (noAlarmBtn) {
                noAlarmBtn.classList.remove('active');
                const zeroIndex = alarmList.indexOf(0);
                if (zeroIndex !== -1) alarmList.splice(zeroIndex, 1);
            }

            currentAlarm.classList.add('active');

            const num = parseInt(currentText, 10);
            if (!isNaN(num) && !alarmList.includes(num)) {
                alarmList.push(num);
            }
        }
    }

    clearFieldError(alarms);
});

inputName.addEventListener('input', () => clearFieldError(inputName));
inputPrice.addEventListener('input', () => clearFieldError(inputPrice));
cycleNumber.addEventListener('input', () => clearFieldError(cycleNumber));
inputDate.addEventListener('change', () => clearFieldError(inputDate));

const cycleButtons = document.querySelectorAll('.cycle-btn');
let selectedCycle = "";

cycleButtons.forEach(btn => {
    btn.onclick = function () {
        cycleButtons.forEach(b => b.classList.remove('active'));

        this.classList.add('active');
        selectedCycle = mapCycleTextToValue(this.innerText);

        clearFieldError(this);
    };
});

submitBtn.onclick = async function () {
    clearValidationErrors();

    const name = inputName.value.trim();
    const realdate = inputDate.value;
    const dday = new Date(realdate);
    const price = inputPrice.value;
    const cycle = getSelectedCycleValue() || selectedCycle;
    const token = localStorage.getItem('access');
    const alarmValue = getSelectedAlarmValues();

    const selectedService = serviceList.querySelector('.service-item.active');
    let subId = document.querySelector('.subId').innerText;

    if (!name) {
        return showValidationError(inputName, "서비스명을 입력해주세요.");
    }

    if (!selectedService) {
        return showValidationError(serviceList, "서비스를 선택해주세요.");
    }

    if (!price) {
        return showValidationError(inputPrice, "결제 금액을 입력해주세요.");
    }

    if (!cycle) {
        return showValidationError(cycleButtons[0], "결제 주기를 선택해주세요.");
    }

    if (!cycleNumber.value) {
        return showValidationError(cycleNumber, "주기를 입력해주세요.");
    }

    const cycleValue = Number(cycleNumber.value);
    if (!Number.isInteger(cycleValue) || cycleValue < 1 || cycleValue > 11) {
        return showValidationError(cycleNumber, "주기는 1~11 사이의 정수로 입력해주세요.");
    }

    if (!realdate) {
        return showValidationError(inputDate, "결제일을 선택해주세요.");
    }

    if (isNaN(dday.getTime())) {
        return showValidationError(inputDate, "올바른 날짜를 선택해주세요.");
    }

    if (alarmValue.length === 0) {
        return showValidationError(alarms, "알림 설정을 선택해주세요.");
    }

    activeService = selectedService;

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
            return;
        }

        if (reissue.status === 200) {
            const reissueResult = await reissue.json();
            const newToken = reissueResult.data.accessToken;
            localStorage.setItem('access', newToken);

            let againResponse;

            if (updateStatus.innerText === "false") {
                againResponse = await fetch(`${url}/api/subscription`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newToken}`
                    },
                    body: requestJson
                });
            } else {
                againResponse = await fetch(`${url}/api/subscription`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newToken}`
                    },
                    body: requestJson
                });
            }

            if (againResponse.status === 200 || againResponse.status === 201) {
                modal.classList.add('hidden');
                console.log("저장 성공");
                window.location.reload();
                return;
            } else if (againResponse.status === 404) {
                console.log("유저를 찾을 수 없습니다.");
                return;
            } else {
                console.log("저장 실패");
                return;
            }
        }
    }

    if (response.status === 201 || response.status === 200) {
        modal.classList.add('hidden');
        console.log("저장 성공");
        window.location.reload();
    } else if (response.status === 404) {
        console.log("유저를 찾을 수 없습니다.");
    } else {
        console.log("저장 실패");
    }
};