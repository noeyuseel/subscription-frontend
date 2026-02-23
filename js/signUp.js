

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
const verifyEmailBtn = document.querySelector('.verify-email')

verifyEmail.onclick = async function () {
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9._]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailInput.value)) {
        alert("올바른 이메일을 입력해주세요");
        emailInput.focus();
        return;
    };
    const currentEmail = emailInput.value;
    try {
        await fetch(`${url}/api/auth/email/request-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": `${currentEmail}`
            })
        });
        codeWrapper.classList.remove('hidden');
        const emailMsg = `<p class="email-code-alert">인증 메일을 전송했어요</p>`
        const emailWrapper = document.querySelector('.email-wrapper');
        const oldMsg = emailWrapper.querySelector('.email-code-alert');
        if (oldMsg) oldMsg.remove();
        emailWrapper.insertAdjacentHTML('beforeend', emailMsg);
        verifyEmailBtn.innerText
            = "다시 보내기";
    } catch (err) {
        console.error("이메일 전송 실패", err);
    }
};


const codeError = document.querySelector('.code-error');
const reCode = document.querySelector('.re-code');
verifyCodeInput.oninput = async function () {
    const currentCode = verifyCodeInput.value;

    if (currentCode.length === 6) {
        let response = await fetch(`${url}/api/auth/email/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": emailInput.value,
                "code": currentCode
            })
        });

        if (response.status === 400) {
            codeError.classList.remove('hidden');
            codeError.querySelector('span').innerText = "코드가 일치하지 않습니다.";
        } else if (response.status === 410) {
            codeError.classList.remove('hidden');
            codeError.querySelector('span').innerText = "인증 코드가 만료되었습니다.";
        } else if (response.ok) {
            codeError.classList.add('hidden');
            const successVerifyMsg = `<p class="success-msg">인증 완료</p>`;
            const container = document.querySelector('.msg');
            container.innerHTML = successVerifyMsg;
        }
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

