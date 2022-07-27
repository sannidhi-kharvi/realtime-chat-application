// Form submit on Enter
$(".message-wrapper.flex-column .input-message").keypress(function (e) {
    if (e.which == 13) {
        $(".send-message-form").submit();
        return false;
    }
});

// Contact Search
$(".contact-search-field").keyup(function () {
    // Retrieve the search text and reset the count to zero
    escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    var filter = escape($(this).val());
    $(".contact-list-item .name").each(function () {
        if ($(this).text().search(new RegExp(filter, "i")) < 0) {
            $(this).parent().parent().addClass("d-none");
            $(this).parent().parent().removeClass("d-flex");
        } else {
            $(this).parent().parent().removeClass("d-none");
            $(this).parent().parent().addClass("d-flex");
        }
    });
});

// New Contact Search
$("#new-contact-search-field").keyup(function () {
    // Retrieve the search text and reset the count to zero
    escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    var filter = escape($(this).val());
    $("#add-contact .name").each(function () {
        if ($(this).text().search(new RegExp(filter, "i")) < 0) {
            $(this).parent().parent().addClass("d-none");
            $(this).parent().parent().removeClass("d-flex");
        } else {
            $(this).parent().parent().removeClass("d-none");
            $(this).parent().parent().addClass("d-flex");
        }
    });
});

// Message Search
$("#message-search.form-control").keyup(function () {
    let thread_id = getThreadId();
    // Retrieve the search text and reset the count to zero
    escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    var filter = escape($(this).val());
    $($('.message-wrapper[data-thread-id="' + thread_id + '"] #messages .msg-body')).each(function () {
        if (filter == "") {
            $(this).parent().parent().css("background", "#fff");
        } else {
            if ($(this).text().search(new RegExp(filter, "i")) < 0) {
                $(this).parent().parent().css("background", "#fff");
            } else {
                $(this).parent().parent().css("background", "#8fdf53");
            }
        }
    });
});

$(".searchdrop").click(function (e) {
    e.stopPropagation();
});

// Convert Date to WeekDays
var msg_date_element = [];
i = 0;
$(".message-wrapper #msg-date").each(function () {
    msg_date_element[i++] = $(this).text().trim();
});
for (i = 0; i < msg_date_element.length; i++) {
    let weekDay = getWeekDays(msg_date_element[i]);
    if (weekDay != "") {
        $("div[value|='" + msg_date_element[i] + "']").html(weekDay);
    }
}

let areaSwapped = false;
// let bottom;
$(".contact-list-item").on("click", function () {
    let thread_id = $(this).attr("data-thread-id");

    $(".overlay").removeClass("d-flex").addClass("d-none");
    $("#message-area").removeClass("d-none");

    hideOtherUserProfile();

    $(".message-wrapper.flex-column").removeClass("d-sm-flex").addClass("d-none").removeClass("flex-column");
    $('.message-wrapper[data-thread-id="' + thread_id + '"]')
        .addClass("d-sm-flex")
        .removeClass("d-none")
        .addClass("flex-column");

    // //Date sticky top
    // $("div[value|='"+msg_date_element[msg_date_element.length - 1]+"']").addClass("sticky-top");

    if ($(window).width() <= 575) {
        $(".contact-list-item.active").removeClass("active");
        $("#contact-list-area").removeClass("d-flex").addClass("d-none");
        $(".message-wrapper.flex-column").removeClass("d-none").addClass("d-flex");
        areaSwapped = true;
    }
    $(".contact-list-item.active").removeClass("active");
    $(this).addClass("active");

    $(".contact-list-item.active").removeClass("unread");
    $(".contact-list-item.active #unread-count").remove();

    $('.message-wrapper[data-thread-id="' + thread_id + '"] #messages').scrollTop($('.message-wrapper[data-thread-id="' + thread_id + '"] #messages')[0].scrollHeight);

    $(".message-wrapper.flex-column .input-message").focus();
});

function showChatList() {
    if (areaSwapped) {
        mobileview();
        $(".contact-list-item.active").removeClass("active");
        $("#contact-list-area").removeClass("d-none").addClass("d-flex");
        $(".message-wrapper.flex-column").removeClass("d-flex").addClass("d-none");
        areaSwapped = false;
    }
}

