const loginBtn = document.querySelector('.login-btn');
const errorContainer = document.querySelector('.pw-input');
let url = "https://구독관리서비스.site";
let loginIdInput = document.querySelector('.id-input');
let loginPwInput = document.querySelector('.pw-input');
let google = document.querySelector('.google');
let naver = document.querySelector('.naver');
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

google.onclick = function () {
    window.location.href = "/oauth2/authorization/google";
};

naver.onclick = function () {
    window.location.href = "/oauth2/authorization/naver";
};

