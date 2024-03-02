// Borrowed code from git repo: https://github.com/kmatic/Voice-Recognition-Discord-Bot/blob/main/src/utils/detectHotword.ts
import { Porcupine } from "@picovoice/porcupine-node";

// passes in audio frames to porcupine to detect if hotword was spoken
export default function DetectHotword(audioFrame: any, porcupine: Porcupine): boolean {
    const keywordIndex = porcupine.process(audioFrame);

    // -1 means hotword was not detected
    if (keywordIndex !== -1) {
        console.log("hotword detected");
        return true;
    }

    return false;
}