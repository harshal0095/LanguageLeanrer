export const speak = (text: string, langCode: string) => {
  if (!('speechSynthesis' in window)) {
    console.warn("Text-to-speech not supported");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to match the language code (e.g., 'de' for German)
  // Some browsers need 'de-DE', others work with 'de'
  utterance.lang = langCode;
  
  // Optional: Find a specific voice if available
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.startsWith(langCode));
  if (voice) {
    utterance.voice = voice;
  }

  utterance.rate = 0.9; // Slightly slower for learning
  window.speechSynthesis.speak(utterance);
};
