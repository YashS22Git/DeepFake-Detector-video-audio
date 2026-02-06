import os
import requests
import time
import json

# Configuration from Environment Variables
VI_ACCOUNT_ID = os.environ.get('AZURE_VI_ACCOUNT_ID')
VI_API_KEY = os.environ.get('AZURE_VI_API_KEY')
VI_LOCATION = os.environ.get('AZURE_VI_LOCATION', 'trial') # 'trial' or region like 'eastus'

OPENAI_ENDPOINT = os.environ.get('AZURE_OPENAI_ENDPOINT')
OPENAI_KEY = os.environ.get('AZURE_OPENAI_KEY')
OPENAI_DEPLOYMENT = os.environ.get('AZURE_OPENAI_DEPLOYMENT')

def get_vi_access_token():
    if not VI_API_KEY or not VI_ACCOUNT_ID:
        print("Azure Video Indexer credentials missing.")
        return None

    url = f"https://api.videoindexer.ai/Auth/{VI_LOCATION}/Accounts/{VI_ACCOUNT_ID}/AccessToken?allowEdit=true"
    headers = {
        'Ocp-Apim-Subscription-Key': VI_API_KEY
    }
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to get Access Token: {response.text}")
            return None
    except Exception as e:
        print(f"Error getting access token: {e}")
        return None

def analyze_video_indexer(video_path, video_name):
    token = get_vi_access_token()
    if not token:
        return None
    
    # Upload video
    # Note: For efficient upload of local files, we use form-data.
    # Video Indexer API requires 'videoUrl' (public) OR multipart form upload.
    # For hackathon local file, we use multipart.
    
    url = f"https://api.videoindexer.ai/{VI_LOCATION}/Accounts/{VI_ACCOUNT_ID}/Videos?name={video_name}&accessToken={token}"
    
    files = {'file': open(video_path, 'rb')}
    try:
        print(f"Uploading to Azure Video Indexer: {video_name}")
        response = requests.post(url, files=files)
        if response.status_code != 200:
            print(f"Upload failed: {response.text}")
            return None
            
        video_id = response.json().get('id')
        print(f"Video ID: {video_id}. Waiting for processing...")
        
        # Poll for status
        while True:
            time.sleep(5) # Poll every 5 seconds
            status_url = f"https://api.videoindexer.ai/{VI_LOCATION}/Accounts/{VI_ACCOUNT_ID}/Videos/{video_id}/Index?accessToken={token}"
            status_res = requests.get(status_url)
            if status_res.status_code == 200:
                insights = status_res.json()
                state = insights.get('state')
                print(f"Indexing State: {state}")
                if state == 'Processed':
                    return insights
                elif state == 'Failed':
                    return None
            else:
                print(f"Status check failed: {status_res.text}")
                break
    except Exception as e:
        print(f"Azure VI Error: {e}")
        return None

def explain_with_openai(analysis_summary):
    if not OPENAI_KEY or not OPENAI_ENDPOINT:
        return "AI Explanation unavailable (Keys missing)."
        
    # Construct a prompt based on the analysis
    prompt = f"""
    You are a digital forensics expert. Analyze this video summary:
    Risk Score: {analysis_summary.get('risk_score')}
    Fake Probability: {analysis_summary.get('fake_prob')}
    Audio Anomalies: {analysis_summary.get('audio_anomalies', 'None')}
    Visual Anomalies: {analysis_summary.get('visual_anomalies', 'None')}
    
    Write a 2-sentence conclusion on whether this video is Deepfake or Real and why.
    """
    
    headers = {
        "Content-Type": "application/json",
        "api-key": OPENAI_KEY
    }
    payload = {
        "messages": [
            {"role": "system", "content": "You are a helpful AI forensics assistant."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 100
    }
    
    url = f"{OPENAI_ENDPOINT}/openai/deployments/{OPENAI_DEPLOYMENT}/chat/completions?api-version=2023-05-15"
    
    try:
        res = requests.post(url, headers=headers, json=payload)
        if res.status_code == 200:
            return res.json()['choices'][0]['message']['content']
        else:
            print(f"OpenAI Error: {res.text}")
            return "Could not generate explanation."
    except Exception as e:
        print(f"OpenAI Exception: {e}")
        return "Could not generate explanation."
