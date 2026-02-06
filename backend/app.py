from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import datetime
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import model_utils
import azure_services
import gemini_service
import yt_dlp

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI")
try:
    client = MongoClient(MONGO_URI)
    db = client['verifyai_db']
    history_collection = db['analysis_history']
    print("Connected to MongoDB")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'jpg', 'jpeg', 'png', 'webp'}
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'model', 'cleaned_model.h5')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Initialize Model
try:
    print(f"Initializing model from {MODEL_PATH}")
    model_utils.init_model(MODEL_PATH)
except Exception as e:
    print(f"Failed to initialize model: {e}")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/history', methods=['GET'])
def get_history():
    try:
        userId = request.args.get('userId')
        # Fetch latest 20 records for this user
        query = {'userId': userId} if userId else {}
        records = list(history_collection.find(query).sort('timestamp', -1).limit(20))
        for record in records:
            record['_id'] = str(record['_id']) # Convert ObjectId to string
        return jsonify(records)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/history/<id>', methods=['DELETE'])
def delete_history(id):
    try:
        # Validate ObjectId format (24 hex characters)
        if not id or len(id) != 24:
            return jsonify({"error": "Invalid ID format"}), 400
        result = history_collection.delete_one({'_id': ObjectId(id)})
        if result.deleted_count > 0:
            return jsonify({"message": "Record deleted successfully"}), 200
        else:
            return jsonify({"error": "Record not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    userId = request.form.get('userId')
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        # Ensure model is initialized
        if model_utils.model is None:
             try:
                 model_utils.init_model(MODEL_PATH)
             except Exception as e:
                 return jsonify({"error": f"Model failed to initialize: {str(e)}"}), 500

        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        try:
            # Run Analysis
            print(f"Analyzing {filepath}...")
            # 1. Local Deepfake Model Analysis (Always runs)
            result = model_utils.predict_fake_real(filepath)
            
            # 2. Azure Video Indexer Analysis (Optional)
            azure_insights = None
            ai_explanation = None
            
            if os.environ.get('AZURE_VI_API_KEY'):
                print("Azure keys detected. Starting cloud analysis...")
                azure_data = azure_services.analyze_video_indexer(filepath, filename)
                if azure_data:
                    # Extract useful bits
                    # e.g., Sentiments, Transcripts
                    pass
                
                # generate AI explanation using local result + Azure data
                azure_services.explain_with_openai({
                    "risk_score": int(result['score'] * 100),
                    "fake_prob": result['score']
                })
            
            # 3. Google Gemini Analysis (Alternative)
            elif os.environ.get('GEMINI_API_KEY'):
                print("Gemini key detected. Generating forensic report...")
                gemini_text = gemini_service.get_gemini_response({
                    "risk_score": int(result['score'] * 100),
                    "fake_prob": result['score']
                })
                if gemini_text:
                    result['details'] = gemini_text  # Override simple details with AI explanation
            
            # Prepare record
            file_type = 'video' if filename.rsplit('.', 1)[1].lower() in ['mp4', 'avi', 'mov'] else 'image'
            
            record = {
                "userId": userId,
                "fileName": filename,
                "fileType": file_type,
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "result": result['result'],
                "riskScore": int(result['score'] * 100),
                "confidence": result['confidence'],
                "details": result.get('details', ''),
                "temporal_data": result.get('temporal_data', [])
            }
            
            # Save to MongoDB
            history_collection.insert_one(record)
            record['_id'] = str(record['_id'])
            
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
                
            return jsonify(record)
            
        except Exception as e:
            print(f"Error analyzing file: {e}")
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Invalid file type"}), 400


@app.route('/analyze-url', methods=['POST'])
def analyze_url():
    data = request.json
    if not data or 'url' not in data:
         return jsonify({"error": "No URL provided"}), 400
    
    url = data['url']
    userId = data.get('userId')
    print(f"Analyzing URL: {url}")
    
    try:
        # Download video
        filename = f"yt_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        ydl_opts = {
            'format': 'best[ext=mp4]',
            'outtmpl': filepath,
            'quiet': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
        if not os.path.exists(filepath):
             return jsonify({"error": "Failed to download video"}), 500

        # Run Analysis (Reuse logic)
        # 1. Local Deepfake Model Analysis
        result = model_utils.predict_fake_real(filepath)
        
        # 2. Azure/Gemini (Optional - copied from file analysis)
        if os.environ.get('AZURE_VI_API_KEY'):
             azure_services.explain_with_openai({
                 "risk_score": int(result['score'] * 100),
                 "fake_prob": result['score']
             })
        elif os.environ.get('GEMINI_API_KEY'):
             gemini_text = gemini_service.get_gemini_response({
                 "risk_score": int(result['score'] * 100),
                 "fake_prob": result['score']
             })
             if gemini_text:
                 result['details'] = gemini_text

        # Prepare record
        record = {
            "userId": userId,
            "fileName": filename,
            "fileType": 'video',
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "result": result['result'],
            "riskScore": int(result['score'] * 100),
            "confidence": result['confidence'],
            "details": result.get('details', ''),
            "temporal_data": result.get('temporal_data', [])
        }
        
        # Save to MongoDB
        history_collection.insert_one(record)
        record['_id'] = str(record['_id'])
        
        # Clean up
        if os.path.exists(filepath):
            os.remove(filepath)
            
        return jsonify(record)

    except Exception as e:
        print(f"Error processing URL: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
