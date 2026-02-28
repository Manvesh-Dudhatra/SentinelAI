# SentinelAI

📥 Installation Guide

1️⃣ Clone the Repository
    git clone https://github.com/Manvesh-Dudhatra/SentinelAI.git

2️⃣ Install Python 3.11

3️⃣ Install Pipenv
    pip install --user pipenv

4️⃣ Navigate to Project Root
    cd SentinelAI

5️⃣ Install Dependencies
    pipenv install

🗄 Database Setup
    Run Migrations
        pipenv run python manage.py makemigrations
        pipenv run python manage.py migrate

▶️ Run Development Server
    pipenv run python manage.py runserver