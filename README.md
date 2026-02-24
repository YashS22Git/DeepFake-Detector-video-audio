# VerifyAI - Deepfake Detection System

A comprehensive deepfake detection application, VerifyAI utilizes deep learning models and cloud AI services to analyze media for authenticity. It features a React-based frontend and a Python/Flask API backend backed by MongoDB.

## Features

- **Deepfake Analysis**: Leverages a custom deep learning model (e.g. Xception, MTCNN) for local, fast media inference.
- **Cloud-Powered Forensics (Optional)**: Integrates with Azure Video Indexer and Azure OpenAI / Google Gemini to generate deeper, contextual forensic reports and analysis details.
- **URL Analysis**: Supports downloading and analyzing videos straight from YouTube via `yt-dlp`.
- **Modern User Interface**: Built with React, Vite, Tailwind CSS, and shadcn-ui.
- **History Tracking**: Saves analysis results, temporal data, and media metadata in MongoDB for user reference.

## Tech Stack

### Frontend
- React 18, TypeScript, Vite
- Tailwind CSS, shadcn-ui, Radix UI

### Backend
- Python 3.9+, Flask
- TensorFlow / Keras (Local Model inference)
- yt-dlp (YouTube URL Analysis)
- MongoDB (pymongo for history storage)

### API Integrations
- Azure Video Indexer
- Azure OpenAI
- Google Gemini

## Setup Instructions

### 1. Clone the Repository

```sh
git clone <YOUR_GIT_URL>
cd Microsoft_Hack
```

### 2. Frontend Setup

The frontend uses Vite and npm.

```sh
# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on its default Vite port (`http://localhost:5173` or similar).

### 3. Backend Setup

The backend relies on Flask and several Python packages.

```sh
cd backend

# Create and activate a virtual environment (optional but recommended)
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file based on .env.example
cp .env.example .env
```

### 4. Configuration (`backend/.env`)

Modify the `backend/.env` file with your credentials to enable history tracking and cloud AI features:

- **MongoDB**
  - `MONGO_URI`: Your MongoDB connection string (Required for history).
- **Azure Cloud Services (Optional)**
  - `AZURE_VI_ACCOUNT_ID`, `AZURE_VI_API_KEY`, `AZURE_VI_LOCATION`
  - `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_DEPLOYMENT`
- **Google Gemini (Optional)**
  - `GEMINI_API_KEY`: Used as an alternative to Azure OpenAI.

### 5. Running the Backend

```sh
# Run the backend application
python app.py
```

The backend server will run on `http://localhost:5000`.

## Usage

1. Start both the frontend (`npm run dev`) and backend (`python app.py`) servers.
2. Navigate to the frontend UI.
3. Upload an image/video or provide a URL to analyze for deepfakes.
4. View real-time results, risk scores, confidence metrics, and AI-generated forensic reports.
