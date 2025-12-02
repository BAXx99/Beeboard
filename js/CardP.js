document.addEventListener('DOMContentLoaded', function () {
    var quill = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: 'آيس لاتيه + اختيارات من الكوكيز',
        modules: {
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
});
