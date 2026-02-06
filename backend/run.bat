@echo off
echo "Checking Python..."
py -3.10 --version
echo "Installing Dependencies..."
py -3.10 -m pip install -r backend/requirements.txt
echo "Starting Backend..."
py -3.10 backend/app.py
