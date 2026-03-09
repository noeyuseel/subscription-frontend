const aiRequest = document.querySelector('.ai-feature-btn');
aiRequest.onclick = () => {
    if (!localStorage.getItem('access')) {
        window.location.href = "/login";
    } else {
        window.location.href = "/ai-result";
    }
};
