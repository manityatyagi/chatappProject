class SpeechToTextService {
  constructor() {
    this.recognition = null;
    this.isSupported = false;
    this.isListening = false;
    this.onResult = null;
    this.onError = null;
    this.onStart = null;
    this.onEnd = null;

    this.initializeRecognition();
  }

initializeRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new window.webkitSpeechRecognition();
      this.isSupported = true;
    } else if ('SpeechRecognition' in window) {
      this.recognition = new window.SpeechRecognition();
      this.isSupported = true;
    } else {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    // Configure recognition
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Set up event listeners
    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStart) this.onStart();
    };

    this.recognition.onresult = (event) => {
      let transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        if (result.isFinal) {
          isFinal = true;
        }
      }

      if (this.onResult) {
        this.onResult(transcript, isFinal);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
    };
  }

  startListening() {
    if (!this.isSupported) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (this.onError) {
        this.onError(error.message);
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  setLanguage(lang) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  // Event handler setters
  setOnResult(callback) {
    this.onResult = callback;
  }

  setOnError(callback) {
    this.onError = callback;
  }

  setOnStart(callback) {
    this.onStart = callback;
  }

  setOnEnd(callback) {
    this.onEnd = callback;
  }

  // Check if browser supports speech recognition
  static isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
}

export default SpeechToTextService;
