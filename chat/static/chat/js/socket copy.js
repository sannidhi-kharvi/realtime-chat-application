let input_message = $("#input-message");
let message_body = $("#messages");
let send_message_form = $("#send-message-form");

const USER_ID = $("#logged-in-user").val();

let loc = window.location;
let wsStart = "ws://";

if (loc.protocol === "https") {
    wsStart = "wss://";
}

let endpoint = wsStart + loc.host + loc.pathname;

var socket = new WebSocket(endpoint);

socket.onopen = async function (e) {
    console.log("open", e);

    // Adding new user
    $("#newuser").on("submit", function (e) {
        e.preventDefault();
        let adduser = $("#add-user").val();
        if (adduser == "") return false;
        let data = {
            sent_by: USER_ID,
            adduser: adduser,
        };
        data = JSON.stringify(data);
        socket.send(data);
        $(this)[0].reset();
    });

    $(".chat-list-item").on("click", function () {
        let send_to = get_active_other_user_id();
        let thread_id = get_active_thread_id();
        let ustatus = "2";
        let data = {
            sent_by: USER_ID,
            send_to: send_to,
            thread_id: thread_id,
            ustatus: ustatus,
        };
        data = JSON.stringify(data);
        socket.send(data);
    });

    send_message_form.on("submit", function (e) {
        e.preventDefault();
        let message = input_message.val();
        if ($.trim(message) === "") {
            return false;
        }
        let send_to = get_active_other_user_id();
        let thread_id = get_active_thread_id();
        let timestamp = getDateTime();
        let status = "1";
        let data = {
            message: message,
            sent_by: USER_ID,
            send_to: send_to,
            thread_id: thread_id,
            status: status,
            timestamp: timestamp,
        };
        data = JSON.stringify(data);
        socket.send(data);
        $(this)[0].reset();
    });
};

socket.onmessage = async function (e) {
    console.log("message", e);
    let data = JSON.parse(e.data);
    let message = data["message"];
    let sent_by_id = data["sent_by"];
    let thread_id = data["thread_id"];
    let date = data["date"];
    let ustatus = data["ustatus"];
    let adduser = data["adduser"];
    let adduser_id = data["adduser_id"];
    console.log(adduser_id);
    if (adduser != null) {
        addNewUser(adduser, adduser_id);
    } else if (message != null) {
        newMessage(message, sent_by_id, thread_id, date);

        $(".chat-list-item").each(function () {
            $('.chat-list-item[data-chat-id="' + thread_id + '"]')
                .parent()
                .prepend($('.chat-list-item[data-chat-id="' + thread_id + '"]'));
        });
    } else if (ustatus == 2) {
        statusUpdate(ustatus, sent_by_id, thread_id);
    }
};

socket.onerror = async function (e) {
    console.log("error", e);
};

socket.onclose = async function (e) {
    console.log("close", e);
};

function addNewUser(adduser, thread_id) {
    let clone = $("#add-contact #newchat .chat-list-item:first").clone();
    clone.attr("data-chat-id", thread_id);
    clone.find(".name").html(adduser);
    clone.appendTo("#add-contact #newchat");

    $("#newchat .chat-list-item").each(function () {
        $('.chat-list-item[data-chat-id="' + thread_id + '"]')
            .parent()
            .prepend($('.chat-list-item[data-chat-id="' + thread_id + '"]'));
    });
}

function newMessage(message, sent_by_id, thread_id) {
    if ($.trim(message) === "") {
        return false;
    }
    let chat_element;
    if ($('.messages-wrapper[data-chat-id="' + thread_id + '"] #mdate:last').text() != "TODAY") {
        let mdate_element = `<div class="mx-auto my-2 small py-1 px-2 rounded" id="mdate" style="background:#E1F3FB;">TODAY</div>`;
        $('.messages-wrapper[data-chat-id="' + thread_id + '"] #messages').append(mdate_element);
    }

    if (sent_by_id == USER_ID) {
        chat_element = `<i id="statuscheck" class="far fa-check mr-1"></i>${message}`;

        let clone = $('.messages-wrapper[data-chat-id="' + thread_id + '"] .align-self-end.message-item:first').clone();
        clone.find(".body").html(message);
        clone.find(".time.align-self-end").html(getTime() + '<i id="statuscheck" class="far fa-check"></i>');
        clone.appendTo('.messages-wrapper[data-chat-id="' + thread_id + '"] #messages');
    } else {
        chat_element = message;

        let clone = $('.messages-wrapper[data-chat-id="' + thread_id + '"] .align-self-start.message-item:first').clone();
        clone.find(".body").html(message);
        clone.find(".time.align-self-end").html(getTime());
        clone.appendTo('.messages-wrapper[data-chat-id="' + thread_id + '"] #messages');

        $('.chat-list-item[data-chat-id="' + thread_id + '"]').addClass("unread");
    }

    $('.chat-list-item[data-chat-id="' + thread_id + '"] #time').html(getTime());

    $('.chat-list-item[data-chat-id="' + thread_id + '"] .last-message').html(chat_element);

    scrollBottom();
    input_message.val(null);
}

function statusUpdate(ustatus, sent_by_id, thread_id) {
    if (!(sent_by_id == USER_ID)) {
        $('.chat-list-item[data-chat-id="' + thread_id + '"] #statuscheck').removeClass("fa-check");
        $('.chat-list-item[data-chat-id="' + thread_id + '"] #statuscheck').addClass("fa-check-double");
        $('.messages-wrapper[data-chat-id="' + thread_id + '"] #statuscheck').removeClass("fa-check");
        $('.messages-wrapper[data-chat-id="' + thread_id + '"] #statuscheck').addClass("fa-check-double");
    }
}
