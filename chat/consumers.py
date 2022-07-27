# from asyncio.windows_events import NULL
import json
from django.contrib import messages
from channels.consumer import AsyncConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from channels.exceptions import StopConsumer
from chat.models import Thread, ChatMessage, UserAdd
from django.core.files.base import ContentFile
import base64
from django.core.files.storage import FileSystemStorage
from django.core.files.storage import default_storage
import os
from django.db.models import Q

User = get_user_model()

class ChatConsumer(AsyncConsumer):
    async def websocket_connect(self, event):
        print('connected', event)
        user = self.scope['user']
        chat_room = f'user_chatroom_{user.id}'
        self.chat_room = chat_room
        await self.channel_layer.group_add(
            chat_room,
            self.channel_name
        )
        await self.send({
            'type': 'websocket.accept'
        })

    async def websocket_receive(self, event):
        # print('receive', event)
        received_data = json.loads(event['text'])
        message = received_data.get('message')
        sent_by_id = received_data.get('sent_by')
        send_to_id = received_data.get('send_to')
        thread_id = received_data.get('thread_id')
        status = received_data.get('status')
        ustatus = received_data.get('ustatus')
        timestamp = received_data.get('timestamp')

        profile_name = received_data.get('profile_name')
        profile_about = received_data.get('profile_about')

        profile_img = received_data.get('profile_img')

        remove_img = received_data.get('remove_img')

        msg_img = received_data.get('msg_img')
        msg_img_message = received_data.get('msg_img_message')

        chat_id = received_data.get('chat_id')

        adduser = received_data.get('adduser')

        sent_by_user = await self.get_userid_object(sent_by_id)
        send_to_user = await self.get_userid_object(send_to_id)
        thread_obj = await self.get_threadid_object(thread_id)
        
        addnewuser = await self.get_username_object(adduser)
        adduser_id = await self.get_threadname_object(sent_by_user, addnewuser)
    
        cur_username = await self.get_userid_object(sent_by_id)
        if message:
            if not sent_by_user:
                print('Error:: sent by user is incorrect')
                return False
            if not thread_obj:
                print('Error:: Thread id is incorrect')
            new_chat_id = await self.create_chat_message(thread_obj, sent_by_user, message, msg_img, status, timestamp)

        elif ustatus:
            if not send_to_user:
                print('Error:: send to user is incorrect')
                return False
            if not thread_obj:
                print('Error:: Thread id is incorrect')
            await self.update_status(thread_obj, send_to_user, ustatus)

        elif profile_name:
            if not sent_by_user:
                print('Error:: sent by user is incorrect')
                return False
            await self.update_profile_name(sent_by_user, profile_name)
            users_id = await self.get_other_users(sent_by_id)

        elif profile_about:
            if not sent_by_user:
                print('Error:: sent by user is incorrect')
                return False
            await self.update_profile_about(sent_by_user, profile_about)
            users_id = await self.get_other_users(sent_by_id)

        elif profile_img:
            if not sent_by_user:
                print('Error:: sent by user is incorrect')
                return False
            
            image_name = 'profile/{}_profile.{}'.format(cur_username, 'jpeg')
            old_image_name = f'profile/{cur_username}_profile.jpeg'

            imgStr = profile_img.split(';base64')
            data = ContentFile(base64.b64decode(imgStr[1]), name=image_name)

            fs = FileSystemStorage()

            if default_storage.exists(old_image_name):
                old_image_name = f'profile/{cur_username}_profile.jpeg'
                fs.delete(old_image_name)

            file = fs.save(data.name, data)
            file_url = fs.url(file)
            file_url = file_url.split('media/')

            await self.update_profile_img(sent_by_user, file_url[1])
            users_id = await self.get_other_users(sent_by_id)

        elif remove_img:
            fs = FileSystemStorage()
            old_image_name = f'profile/{cur_username}_profile.jpeg'
            fs.delete(old_image_name)
            await self.update_profile_img(sent_by_user, 'profile/default_profile.jpeg')
            users_id = await self.get_other_users(sent_by_id)

        elif msg_img:
            if not sent_by_user:
                print('Error:: sent by user is incorrect')
                return False
            
            image_name = 'uploads/{}_msg.{}'.format(cur_username, 'jpeg')
            imgStr = msg_img.split(';base64')
            data = ContentFile(base64.b64decode(imgStr[1]), name=image_name)
            
            fs = FileSystemStorage()
            
            file = fs.save(data.name, data)
            file_url = fs.url(file)
            file_url = file_url.split('media/')

            new_chat_id = await self.create_chat_message(thread_obj, sent_by_user, msg_img_message, file_url[1], status, timestamp)
        
        elif chat_id:
            if not sent_by_user:
                print('Error:: sent by user is incorrect')
                return False
            old_image = await self.get_chat_object(chat_id)
            old_image_name = str(old_image.msg_image)
            if old_image_name:
                fs = FileSystemStorage()
                fs.delete(old_image_name)

            await self.delete_message(chat_id, thread_obj)

        else:
            if addnewuser == None:
                print('Error:: User not found')
                return False
            if not adduser_id == None:
                print('Error:: User already exits')
                return False
            if not sent_by_user:
                print('Error:: sent by user is incorrect')
                return False
            await self.add_user(sent_by_user, addnewuser)
            adduser_id = await self.get_threadname_object(sent_by_user, addnewuser)


        other_user_chat_room = f'user_chatroom_{send_to_id}'
        self_user = self.scope['user']
        if(message):
            response = {
                'message': message,
                'sent_by': self_user.id,
                'thread_id': thread_id,
                'new_chat_id': new_chat_id,
            }
        elif(ustatus):
            response = {
                'sent_by': self_user.id,
                'thread_id': thread_id,
                'ustatus': ustatus,
            }
        elif(adduser_id):
            response = {
                'adduser': adduser,
                'adduser_id':adduser_id.id,
                'adduser_img':str(addnewuser.useradd.user_image),
                'adduser_about':addnewuser.useradd.about,
            }
        elif(profile_img):
            response = {
                'sent_by': self_user.id, 
                'profile_img': file_url[1],
            }
        elif(remove_img):
            response = {
                'sent_by': self_user.id, 
                'profile_img': 'profile/default_profile.jpeg',
            }
        elif(profile_name):
            response = {
                'sent_by': self_user.id, 
                'profile_name': profile_name,
            }
        elif(profile_about):
            response = {
                'sent_by': self_user.id, 
                'profile_about': profile_about,
            }
        elif(msg_img):
            response = {
                'message': msg_img_message,
                'msg_img': file_url[1],
                'sent_by': self_user.id,
                'thread_id': thread_id,
                'new_chat_id': new_chat_id,
            }
        elif(chat_id):
            response = {
                'sent_by': self_user.id,
                'chat_id': chat_id,
            }
        else:
            response = ''

        if(profile_img or profile_name or profile_about or remove_img):
            for users in users_id:
                other_user_id = users['second_person_id']
                other_user_chat_room = f'user_chatroom_{other_user_id}'
                await self.channel_layer.group_send(
                    other_user_chat_room,
                    {
                        'type': 'chat_message',
                        'text': json.dumps(response)
                    }
                )

        await self.channel_layer.group_send(
            other_user_chat_room,
            {
                'type': 'chat_message',
                'text': json.dumps(response)
            }
        )

        await self.channel_layer.group_send(
            self.chat_room,
            {
                'type': 'chat_message',
                'text': json.dumps(response)
            }
        )

    async def websocket_disconnect(self, event):
        await self.channel_layer.group_discard(
            self.chat_room,
            self.channel_name
        )
        print('disconnect', event)
        raise StopConsumer()

    async def chat_message(self, event):
        # print('chat_message', event)
        await self.send({
            'type': 'websocket.send',
            'text': event['text']
        })

    # DataBase
    @database_sync_to_async
    def get_userid_object(self, user_id):
        qs = User.objects.filter(id=user_id).prefetch_related('useradd')
        if qs.exists():
            obj = qs.first()
        else:
            obj = None
        return obj

    @database_sync_to_async
    def get_username_object(self, user_name):
        qs = User.objects.filter(username=user_name).prefetch_related('useradd')
        if qs.exists():
            obj = qs.first()
        else:
            obj = None
        return obj

    @database_sync_to_async
    def get_threadid_object(self, thread_id):
        qs = Thread.objects.filter(id=thread_id)
        if qs.exists():
            obj = qs.first()
        else:
            obj = None
        return obj

    @database_sync_to_async
    def get_threadname_object(self, curuser, adduser):
        qs = Thread.objects.filter(first_person=curuser, second_person=adduser)
        if qs.exists():
            obj = qs.first()
        else:
            obj = None
        return obj
    
    @database_sync_to_async
    def get_chat_object(self, chat_id):
        qs = ChatMessage.objects.filter(id=chat_id)
        if qs.exists():
            obj = qs.first()
        else:
            obj = None
        return obj

    @database_sync_to_async
    def add_user(self, curuser, adduser):
        Thread.objects.create(
            first_person=curuser, second_person=adduser)

    @database_sync_to_async
    def create_chat_message(self, thread, user, message, msg_img, status, timestamp):
        obj = ChatMessage.objects.create(
            thread=thread, user=user, message=message, msg_image=msg_img, status=status, timestamp=timestamp)
        return obj.id

    @database_sync_to_async
    def update_status(self, thread, user, ustatus):
        ChatMessage.objects.filter(
            thread=thread, user=user).update(status=ustatus)

    @database_sync_to_async
    def update_profile_name(self,user,name):
        UserAdd.objects.filter(
            user=user).update(profile_name=name)

    @database_sync_to_async
    def update_profile_about(self,user,about):
        UserAdd.objects.filter(
            user=user).update(about=about)

    @database_sync_to_async
    def update_profile_img(self,user,user_image):
        UserAdd.objects.filter(
            user=user).update(user_image=user_image)

    @database_sync_to_async
    def delete_message(self,chat_id,thread_id):
        ChatMessage.objects.filter(
            id=chat_id).update(thread=thread_id, message="This message was deleted",msg_image="")

    @database_sync_to_async
    def get_other_users(self,user):
        if(Thread.objects.filter(first_person=user)):
            qs = Thread.objects.filter(first_person=user).values('second_person_id')
        if(Thread.objects.filter(second_person=user)):
            fs = Thread.objects.filter(second_person=user).values('first_person_id')

        combined_query = qs.union(fs)
        if combined_query:
            obj = list(combined_query)
        else:
            obj = None
        return obj

