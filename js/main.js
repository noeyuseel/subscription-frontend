let url = "https://구독관리서비스.site";
let logoutBtn = document.querySelector('.logout-btn');
logoutBtn.onclick = function () {
    const check = confirm('정말 로그아웃하시겠씁니까?');
    if (check) {
        alert("로그아웃 되었씁니다^^ 감사합니당 또 오세요");
        window.location.href = "/login";
    }
};