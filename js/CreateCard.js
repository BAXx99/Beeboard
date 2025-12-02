document.addEventListener('DOMContentLoaded', function() {
    const normalCardBtn = document.querySelector('.card-type-option[data-type="normal"]');
    const cardTypeModal = document.querySelector('.card-type-modal');
    const createCardModal = document.querySelector('.overlay'); // نافذة إنشاء البطاقة
    const addCardBtn = document.querySelector('.add-btn');
    const cancelBtns = document.querySelectorAll('.cancel-btn, #cancelCardType');

    // عند الضغط على "بطاقة عادية"
    normalCardBtn.addEventListener('click', function() {
        cardTypeModal.style.display = 'none';
        createCardModal.style.display = 'flex';
    });

    // إلغاء وإغلاق أي نافذة
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            cardTypeModal.style.display = 'none';
            createCardModal.style.display = 'none';
        });
    });

    // عند الضغط على "إضافة بطاقة"
    addCardBtn.addEventListener('click', function() {
        const cardName = document.querySelector('.input-group input').value.trim();
        const cardDesc = document.querySelector('#editor-container .ql-editor').innerHTML;
        const cardComment = document.querySelector('.comment-section input').value.trim();

        if (!cardName) {
            alert('يرجى إدخال اسم البطاقة');
            return;
        }

        // إرسال البيانات إلى الـ API
        fetch('https://beeboard-production-b072.up.railway.app/api/card/${sub_bar_id}',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('beeboard_jwt_token')}`
            },
            body: JSON.stringify({
                name: cardName,
                description: cardDesc,
                comment: cardComment
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log('تم إنشاء البطاقة:', data);
            createCardModal.style.display = 'none';
            // هنا ممكن تضيف الكارت الجديد للقائمة بدون إعادة تحميل الصفحة
        })
        .catch(err => console.error(err));
    });
});
