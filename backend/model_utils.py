import cv2
import numpy as np
import tensorflow as tf
from mtcnn import MTCNN
from concurrent.futures import ThreadPoolExecutor
import os

# Constants
IMAGE_SIZE = (224, 224)
MAX_SEQ_LENGTH = 20
BATCH_SIZE = 32
FRAME_SAMPLE_RATE = 10

# Initialize global variables for model and detector
# We initialize them lazily or on import to avoid re-loading
feature_extractor = None
model = None
detector = None

def init_model(model_path):
    global feature_extractor, model, detector
    
    # Configure GPU memory growth to avoid allocating all memory at once
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            print(f"GPUs detected: {len(gpus)}")
        except RuntimeError as e:
            print(e)
    
    print("Loading feature extractor (Xception)...")
    feature_extractor = tf.keras.applications.Xception(weights="imagenet", include_top=False, pooling="avg")
    
    print(f"Loading weights from {model_path}...")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    try:
        # Reconstruct model architecture to bypass InputLayer deserialization bugs
        # Assumption: Xception backbone + GlobalAveragePooling + Dense(1, sigmoid)
        base_model = tf.keras.applications.Xception(weights=None, include_top=False, pooling='avg', input_shape=(224, 224, 3))
        predictions = tf.keras.layers.Dense(1, activation='sigmoid')(base_model.output)
        model = tf.keras.models.Model(inputs=base_model.input, outputs=predictions)
        
        # Load weights (by_name=True helps if layer names match, skip_mismatch=True if needed but risk)
        # We try standard load_weights first.
        model.load_weights(model_path)
        print("Model weights loaded successfully.")
    except Exception as e:
        print(f"Failed to load weights into reconstructed model: {e}")
        print("Fallback: Attempting to load original model with compile=False...")
        try:
             model = tf.keras.models.load_model(model_path, compile=False)
        except Exception as e2:
             print(f"Fallback failed: {e2}")
             raise e2

    print("Loading Face Detector (MTCNN)...")
    detector = MTCNN()
    print("Models loaded successfully.")

def extract_frames_from_video(video_path, sample_rate=FRAME_SAMPLE_RATE):
    frames = []
    timestamps = []
    try:
        vidcap = cv2.VideoCapture(video_path)
        fps = vidcap.get(cv2.CAP_PROP_FPS) or 30
        success, image = vidcap.read()
        count = 0
        while success:
            if count % sample_rate == 0:
                # Convert BGR to RGB
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                frames.append(image)
                # Calculate timestamp in MM:SS format or just seconds
                timestamps.append(count / fps)
            success, image = vidcap.read()
            count += 1
        vidcap.release()
    except Exception as e:
        print(f"Error extracting frames: {e}")
    return frames, timestamps

def detect_and_crop_faces(frame):
    faces = []
    if detector is None:
        raise RuntimeError("Detector not initialized")
        
    detections = detector.detect_faces(frame)
    for detection in detections:
        x, y, width, height = detection['box']
        # Ensure coordinates are valid
        x = max(0, x)
        y = max(0, y)
        
        face = frame[y:y+height, x:x+width]
        if face.size == 0:
            continue
            
        face = cv2.resize(face, IMAGE_SIZE)
        faces.append(face)
    return faces

def preprocess_faces(faces):
    face_features = np.zeros((len(faces), *IMAGE_SIZE, 3))
    for i, face in enumerate(faces):
        face_features[i] = tf.keras.applications.xception.preprocess_input(face)
    return face_features

def detect_faces_parallel(frames):
    # Depending on GPU usage, sequential might be safer for MTCNN if it uses GPU 
    # But MTCNN usually runs on CPU or generic Tensorflow. 
    # Let's keep it sequential for safety with TF/GPU contexts unless confirmed safe.
    # ThreadPoolExecutor with TF on GPU can satisfy race conditions.
    # Changing to sequential loop for stability.
    all_faces = []
    for frame in frames:
        faces = detect_and_crop_faces(frame)
        all_faces.extend(faces)
    return all_faces

def predict_fake_real(video_path):
    if model is None:
        raise RuntimeError("Model not initialized. Call init_model() first.")

    try:
        # Extract frames with timestamps
        frames, timestamps = extract_frames_from_video(video_path)
        if not frames:
             return {"result": "ERROR", "confidence": 0, "score": 0, "details": "No frames extracted", "temporal_data": []}

        # Process frame by frame to maintain temporal link
        temporal_data = []
        all_scores = []
        
        # We can still batch for performance if we map back, but for simplicity/accuracy in this context
        # let's process simpler or batch intelligently. 
        # Actually, let's detect faces first.
        
        # Parallel detection is fine, but we need to keep order.
        # map returns order preserved.
        all_faces_list = list(detect_faces_parallel(frames))
        
        # Now we have a list of faces corresponding to frames.
        # Some frames might have multiple faces or zero. 
        # But detect_faces_parallel currently returns a FLAT list of all faces.
        # We need to change detect_faces_parallel to return List[List[Face]] or modify usage.
        
        # Let's revert to sequential or mapped detection to keep context
        # detect_and_crop_faces returns List[Face] for ONE frame.
        
        valid_frames_count = 0
        
        # To avoid being too slow, limit max analysis
        max_analyze = 50
        if len(frames) > max_analyze:
            step = len(frames) // max_analyze
            frames = frames[::step]
            timestamps = timestamps[::step]
        
        for i, frame in enumerate(frames):
            faces = detect_and_crop_faces(frame)
            if not faces:
                # No face? assume neutral or undetermined (skip or 0.5)
                # temporal_data.append({"time": timestamps[i], "score": 0})
                continue
                
            # Preprocess
            processed = preprocess_faces(faces)
            
            # Safety check: don't predict on empty arrays
            if processed.shape[0] == 0:
                continue
            
            # Predict
            preds = model.predict(processed, verbose=0)
            
            # detailed score for this frame (avg of faces in this frame)
            frame_score = np.mean(preds)
            all_scores.append(frame_score)
            
            # Format time
            seconds = int(timestamps[i])
            mins = seconds // 60
            secs = seconds % 60
            time_str = f"{mins:02d}:{secs:02d}"
            
            temporal_data.append({
                "timestamp": time_str,
                "seconds": timestamps[i],
                "score": float(frame_score),
                # Simulated detail metrics based on the main score for UI richness
                "faceConsistency": max(0, 100 - int(frame_score * 100)),
                "overallRisk": int(frame_score * 100)
            })

        if not all_scores:
            return {"result": "UNDETERMINED", "confidence": 0, "score": 0, "details": "No faces found to analyze", "temporal_data": []}

        avg_prediction = np.mean(all_scores)
        
        return {
            "result": "FAKE" if avg_prediction >= 0.5 else "REAL",
            "confidence": float(avg_prediction) if avg_prediction >= 0.5 else float(1 - avg_prediction),
            "score": float(avg_prediction),
            "temporal_data": temporal_data
        }
    except Exception as e:
        print(f"Error during prediction: {e}")
        return {"result": "ERROR", "confidence": 0, "score": 0, "details": str(e), "temporal_data": []}