function getDateTime() {
    var dt = new Date();
    var date = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + ("0" + dt.getDate()).slice(-2) + " " + ("0" + dt.getHours()).slice(-2) + ":" + ("0" + dt.getMinutes()).slice(-2) + ":" + ("0" + dt.getSeconds()).slice(-2);
    return date;
}

function currentDate(date) {
    var cdate = new Date(date);
    var month = cdate.getMonth() + 1;
    var date = cdate.getDate();
    var year = cdate.getFullYear();
    return year + "-" + month + "-" + date;
}

function getTime() {
    var dt = new Date();
    var hours = dt.getHours();
    var minutes = dt.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
}

function getWeekDays(date) {
    dt = new Date(date);
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    if (dt.toDateString() == new Date().toDateString()) {
        date_weekday = "TODAY";
        // } else if (dt.toDateString() == new Date().getDateTime() - 1) {
        //     date_weekday = "YESTERDAY";
    } else if (dt > getDateBefore()) {
        date_weekday = days[dt.getDay()].toUpperCase();
    } else {
        date_weekday = "";
    }
    return date_weekday;
}

function getDateBefore(days = 7) {
    daysInMs = days * 24 * 60 * 60 * 1000;
    return new Date(Date.now() - daysInMs);
}

// Scroll Bottom Button
$(".scroll-bottom").on("click", function () {
    scrollBottom();
});

function scrollBottom() {
    let thread_id = getThreadId();
    $('.message-wrapper[data-thread-id="' + thread_id + '"] #messages').animate({ scrollTop: $('.message-wrapper[data-thread-id="' + thread_id + '"] #messages')[0].scrollHeight }, 1000);
}

// Scroll down Button Fade in-out
$(".scroll-bottom").css("opacity", "0");
$(".messages").scroll(function () {
    scrollButton();
});

function scrollButton() {
    let bottom = $(".message-wrapper.d-sm-flex.flex-column .messages")[0].scrollHeight - 600;
    let bottomPos = $(".message-wrapper.d-sm-flex.flex-column .messages").scrollTop();
    if (bottomPos < bottom) {
        $(".scroll-bottom").css("opacity", "1");
    } else {
        $(".scroll-bottom").css("opacity", "0");
    }
}

function showUserProfile() {
    $("#user-profile").css("left", 0);
}

function hideUserProfile() {
    $("#user-profile").css("left", "-110%");
}

function showAddContact() {
    $("#add-contact").css("left", 0);
}

function hideAddContact() {
    $("#add-contact").css("left", "-110%");
}

function showOtherUserProfile() {
    $(".message-wrapper.flex-column #other-user-profile").removeClass("d-none").addClass("d-flex");
}

function hideOtherUserProfile() {
    $(".message-wrapper.flex-column #other-user-profile").removeClass("d-flex").addClass("d-none");
}

function showPreviewImgBlock() {
    $(".message-wrapper.flex-column .input-message").val("");
    $(".message-wrapper.flex-column .preview-img-block").removeClass("d-none").addClass("d-flex");
}

function hidePreviewImgBlock() {
    $(".message-wrapper.flex-column .input-message").val("");
    $(".message-wrapper.flex-column .preview-img-block").removeClass("d-flex").addClass("d-none");
    $(".img-small").remove();
}

function showSettings() {
    $("#settings").css("left", 0);
}

function hideSettings() {
    $("#settings").css("left", "-110%");
}

function closeChat() {
    $(".overlay").removeClass("d-none").addClass("d-flex");
    $(".contact-list-item.active").removeClass("active");
    showChatList();
}

$(".dropdown-menu").click(function () {
    $("#user-img-big").text($(this).text());
});

$("#user-img-upload").click(function () {
    $("#user-img-upload-file").trigger("click");
});

$(".msg-img-upload").click(function () {
    $(".message-wrapper.flex-column .msg-img-upload-file").trigger("click");
});

$(".add-img-upload").click(function () {
    $(".message-wrapper.flex-column .add-img-upload-file").trigger("click");
});

$("#profile-dropdown").mouseenter(function () {
    $("#user-img-big").css("filter", "blur(5px)");
});

$(".profile-change img,.profile-change p").mouseenter(function () {
    $(".profile-change p").css("display", "block");
    $(".profile-change img,.profile-change p").css("cursor", "pointer");
    $("#user-img-big").css("filter", "blur(5px)");
});

