function initializePopupCloseListeners() {
    const container = document.getElementById('popup-container');

    container.querySelectorAll('.popup-btn.cancel').forEach(btn => {
        btn.addEventListener('click', hideCurrentPopup);
    });

    container.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', hideCurrentPopup);
    });

    const cancelCardType = container.querySelector('#cancelCardType');
    if (cancelCardType) {
        cancelCardType.addEventListener('click', hideCurrentPopup);
    }
}
 function hideCurrentPopup() {
    const container = document.getElementById('popup-container');
    container.style.display = 'none'; // مثال على الإخفاء
  }
