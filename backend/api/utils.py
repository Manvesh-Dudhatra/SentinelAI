import random
import string

def generate_empcode():
    return ''.join(random.choices(string.ascii_uppercase, k=6))