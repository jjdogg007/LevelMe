
export class VoiceCommandService {
    recognition: any;
    isListening: boolean = false;

    constructor(onCommand: (cmd: string) => void) {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            this.recognition.onresult = (event: any) => {
                const last = event.results.length - 1;
                const cmd = event.results[last][0].transcript.trim().toLowerCase();
                onCommand(cmd);
            };
            this.recognition.onerror = (event: any) => {
                console.log("Voice Error:", event.error);
                this.isListening = false;
            };
            this.recognition.onend = () => {
                this.isListening = false;
            }
        }
    }

    start() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                this.isListening = true;
            } catch (e) {
                console.error(e);
            }
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    isSupported() {
        return !!this.recognition;
    }
}
