// Import required libraries
const Tesseract = require('tesseract.js');
const say = require('say');
const fs = require('fs');
const { SpeechClient } = require('@google-cloud/speech');
const readline = require('readline');

// Path to your service account JSON key file
const keyFilename = '/path/to/your/keyfile.json';

// Instantiate a client for Google Cloud Speech-to-Text with credentials
const client = new SpeechClient({ keyFilename });

// Define file paths
const imageFilePath = './para.png'; // Path to the image file with questions and answers
const audioFilePath = './audio.mp3'; // Path to the recorded audio file

// Function to process image and extract text
function processImage(filePath) {
  Tesseract.recognize(filePath, 'eng', { logger: info => console.log(info) })
    .then(({ data: { text } }) => {
      // Process extracted text
      const [question, ...answers] = text.split('\n').filter(line => line.trim() !== '');
      console.log('Question:', question);
      answers.forEach((answer, index) => {
        console.log(`Answer ${index + 1}:`, answer);
      });

      // Read and speak the question and answers
      const textToRead = `${question}. ${answers.join(', ')}`;
      say.speak(textToRead, 'Microsoft Zira Desktop', 1.0, (err) => {
        if (err) {
          console.error('Error converting text to speech:', err);
        } else {
          console.log('Question and answers have been spoken out loud.');
          // Capture audio input and transcribe
          captureAudioAndTranscribe();
        }
      });
    })
    .catch(err => console.error('Error processing image:', err));
}

// Function to capture audio input and convert it to text
async function captureAudioAndTranscribe() {
  // Configure audio file to text conversion
  const audioBytes = fs.readFileSync(audioFilePath).toString('base64');

  const request = {
    audio: {
      content: audioBytes,
    },
    config: {
      encoding: 'MP3', // Update this according to your audio file format
      sampleRateHertz: 16000, // Ensure this matches your audio recording
      languageCode: 'en-US',
    },
  };

  try {
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    console.log(`User Response: ${transcription}`);

    // Compare user response with correct answers
    const correctAnswers = fs.readFileSync(imageFilePath, 'utf8').split('\n').filter(line => line.trim() !== '').slice(1);
    const match = correctAnswers.some(answer => answer.trim().toLowerCase() === transcription.trim().toLowerCase());
    
    if (match) {
      console.log('The provided answer is correct!');
    } else {
      console.log('The provided answer is incorrect.');
    }

  } catch (error) {
    console.error('Error transcribing audio:', error);
  }
}

// Start processing
processImage(imageFilePath);
