const login = document.querySelector('.logout-btn');
login.onclick = async () => {
    if(login.innerText === "로그인") {
        window.location.href="/login";
    } else {
        const access = localStorage.getItem('access');
        const response = await fetch(`${url}/api/auth/logout`
            , {
                method: "Post",
                headers: { 'Authorization': `Bearer ${access}` },
                credentials: "include"
        });
        localStorage.removeItem('access');
        alert("로그아웃 되었습니다!");
        window.location.reload();
    }
}