$(".profile-change img,.profile-change p").mouseleave(function () {
    $(".profile-change p").css("display", "none");
    $(".profile-change img,.profile-change p").css("cursor", "default");
    $("#user-img-big").css("filter", "blur(0px)");
});

$(window).resize(function () {
    if ($(window).width() > 575) {
        $("#message-area").removeClass("d-none");
        $(".message-wrapper.flex-column").removeClass("d-flex").addClass("d-none");
        if (areaSwapped) {
            $(".overlay").removeClass("d-none");
            showChatList();
        }
    }
    if ($(window).width() < 575) {
        if (areaSwapped == false) {
            mobileview();
        }
    }
});

if ($(window).width() < 575) {
    mobileview();
}

function mobileview() {
    $(".overlay").addClass("d-none");
    $("#message-area").addClass("d-none");
}

function getOtherUserId() {
    let other_user_id = $(".message-wrapper.flex-column").attr("data-other-user-id");
    other_user_id = $.trim(other_user_id);
    return other_user_id;
}

function getThreadId() {
    let thread_id = $(".message-wrapper.flex-column").attr("data-thread-id");
    thread_id = $.trim(thread_id);
    return thread_id;
}

function getChatId() {
    let chat_id = $(".message-wrapper.flex-column .message-item").attr("data-chat-id");
    chat_id = $.trim(chat_id);
    return chat_id;
}

// Emoji Button
const picker = new EmojiButton({
    autoHide: false,
    position: "bottom-start",
    showPreview: false,
});

$(".emoji-trigger-message").click(function () {
    picker.pickerVisible ? picker.hidePicker() : picker.showPicker($(".message-wrapper.flex-column .emoji-trigger-message"));
});

$(".emoji-trigger-img").click(function () {
    picker.pickerVisible ? picker.hidePicker() : picker.showPicker($(".message-wrapper.flex-column .emoji-trigger-img"));
});

picker.on("emoji", function (emoji) {
    $(".message-wrapper.flex-column .input-message").val($(".message-wrapper.flex-column .input-message").val() + emoji);
    $(".message-wrapper.flex-column .input-message").focus();
});

// Profile Name Length
$("#input-name").on("input", function () {
    profileName();
});

function profileName() {
    $(".input-name-p").show();
    $("#input-name").attr("maxlength", 25);
    let maxlength = 25;
    let currentLength = $("#input-name").val().length;
    if (currentLength > maxlength) {
        return;
    }
    left = maxlength - currentLength;
    $(".input-name-p").text(left);
}

// Profile about Length
$("#input-about").on("input", function () {
    profileAbout();
});

function profileAbout() {
    $(".input-about-p").show();
    $("#input-about").attr("maxlength", 100);
    let maxlength = 100;
    let currentLength = $("#input-about").val().length;
    if (currentLength > maxlength) {
        return;
    }
    left = maxlength - currentLength;
    $(".input-about-p").text(left);
}

function auto_grow(e) {
    e.style.height = "5px";
    e.style.height = e.scrollHeight + "px";
}

// Replay message
$(".message-item").dblclick(function () {
    let chat_id = $(this).attr("data-chat-id");
    console.log(chat_id);
});

function imgDownload(e) {
    let a = document.createElement("a");
    let chat_id = jQuery(e).closest(".message-item").attr("data-chat-id");
    a.href = $('.message-item[data-chat-id="' + chat_id + '"] .msg-image img').attr("src");
    a.download = "download.jpeg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// var hello = $("#user-img-small").attr("src");
// console.log(hello);
// var hi = encodeImgtoBase64(hello);
// console.log(hi)

// function getBase64Image(img) {
//     var canvas = document.createElement("canvas");
//     canvas.width = img.width;
//     canvas.height = img.height;
//     var ctx = canvas.getContext("2d");
//     ctx.drawImage(img, 0, 0);
//     var dataURL = canvas.toDataURL("image/png");
//     return dataURL
//   }

//   var base64 = getBase64Image(document.getElementById("user-img-small"));
//   $("#user-img-small").attr("src", base64)
//   console.log(base64)

// // Encode Image
// function encodeImgtoBase64(img) {
//     var file = img;
//     var reader = new FileReader();
//     reader.onloadend = function () {
//         //   $("#base64Code").val(reader.result);
//         //   $("#convertImg").text(reader.result);
//         //   $("#base64Img").attr("src", reader.result);
//         return reader.result;
//     };
//     reader.readAsDataURL(file);
// }
