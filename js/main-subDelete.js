const subListContainer = document.querySelector('.subListContainer');
subListContainer.addEventListener('click', async e => {
    const subList = e.target.closest('.sub-list');
    const savedId = subList.querySelector('.savedId').innerText;

    if (e.target.classList.contains('delete-btn')) {
        confirm("해당 구독 정보를 삭제하시겠습니까?");
        let token = localStorage.getItem('access');
        const param = {
            "subscriptionId": savedId
        };
        const queryString = new URLSearchParams(param).toString();

        const response = await fetch(`${url}/api/subscription?${queryString}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 204) {
            console.log("구독 정보 삭제 성공");
            window.location.reload();
        } else if (response.status === 404) {
            console.log("구독 정보를 찾을 수 없습니다.");

        } else if (response.status === 401) {
            let tokenReissue = await fetch(`${url}/api/auth/reissue`, {
                method: "POST",
                credentials: "include"
            });
            if (tokenReissue.status === 401) {
                window.location.href = "/login";
            } else if (tokenReissue.status === 200) {
                const tokenResult = await tokenReissue.json();
                localStorage.setItem('access', tokenResult.data.accessToken);
                const response2 = await fetch(`${url}/api/subscription?${queryString}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${tokenResult.data.accessToken}`
                    }
                });
                if (response2.status === 204) {
                    console.log("구독 정보 삭제 성공");
                    window.location.reload();
                } else if (response2.status === 404) {
                    console.log("구독 정보를 찾을 수 없습니다.");
                }

            }
        }
    }
});