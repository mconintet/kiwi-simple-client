(function (W, $) {
    "use strict";

    if (!W['WebSocket']) {
        alert('Missing WebSocket APIs!');
    }

    var chatPanel = $('#chatPanel');
    var chatPanelBody = chatPanel.find('> .panel-body');
    var srvAddrInput = $('#srvAddrInput');
    var btnConnect = $('#btnConnect');
    var btnDisconnect = $('#btnDisconnect');
    var msgInput = $('#msgInput');
    var btnSend = $('#btnSend');

    var webSocket = null;

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    $.fn.extend({
        disable: function (btnVal) {
            return this.each(function () {
                if (btnVal) {
                    $(this).val(btnVal);
                }
                this.disabled = true;
            });
        },
        enable: function (btnVal) {
            return this.each(function () {
                if (btnVal) {
                    $(this).val(btnVal);
                }
                this.disabled = false;
            });
        }
    });

    var appendMsg = function (html) {
        chatPanel.stop();
        chatPanelBody.append(html);
        chatPanel.animate({scrollTop: chatPanel.get(0).scrollHeight}, 1000);
    };

    btnConnect.on('click', function () {
        var srvAddr = srvAddrInput.val().trim();
        if (!srvAddr) {
            toastr.error('Please input service URI.');
            return;
        }

        btnConnect.disable('Connecting...');
        try {
            webSocket = new WebSocket(srvAddr);

            $(webSocket).on('error', function (err) {
                toastr.error(err.toString());
                btnConnect.enable('Connect');
            });

            $(webSocket).on('open', function () {
                toastr.success('Connection opened.');
                btnConnect.disable('Connect');
                btnDisconnect.enable();
            });

            $(webSocket).on('close', function () {
                webSocket = null;
                toastr.success('Connection closed.');
                btnDisconnect.disable();
                btnConnect.enable('Connect');
            });

            $(webSocket).on('message', function (evt) {
                var html = Template.get('msgOther').render({msg: evt.originalEvent.data});
                appendMsg(html);
            });
        } catch (err) {
            webSocket = null;
            toastr.error(err.toString());
            btnDisconnect.disable();
            btnConnect.enable('Connect');
        }
    });

    btnDisconnect.on('click', function () {
        if (webSocket) webSocket.close();
    });

    btnSend.on('click', function () {
        if (!webSocket) {
            toastr.error('Please choose a service.');
            return;
        }

        var msg = msgInput.val().trim();
        if (!msg) return;

        var html = Template.get('msgMe').render({msg: msg});
        appendMsg(html);
        webSocket.send(msg);
    });
})(window, jQuery);