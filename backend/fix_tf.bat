@echo off
echo "Uninstalling conflicting packages..."
py -3.10 -m pip uninstall -y tensorflow tensorflow-intel tensorflow-estimator keras tensorboard
echo "Installing TensorFlow 2.15.0..."
py -3.10 -m pip install tensorflow==2.15.0 opencv-python mtcnn flask flask-cors pymongo
echo "Verifying..."
py -3.10 -c "import tensorflow as tf; print(f'TF Version: {tf.__version__}')"
py -3.10 backend/app.py
