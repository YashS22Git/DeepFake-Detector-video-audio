import google.generativeai as genai
import os

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

def get_gemini_response(analysis_summary):
    if not GEMINI_API_KEY:
        print("Gemini API Key missing.")
        return None

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # Use gemini-1.5-flash for speed and availability
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are a digital forensics expert AI.
        Analyze this video deepfake detection report:
        - Fake Probability Score: {analysis_summary.get('fake_prob', 0) * 100:.1f}%
        - Risk Level: {analysis_summary.get('risk_score')}/100
        
        Provide a concise 2-sentence explanation for the user about why this video might be fake or real, acting as a detective. 
        Focus on technical credibility.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        try:
             # Debug: List available models if failed
             print("Available models:", [m.name for m in genai.list_models()])
        except:
             pass
        return None
