// Import the required libraries
const Tesseract = require("tesseract.js");
const say = require("say");

// Perform OCR on the image
Tesseract.recognize('./para.png', 'eng', { logger: e => console.log(e) })
  .then(result => {
    const text = result.data.text; // Extract the text from the OCR result
    console.log("Recognized Text:", text); // Output the recognized text

    // Use the say library to convert the text to speech
    say.speak(text, 'Alex', 1.0, (err) => {
      if (err) {
        console.error("Error converting text to speech:", err);
      } else {
        console.log("Text has been spoken out loud.");
      }
    });
  })
  .catch(error => {
    console.error("Error recognizing text from image:", error);
  });
