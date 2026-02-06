import h5py
import json
import os
import shutil

ORIGINAL_MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'model', 'xception_deepfake_image_5o.h5')
CLEANED_MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'model', 'cleaned_model.h5')

print(f"Patching {ORIGINAL_MODEL_PATH} -> {CLEANED_MODEL_PATH}")

# Copy file first
shutil.copy2(ORIGINAL_MODEL_PATH, CLEANED_MODEL_PATH)

with h5py.File(CLEANED_MODEL_PATH, 'r+') as f:
    if 'model_config' in f.attrs:
        config_str = f.attrs['model_config']
        # Handle bytes vs string
        if isinstance(config_str, bytes):
            config_str = config_str.decode('utf-8')
            
        config = json.loads(config_str)
        
        # Patch InputLayer
        patched = False
        for layer in config['config']['layers']:
            if layer['class_name'] == 'InputLayer':
                if 'batch_shape' in layer['config'] or 'batch_input_shape' in layer['config']:
                    print("Found shape config in InputLayer. Setting explicit batch_input_shape...")
                    # Remove potential old keys
                    if 'batch_shape' in layer['config']: del layer['config']['batch_shape']
                    
                    # Force a clean list [None, 224, 224, 3]
                    layer['config']['batch_input_shape'] = [None, 224, 224, 3]
                    patched = True
                
                # Also check if 'dtype' is float32 string, sometimes causes issues? No usually fine.
        
        if patched:
            f.attrs['model_config'] = json.dumps(config).encode('utf-8')
            print("Successfully patched model_config.")
        else:
            print("No batch_shape found to remove.")
    else:
        print("No model_config found in H5 attrs.")

print("Patching complete.")
