from django import forms


class NameForm(forms.Form):
    name = forms.CharField(
        max_length=100,
        label='Ваше имя',
        widget=forms.TextInput(attrs={
            'placeholder': 'Введите ваше имя',
            'class': 'form-input',
        }),
    )

