const subList = document.querySelector('.subListContainer');
subList.addEventListener('click', e => {
    if (e.target.classList.contains('pencilImg')) {
        const updateStatus = modal.querySelector('.updateStatus');
        updateStatus.innerText = true;

        modal.classList.remove('hidden');

        const target = e.target.closest(".sub-list");

        const savedId = target.querySelector('.savedId');
        const subId = document.querySelector('.subId');
        subId.innerText = savedId.innerText;
        const savedName = target.querySelector('.service-name').innerText;
        inputName.value = savedName;

        const savedCategory = target.querySelector('.savedCategory').innerText;
        const categoryList = document.querySelectorAll('.service-list .service-item');
        categoryList.forEach(category => {
            if (category.innerText == savedCategory) {
                category.classList.add('active');
            } else {
                category.classList.remove('active');
            }
        });
        const price = target.querySelector('.service-price');
        const parsedPrice = price.innerText.replace('원', '').replaceAll(',', '');
        inputPrice.value = parsedPrice;

        const savedCycle = target.querySelector('.pay-date').innerText.includes("년");
        const cycleList = document.querySelectorAll('.cycle-list .cycle-btn');
        cycleList.forEach(cycleActive => {
            if (savedCycle) {
                if (cycleActive.innerText === "달마다") {
                    cycleActive.classList.remove('active');
                } else if (cycleActive.innerText === "년마다") {
                    cycleActive.classList.add('active');
                }
            }
        });
        const savedInterval = target.querySelector('.savedInterval');
        cycleNumber.value = savedInterval.innerText;

        const savedDday = target.querySelector('.savedDday');
        inputDate.value = savedDday.innerText;

        const savedAlarms = target.querySelector('.savedAlarms').innerText;
        const savedAlarmList = savedAlarms.split(",");
        const alarmListContainer = document.querySelectorAll('.alert-btn');
        alarmListContainer.forEach(alarm => {
            const parseIntAlarm = alarm.innerText === "알람 없음" ? 0 : parseInt(alarm.innerText);
            savedAlarmList.forEach(save => {
                if (parseIntAlarm === parseInt(save)) {
                    alarm.classList.add('active');
                    alarmList.push(parseIntAlarm);
                }
            })
        });

    }
});