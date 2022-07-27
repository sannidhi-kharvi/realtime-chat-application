from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import AuthenticationForm
from django import forms


class RegisterForm(UserCreationForm):
    username = forms.CharField(widget=forms.TextInput())
    email = forms.CharField(widget=forms.EmailInput())
    password1 = forms.CharField(widget=forms.PasswordInput())
    password2 = forms.CharField(widget=forms.PasswordInput())
    user_image = forms.ImageField(widget=forms.HiddenInput(), initial='profile/default_profile.jpeg') 

    def __init__(self, *args, **kwargs):
        super(RegisterForm, self).__init__(*args, **kwargs)
        self.fields['username'].widget.attrs['placeholder'] = 'Username'
        self.fields['email'].widget.attrs['placeholder'] = 'Email Address'
        self.fields['password1'].widget.attrs['placeholder'] = 'Password'
        self.fields['password2'].widget.attrs['placeholder'] = 'Confirm Password'

        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'input-field'
            visible.field.widget.attrs['autocomplete'] = 'off'
            visible.label = False

    def clean_email(self):
        data = self.cleaned_data['email']
        if User.objects.filter(email=data).count() > 0:
            raise forms.ValidationError(
                "We already have a user with this email-id.")
        return data


class LoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput())
    password = forms.CharField(widget=forms.PasswordInput())

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)
        self.fields['username'].widget.attrs['placeholder'] = 'Username'
        self.fields['password'].widget.attrs['placeholder'] = 'Password'

        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'input-field'
            visible.field.widget.attrs['autocomplete'] = 'off'
            visible.label = False
