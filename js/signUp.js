

const idInput = document.querySelector('.id-input');
const emailInput = document.querySelector('.email-input');
const pwInput = document.querySelector('.pw-input');
const rePwInput = document.querySelector('.re-pw-input');
const pwMsg = document.querySelector('.re-pw-alert');
const signInBtn = document.querySelector('.sign-in-btn');
let url = "https://구독관리서비스.site";

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

const verifyEmail = document.querySelector('.verify-email');
const verifyCodeInput = document.querySelector('.verify-code');
const codeWrapper = document.querySelector('.code-wrapper');

verifyEmail.onclick = function () {
    const currentEmail = emailInput.value;
    fetch(`${url}/api/auth/email/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "email": `${currentEmail}`
        })
    });
    codeWrapper.classList.remove('hidden');
};


const codeCheck = document.querySelector('.code-check');
const codeError = document.querySelector('.code-error');
const reCode = document.querySelector('.re-code');
codeCheck.onclick = async function () {
    let verifyCode = verifyCodeInput.value;
    let response = await fetch(`${url}/api/auth/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "email": `${emailInput.value}`,
            "code": `${verifyCode}`
        })
    });

    if (response.status === 400) {
        codeError.classList.remove('hidden');
    } else if (response.status === 410) {
        codeError.querySelector('span').innerText = "인증 코드가 만료되었습니다.";
    }
};


signInBtn.onclick = async () => {
    const id = idInput.value;
    const email = emailInput.value;
    const pw = pwInput.value;
    const rePw = rePwInput.value;

    if (pw !== rePw) {
        alert("비밀번호가 일치하지 않습니다. 다시 확인해주세요.");
        rePwInput.focus();
        return;
    }

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

