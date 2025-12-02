function showPopup(url) {
    fetch(url)
    .then(response => response.text())
    .then(html => {
        const container = document.getElementById('popup-container');
        container.innerHTML = html;
        container.style.display = 'block';

        initializePopupCloseListeners();
    })
    .catch(error => console.error('خطأ في تحميل الصفحة المنبثقة:', error));
}
