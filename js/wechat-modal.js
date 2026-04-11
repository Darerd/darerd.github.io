$(document).ready(function () {
    var overlay = $('#wechat-qr-overlay');

    // 点击微信图标时显示弹窗
    $('.info-icon-wechat').on('click', function (e) {
        e.preventDefault();
        overlay.addClass('active');
    });

    // 点击关闭按钮或遮罩层时关闭弹窗
    overlay.on('click', function (e) {
        if (e.target === this || $(e.target).hasClass('wechat-qr-close')) {
            overlay.removeClass('active');
        }
    });

    // ESC 键关闭弹窗
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && overlay.hasClass('active')) {
            overlay.removeClass('active');
        }
    });
});
