from flask import Flask, request, render_template, jsonify
from moviepy.video.io.VideoFileClip import VideoFileClip
import speech_recognition as sr
import google.generativeai as genai

# Initialize the Flask application
app = Flask(__name__, template_folder='templates')

# Configure Gemini AI model
genai.configure(api_key='AIzaSyBWN00VCEMbV4AO2T4xPJFGXvawEZsEdTA')
gemini_model = genai.GenerativeModel('gemini-pro')
chat = gemini_model.start_chat(history=[])
chat_history = []

def convert_audio_to_text(audio_path):
    recognizer = sr.Recognizer()
    audio_clip = sr.AudioFile(audio_path)
    with audio_clip as source:
        audio_text = recognizer.record(source)
    return recognizer.recognize_google(audio_text)

def process_video(video_path):
    clip = VideoFileClip(video_path)
    audio_path = "temp_audio.wav"
    clip.audio.write_audiofile(audio_path, codec='pcm_s16le', ffmpeg_params=["-ac", "1"])
    return convert_audio_to_text(audio_path)

@app.route('/')
def index():
    return render_template('index.html', chat_history=chat_history)

@app.route('/query', methods=['POST'])
def process_query():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    file.save('uploaded_video.mp4')
    text_result = process_video('uploaded_video.mp4')
    return jsonify({'result': text_result})

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    user_input = request.json.get('user_input')
    if not user_input:
        return jsonify({"error": "No user input provided."}), 400
    gemini_response = chat.send_message(user_input)
    chat_history.append({"user": user_input, "gemini_bot": gemini_response.text})
    return jsonify({"gemini_response": gemini_response.text})

if __name__ == '__main__':
    app.run(debug=True)