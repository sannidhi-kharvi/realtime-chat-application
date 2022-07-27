const USER_ID = $('#logged-in-user').val();

let loc = window.location;
let wsStart = 'ws://';

if (loc.protocol === 'https') {
    wsStart = 'wss://';
}

let endpoint = wsStart + loc.host + loc.pathname;
var socket = new WebSocket(endpoint);

socket.onopen = async function (e) {
    console.log('open', e);

    // Send Message
    $('.send-message-form').on('submit', function (e) {
        e.preventDefault();
        let message = $('.message-wrapper.flex-column .send-message-form .input-message').val();
        if ($.trim(message) == '') {
            return false;
        }
        let send_to = getOtherUserId();
        let thread_id = getThreadId();
        let timestamp = getDateTime();
        let status = '1';
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

    // Send Image
    $('.preview-img-form').on('submit', function (e) {
        e.preventDefault();
        let send_to = getOtherUserId();
        let thread_id = getThreadId();
        let timestamp = getDateTime();
        let status = '1';
        $('.message-wrapper.flex-column .card-img-top').each(function () {
            let data = {
                sent_by: USER_ID,
                send_to: send_to,
                thread_id: thread_id,
                status: status,
                timestamp: timestamp,
                msg_img_message: $('.message-wrapper.flex-column .preview-img-block .input-message').val(),
                msg_img: $(this).attr('src'),
            };
            data = JSON.stringify(data);
            socket.send(data);
        });

        hidePreviewImgBlock();
    });

    // Add New User
    $('#newuser').on('submit', function (e) {
        e.preventDefault();
        let adduser = $('#add-user').val();
        adduser = $.trim(adduser);
        if (adduser == '') return false;
        let data = {
            sent_by: USER_ID,
            adduser: adduser,
        };
        data = JSON.stringify(data);
        socket.send(data);
        $(this)[0].reset();
    });

    // Update Message Status
    $('.contact-list-item').on('click', function () {
        let send_to = getOtherUserId();
        let thread_id = getThreadId();
        let ustatus = '2';
        let data = {
            sent_by: USER_ID,
            send_to: send_to,
            thread_id: thread_id,
            ustatus: ustatus,
        };
        data = JSON.stringify(data);
        socket.send(data);
    });

    // Update User Profile Name
    $('.input-name-button .fa-pen').on('click', function () {
        var prev = $('#input-name');
        var ro = prev.prop('readonly');
        prev.prop('readonly', !ro).focus();
        if (ro) {
            $(this).removeClass('fa-pen').addClass('fa-check');
            $('#input-name').css('border-bottom', '2px solid #00bfa5');
            profileName();
        } else {
            $(this).removeClass('fa-check').addClass('fa-pen');
            $('#input-name').css('border-bottom', 'none');
            $('.input-name-p').hide();

            profile_name = $('#input-name').val();
            profile_name = $.trim(profile_name);
            let data = {
                sent_by: USER_ID,
                profile_name: profile_name,
            };
            data = JSON.stringify(data);
            socket.send(data);
        }
    });

    // Update User Profile About
    $('.input-about-button .fa-pen').on('click', function () {
        var prev = $('#input-about');
        var ro = prev.prop('readonly');
        prev.prop('readonly', !ro).focus();
        if (ro) {
            $(this).removeClass('fa-pen').addClass('fa-check');
            $('#input-about').css('border-bottom', '2px solid #00bfa5');
            profileAbout();
        } else {
            $(this).removeClass('fa-check').addClass('fa-pen');
            $('#input-about').css('border-bottom', 'none');
            $('.input-about-p').hide();

            profile_about = $('#input-about').val();
            profile_about = $.trim(profile_about);
            let data = {
                sent_by: USER_ID,
                profile_about: profile_about,
            };
            data = JSON.stringify(data);
            socket.send(data);
        }
    });

    // Update User Profile Image
    $('#user-img-upload-file').change(function () {
        input = this;
        if (input.files && input.files[0]) {
            blob = input.files[0];
        }

        let reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('user-img-big').src = e.target.result;
            document.getElementById('user-img-small').src = e.target.result;

            let data = {
                sent_by: USER_ID,
                profile_img: document.getElementById('user-img-big').src,
            };
            data = JSON.stringify(data);
            socket.send(data);
        };
        reader.readAsDataURL(blob);
    });

    // User image remove
    $('#user-remove-photo').click(function (e) {
        if (confirm('Are you sure you want to delete?') == true) {
            let data = {
                sent_by: USER_ID,
                remove_img: 'True',
            };
            data = JSON.stringify(data);
            socket.send(data);
            document.getElementById('user-img-small').src = 'media/profile/default_profile.jpeg';
            document.getElementById('user-img-big').src = 'media/profile/default_profile.jpeg';
        } else {
            return false;
        }
    });
};

// Delete Message
function delMessage() {
    if (confirm('Are you sure you want to delete this message for everyone?') == true) {
        let send_to = getOtherUserId();
        let thread_id = getThreadId();
        chat_id = $('.message-wrapper.flex-column .message-item.show').attr('data-chat-id');
        let data = {
            sent_by: USER_ID,
            send_to: send_to,
            thread_id: thread_id,
            chat_id: chat_id,
        };
        data = JSON.stringify(data);
        socket.send(data);
    } else {
        return false;
    }
}

socket.onmessage = async function (e) {
    console.log('message', e);

    let data = JSON.parse(e.data);
    let message = data['message'];
    let sent_by_id = data['sent_by'];
    let thread_id = data['thread_id'];
    let new_chat_id = data['new_chat_id'];
    let ustatus = data['ustatus'];

    let adduser = data['adduser'];
    let adduser_id = data['adduser_id'];
    let adduser_img = data['adduser_img'];
    let adduser_about = data['adduser_about'];

    let profile_img = data['profile_img'];

    let msg_img = data['msg_img'];

    let chat_id = data['chat_id'];

    let profile_name = data['profile_name'];
    let profile_about = data['profile_about'];

    if (adduser != null) {
        newUser(adduser, adduser_id, adduser_img, adduser_about);
    } else if (message != null) {
        newMessage(sent_by_id, thread_id, new_chat_id, message, msg_img);
    } else if (msg_img != null) {
        newMessage(sent_by_id, thread_id, new_chat_id, message, msg_img);
    } else if (ustatus == 2) {
        statusUpdate(ustatus, sent_by_id, thread_id);
    } else if (profile_img != null) {
        profileImgUpdate(sent_by_id, profile_img);
    } else if (profile_name != null) {
        profileNameUpdate(sent_by_id, profile_name);
    } else if (profile_about != null) {
        profileAboutUpdate(sent_by_id, profile_about);
    } else if (chat_id != null) {
        deleteMessage(chat_id);
    }
};

socket.onerror = async function (e) {
    console.log('error', e);
};

socket.onclose = async function (e) {
    console.log('close', e);
};

function newMessage(sent_by_id, thread_id, new_chat_id, message, msg_img) {
    let chat_element;
    let message_element;

    $('.contact-list-item').each(function () {
        $('.contact-list-item[data-thread-id="' + thread_id + '"]')
            .parent()
            .prepend($('.contact-list-item[data-thread-id="' + thread_id + '"]'));
    });

    if (sent_by_id == USER_ID) {
        chat_element = `<i id="status-check" class="far fa-check mr-1"></i>`;
        if (msg_img) {
            chat_element += `<i class="far fa-camera mr-1"></i>${message}`;
        } else {
            chat_element += message;
        }
        message_element = `
        <div class="align-self-end self p-1 my-1 mx-4 rounded shadow-sm message-item" data-chat-id="${new_chat_id}">
            <a class="nav-link dropdown-toggle options" data-toggle="dropdown" href="javascript:void(0)" role="button" aria-haspopup="true" aria-expanded="false"><i class="fas fa-angle-down text-muted mr-2"></i></a>
            <div class="dropdown-menu dropdown-menu-right" style="margin-right:15%;margin-top:-10%;">`;
        if (msg_img) {
            message_element += `<a class="dropdown-item" href="javascript:void(0)" onclick="imgDownload(this)">Download</a>`;
        }
        message_element += `
                <a class="dropdown-item" href="javascript:void(0)" onclick="delMessage()">Delete</a>
            </div>`;

        if (msg_img) {
            message_element += `<div class="msg-image"><img src="media/${msg_img}" draggable="false"></div>`;
        }

        message_element += `
            <div class="d-flex flex-row">
                <div class="msg-body m-1 mr-3">${message}</div>
                <div class="msg-time ml-auto small text-right flex-shrink-0 align-self-end text-muted">
                    ${getTime()}
                    <i id="status-check" class="far fa-check"></i>
                </div>
            </div>
        </div>`;

        scrollBottom();
    } else {
        if (msg_img) {
            chat_element = `<i class="far fa-camera mr-1"></i>${message}`;
        } else {
            chat_element = message;
        }
        message_element = `
        <div class="align-self-start p-1 my-1 mx-4 rounded bg-white shadow-sm message-item" data-chat-id="${new_chat_id}">
            `;
        if (msg_img) {
            message_element += `
                <a class="nav-link dropdown-toggle options" data-toggle="dropdown" href="javascript:void(0)" role="button" aria-haspopup="true" aria-expanded="false"><i class="fas fa-angle-down text-muted mr-2"></i></a>
                <div class="dropdown-menu dropdown-menu-right" style="margin-right:15%;margin-top:-10%;">
                    <a class="dropdown-item" href="javascript:void(0)" onclick="imgDownload(this)">Download</a>
                </div>
                <div class="msg-image"><img src="media/${msg_img}" draggable="false"></div>`;
        }
        message_element += `
            <div class="d-flex flex-row">
                <div class="msg-body m-1 mr-3">${message}</div>
                <div class="msg-time ml-auto small text-right flex-shrink-0 align-self-end text-muted">
                    ${getTime()}
                </div>
            </div>
        </div>`;

        $('.contact-list-item[data-thread-id="' + thread_id + '"]').addClass('unread');
        unread_count = $('.contact-list-item[data-thread-id="' + thread_id + '"] #unread-count').text();
        if (unread_count == '') {
            $('.contact-list-item[data-thread-id="' + thread_id + '"] .flex-grow-1.text-right').append('<div class="badge badge-success badge-pill small" id="unread-count">1</div>');
        } else {
            unread_count = parseInt(unread_count) + 1;
            $('.contact-list-item[data-thread-id="' + thread_id + '"] #unread-count').html(unread_count);
        }
    }

    if (message == '') {
        chat_element += 'Photo';
    }

    if ($('.message-wrapper[data-thread-id="' + thread_id + '"] #msg-date:last').text() != 'TODAY') {
        let msg_date_element = `<div class="mx-auto my-2 small py-1 px-2 rounded" id="msg-date" style="background:#E1F3FB;">TODAY</div>`;
        $('.message-wrapper[data-thread-id="' + thread_id + '"] #messages').append(msg_date_element);
    }

    $('#contact-list').prepend($('#new-contact .contact-list-item[data-thread-id="' + thread_id + '"]'));
    hideAddContact();

    $('.contact-list-item[data-thread-id="' + thread_id + '"]').attr('data-chat-id', new_chat_id);
    $('.contact-list-item[data-thread-id="' + thread_id + '"] #msg-time').html(getTime());

    $('.contact-list-item[data-thread-id="' + thread_id + '"] .last-message')
        .html(chat_element)
        .attr('title', message);

    $('.message-wrapper[data-thread-id="' + thread_id + '"] #messages').append(message_element);

    scrollButton();
    $('.message-wrapper.flex-column .input-message').val(null);
}

function deleteMessage(chat_id) {
    $('.message-item[data-chat-id="' + chat_id + '"] .options').remove();
    $('.contact-list-item[data-chat-id="' + chat_id + '"] .last-message')
        .html('This message was deleted')
        .attr('title', 'This message was deleted');
    $('.message-item[data-chat-id="' + chat_id + '"] .msg-body')
        .html('This message was deleted')
        .addClass('text-muted');
    $('.message-item[data-chat-id="' + chat_id + '"] .msg-time .fa-check').remove();
    $('.message-item[data-chat-id="' + chat_id + '"] .msg-time .fa-check-double').remove();
    $('.message-item[data-chat-id="' + chat_id + '"] .msg-image').remove();

    scrollButton();
}

function statusUpdate(ustatus, sent_by_id, thread_id) {
    if (!(sent_by_id == USER_ID)) {
        $('.contact-list-item[data-thread-id="' + thread_id + '"] #status-check')
            .removeClass('fa-check')
            .addClass('fa-check-double');
        $('.message-wrapper[data-thread-id="' + thread_id + '"] #status-check')
            .removeClass('fa-check')
            .addClass('fa-check-double');
    }
}

function newUser(adduser, thread_id, adduser_img, adduser_about) {
    let adduser_element = `
        <div class="d-flex flex-row border-bottom w-100 p-2 contact-list-item" data-thread-id="${thread_id}">
            <img src="media/${adduser_img}" class="img-rounded rounded-circle mr-2" draggable="false">
            <div class="w-50">
                <div class="name">${adduser}</div>
                <div class="text-muted last-message" data-toggle="tooltip" title=""></div>
            </div>
            <div class="flex-grow-1 text-right">
                <div class="small msg-time text-muted" id="msg-time"></div>
                <div class="badge badge-success badge-pill small" id="unread-count"></div>
            </div>
        </div>`;

    $('#new-contact').append(adduser_element);

    $('#new-contact .contact-list-item').each(function () {
        $('.contact-list-item[data-thread-id="' + thread_id + '"]')
            .parent()
            .prepend($('.contact-list-item[data-thread-id="' + thread_id + '"]'));
    });
    location.reload();
}

function profileImgUpdate(sent_by_id, profile_img) {
    $('.contact-list-item[data-other-user-id="' + sent_by_id + '"] .img-rounded').attr('src', 'media/' + profile_img + '?' + new Date().getTime());
    $('.message-wrapper[data-other-user-id="' + sent_by_id + '"] .img-rounded').attr('src', 'media/' + profile_img + '?' + new Date().getTime());
}

function profileNameUpdate(sent_by_id, profile_name) {
    $('.message-wrapper[data-other-user-id="' + sent_by_id + '"] #other-name').html(profile_name);
}

function profileAboutUpdate(sent_by_id, profile_about) {
    $('.message-wrapper[data-other-user-id="' + sent_by_id + '"] #other-about').html(profile_about);
}

document.querySelector('#message-area').onpaste = function (e) {
    let input = e.clipboardData.items[0];
    if (input.type.includes('image')) {
        createPreview(input.getAsFile());
    }
};

$('.msg-img-upload-file, .add-img-upload-file').change(function () {
    for (var i = 0; i < $(this).get(0).files.length; ++i) {
        createPreview($(this).get(0).files[i]);
    }
});

// Drag Drop
$('#message-area').on('dragenter', function (e) {
    $('#message-area').css('filter', 'blur(2px)');
});

$('#message-area').on('dragleave', function (e) {
    $('#message-area').css('filter', 'blur(0px)');
});

$('#message-area').on('drop', function (e) {
    // Dropping files
    e.preventDefault();
    e.stopPropagation();
    // Clear previous messages
    // $("#messages").empty();
    if (e.originalEvent.dataTransfer) {
        if (e.originalEvent.dataTransfer.files.length) {
            let droppedFiles = e.originalEvent.dataTransfer.files;
            for (let i = 0; i < droppedFiles.length; i++) {
                input = droppedFiles[i];
                createPreview(input);
            }
        }
    }
    $('#message-area').css('filter', 'blur(0px)');
    return false;
});

$('#message-area').on('dragover', function (e) {
    e.preventDefault();
});

// Image Select Preview
function createPreview(input) {
    let blob;
    if (input.files && input.files[0]) {
        blob = input.files[0];
    } else {
        blob = input;
    }
    $('.message-wrapper.flex-column .input-message').val('');
    $('.message-wrapper.flex-column .preview-img-block').removeClass('d-none').addClass('d-flex');

    let reader = new FileReader();
    reader.onload = function (e) {
        $('.message-wrapper.flex-column .preview-big-img').attr('src', e.target.result);

        let image = $('.message-wrapper.flex-column .preview-big-img').attr('src');
        let imgcard = `
        <div class="card ml-2 img-small" data-image="">
            <img src="${image}" class="card-img-top" style="height: 100%;" draggable="false"/>
            <i class="far fa-times" onclick="removeImage(this)"></i>
        </div>`;
        $('.preview-small-img').append(imgcard);

        // var rowpos = $('.d-flex.flex-row .img-small:last').position();
        // console.log(rowpos)
        // $('.preview-small-img').scrollTop(rowpos.bottom);
        let img_numbers = $('.message-wrapper.flex-column .preview-small-img .card-img-top').length;
        $('.message-wrapper.flex-column .image-count').text(img_numbers);
    };
    reader.readAsDataURL(blob);

    // if(img_numbers >= 30){
    //     return false
    // }
}

function removeImage(e) {
    $(e).parent().remove();
    let last_img = $('.message-wrapper.flex-column .img-small:last .card-img-top').attr('src');
    $('.message-wrapper.flex-column .preview-big-img').attr('src', last_img);
    let img_numbers = $('.message-wrapper.flex-column .preview-small-img .card-img-top').length;
    $('.message-wrapper.flex-column .image-count').text(img_numbers);
    if (img_numbers < 1) {
        hidePreviewImgBlock();
    }
}
