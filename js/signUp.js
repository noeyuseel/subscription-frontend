const signInBtn = document.querySelector('.sign-in-btn');
signInBtn.onclick = function () {
    window.location.href = "/login";
};

const idInput = document.querySelector('.id-input');
const emailInput = document.querySelector('.email-input');
const pwInput = document.querySelector('.pw-input');
const rePwInput = document.querySelector('.re-pw-input');
const pwMsg = document.querySelector('.re-pw-alert');

function checkPassword() {
    if (pwInput.value === '' || rePwInput.value === '') {
        pwMsg.classList.add('hidden');
        return;
    }
    if (pwInput.value === rePwInput.value) {
        pwMsg.classList.add('hidden');
    } else { pwMsg.classList.remove('hidden'); }
}

pwInput.oninput = checkPassword;
rePwInput.oninput = checkPassword;

let url = "https://구독관리서비스.site";
signInBtn.onclick = async () => {
    const id = idInput.value;
    const email = emailInput.value;
    const pw = pwInput.value;
    const rePw = rePwInput.value;

    try {
        const response = await fetch(`${url}/api/user/join`, {
            method: 'POST',
            headers: {
                'content-Type': 'application/json'
            },
            body: JSON.stringify({
                "username": `${id}`,
                "email": `${email}`,
                "password": `${pw}`,
                "passwordConfirm": `${rePw}`
            })

        });

        if (response.status === 201) {
            window.location.href = "/login";
        } else {
            const errorContainer = document.querySelector('.re-pw-input');
            const json = await response.json();
            const errorMsg = `
                <div class='error-msg'> ${json.error}
                </div>`
            errorContainer.insertAdjacentHTML('afterend', errorMsg);
        }
    } catch (error) {
        console.log(error);
    }
};