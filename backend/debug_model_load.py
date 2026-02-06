import tensorflow as tf
import os
import h5py
import json

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'model', 'cleaned_model.h5')

def fix_layer_config(layer_config):
    if 'config' in layer_config and 'batch_shape' in layer_config['config']:
        print(f"Removing batch_shape from {layer_config['class_name']}")
        del layer_config['config']['batch_shape']
    return layer_config


print(f"Testing load of {MODEL_PATH}", flush=True)

try:
    print("Attempt 1: Standard load_model", flush=True)
    model = tf.keras.models.load_model(MODEL_PATH)
    print("SUCCESS: Standard load worked", flush=True)
except Exception as e:
    print(f"FAIL: Standard load failed: {e}", flush=True)

try:
    print("\nAttempt 2: compile=False", flush=True)
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("SUCCESS: compile=False worked", flush=True)
except Exception as e:
    print(f"FAIL: compile=False load failed: {e}", flush=True)

try:
    print("\nInspecting H5 file config...", flush=True)
    with h5py.File(MODEL_PATH, 'r') as f:
        if 'model_config' in f.attrs:
            config_str = f.attrs['model_config']
            config = json.loads(config_str)
            print("Model Layers Config:")
            for layer in config['config']['layers']:
                 print(f"Layer: {layer['class_name']} Config: {layer['config']}", flush=True)
except Exception as e:
    print(f"Failed to inspect H5: {e}", flush=True)
