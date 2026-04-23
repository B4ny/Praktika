import sys
sys.stdout.reconfigure(encoding='utf-8')
from datetime import datetime

def is_leap_year(year):
    """Определяет, високосный ли год."""
    if year % 4 != 0:
        return False
    if year % 100 != 0:
        return True
    return year % 400 == 0

def day_of_week(day, month, year):
    """Определяет день недели по дате (Zeller's congruence)."""
    if month < 3:
        month += 12
        year -= 1
    
    K = year % 100
    J = year // 100
    h = (day + (13*(month+1))//5 + K + K//4 + J//4 + 5*J) % 7
    
    days = ["суббота", "воскресенье", "понедельник", "вторник", 
            "среда", "четверг", "пятница"]
    return days[h]

def calculate_age(birth_year, birth_month, birth_day):
    """Вычисляет возраст пользователя."""
    today = datetime.now()
    age = today.year - birth_year
    if (today.month, today.day) < (birth_month, birth_day):
        age -= 1
    return age

def draw_digit(digit):
    """Рисует цифру из звездочек (5x3 символа)."""
    patterns = {
        '0': ['***','* *','* *','* *','***'],
        '1': ['  *','  *','  *','  *','  *'],
        '2': ['***','  *','***','*  ','***'],
        '3': ['***','  *','***','  *','***'],
        '4': ['* *','* *','***','  *','  *'],
        '5': ['***','*  ','***','  *','***'],
        '6': ['***','*  ','***','* *','***'],
        '7': ['***','  *','  *','  *','  *'],
        '8': ['***','* *','***','* *','***'],
        '9': ['***','* *','***','  *','***']
    }
    return patterns.get(digit, patterns['0'])

def format_date_stylish(day, month, year):
    """Форматирует дату в стиле электронного табло."""
    day_str = str(day).zfill(2)
    month_str = str(month).zfill(2)
    year_str = str(year)[-2:]  # последние 2 цифры года
    
    digits = day_str + month_str + year_str
    lines = []
    
    for i in range(5):
        line = ' '.join(draw_digit(d)[i] for d in digits)
        lines.append(line)
    
    separator = ' ' * (3 * len(digits) + 2 * (len(digits)-1))
    lines.insert(2, separator)
    lines.insert(5, separator)
    
    return '\n'.join(lines)

# Основная программа
def main():
    print("=== КАЛЬКУЛЯТОР ДАТЫ РОЖДЕНИЯ ===")
    
    # Ввод данных
    day = int(input("Введите день рождения (1-31): "))
    month = int(input("Введите месяц рождения (1-12): "))
    year = int(input("Введите год рождения (например, 1990): "))
    
    # Проверки
    if not (1 <= day <= 31 and 1 <= month <= 12):
        print("Ошибка: некорректная дата!")
        return
    
    # Вычисления
    weekday = day_of_week(day, month, year)
    leap = is_leap_year(year)
    age = calculate_age(year, month, day)
    
    # Вывод результатов
    print(f"\n📅 Ваша дата рождения: {day:02d}.{month:02d}.{year}")
    print(f"🗓 День недели: {weekday}")
    print(f"📈 Високосный год: {'Да' if leap else 'Нет'}")
    print(f"🎂 Ваш возраст: {age} лет")
    
    print("\n✨ Дата рождения в стиле электронного табло:")
    print(format_date_stylish(day, month, year))
    print("\n" + "="*50)

if __name__ == "__main__":
    main()