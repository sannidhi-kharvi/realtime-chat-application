from chat.models import Thread, ChatMessage, UserAdd
from django.shortcuts import render, redirect
from .forms import RegisterForm, LoginForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, auth
from django.contrib.auth import login as auth_login
from django.db.models import Q

def login(request):
    if request.user.is_authenticated:
        return redirect('/')
    if request.method == 'POST':
        form = LoginForm(request.POST)
        username = request.POST['username']
        password = request.POST['password']
        user = auth.authenticate(username=username, password=password)
        
        if user is not None:
            if user.is_active:
                auth_login(request, user)
                return redirect('/')
        else:
            messages.error(request, 'Incorrect username or password')
            return redirect('login')
    else:
        form = LoginForm()
    return render(request, 'chat/login.html', {'form': form})


def register(request):
    if request.user.is_authenticated:
        return redirect('/')
    if request.method == "POST":
        form = RegisterForm(request.POST)

        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            obj = User.objects.get(username=username)
            user_add = UserAdd()
            user_add.user = obj
            user_add.profile_name = obj
            user_add.about = "Hey there! I am using Whatsapp."
            user_add.user_image = form.cleaned_data.get('user_image')
            user_add.save()

            messages.success(
                request, f'Hi {username}, your account was created successfully')
            return redirect('/login')
    else:
        form = RegisterForm()

    return render(request, 'chat/register.html', {'form': form})


def logout(request):
    auth.logout(request)
    return redirect('/login')


@login_required(login_url='/login')
def messages_page(request):
    threads = Thread.objects.by_user(user=request.user).prefetch_related(
        'chatmessage').order_by('-timestamp')
    Threadlist = Thread.objects.raw("WITH x AS (SELECT o.timestamp,o.*, od.* FROM chat_thread od, chat_chatmessage o WHERE o.thread_id=od.id), mx AS (SELECT max(timestamp) AS timestamp, id FROM x GROUP BY id ORDER BY timestamp DESC)SELECT x.* FROM x, mx WHERE x.id=mx.id AND x.timestamp=mx.timestamp GROUP BY x.thread_id ORDER BY timestamp desc")
    unread = Thread.objects.raw("SELECT *,count(p2.thread_id) AS unreadcount from chat_thread p1,chat_chatmessage p2 WHERE p1.id=p2.thread_id AND p2.status=1 GROUP BY p2.thread_id")

    context = {
        'Threads': threads,
        'Threadlist': Threadlist,
        'unread': unread
    }
    return render(request, 'chat/index.html', context)
