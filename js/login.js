const loginBtn = document.querySelector('.login-btn');
const errorContainer = document.querySelector('.pw-input');
let url = "https://구독관리서비스.site";
let loginIdInput = document.querySelector('.id-input');
let loginPwInput = document.querySelector('.pw-input');
let google = document.querySelector('.google');
let naver = document.querySelector('.naver');
let kakao = document.querySelector('.kakao');
loginBtn.onclick = async () => {
    const idInput = loginIdInput.value;
    const pwInput = loginPwInput.value;
    try {
        const response = await fetch(`${url}/api/auth/login`, {

            method: 'POST',
            credentials: "include",
            headers: { 'content-Type': 'application/json' },
            body: JSON.stringify({
                "username": `${idInput}`,
                "password": `${pwInput}`
            })
        });

        if (response.status === 200) {
            const result = await response.json();
            localStorage.setItem('access', result.data.accessToken);
            window.location.href = "/main.html"
        } else {
            const errorMsg = document.querySelector('.error-msg');
            errorMsg.classList.remove('hidden');
        }
    } catch (error) { console.log(error); }
};

const loginInput = document.querySelector('.app');
loginInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

google.onclick = function () {
    window.location.href = "/oauth2/authorization/google";
};

naver.onclick = function () {
    window.location.href = "/oauth2/authorization/naver";
};

kakao.onclick = function () {
    window.location.href = "/oauth2/authorization/kakao";
};

document.addEventListener('DOMContentLoaded', async () => {
    let tokenReissue = await fetch(`${url}/api/auth/reissue`, {
        method: "POST",
        credentials: "include"
    });

    if (tokenReissue.status === 200) {
        let json = await tokenReissue.json();
        let newToken = json.data.accessToken;
        localStorage.setItem('access', newToken);
        window.location.href = "/";
    } else {
        return;
    }
});