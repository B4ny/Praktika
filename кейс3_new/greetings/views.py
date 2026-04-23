from django.shortcuts import render
from .forms import NameForm
from .models import Name


def index(request):
    greeting_name = None
    error_message = None

    if request.method == 'POST':
        form = NameForm(request.POST)
        if form.is_valid():
            entered_name = form.cleaned_data['name'].strip()
            if entered_name:
                Name.objects.create(name=entered_name)
                greeting_name = entered_name
            else:
                error_message = 'Имя не может быть пустым.'
        else:
            error_message = 'Пожалуйста, введите корректное имя.'
    else:
        form = NameForm()

    return render(request, 'greetings/index.html', {
        'form': form,
        'greeting_name': greeting_name,
        'error_message': error_message,
    })

