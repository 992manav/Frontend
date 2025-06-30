export function pcmToWav(pcmData, sampleRate = 24000) {
  return new Promise((resolve, reject) => {
    try {
      const binaryString = atob(pcmData);
      const pcmBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        pcmBytes[i] = binaryString.charCodeAt(i);
      }

      const samples = new Int16Array(pcmBytes.buffer);
      const pcmByteLength = samples.length * 2;

      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);

      // "RIFF" chunk descriptor
      view.setUint8(0, "R".charCodeAt(0));
      view.setUint8(1, "I".charCodeAt(0));
      view.setUint8(2, "F".charCodeAt(0));
      view.setUint8(3, "F".charCodeAt(0));
      view.setUint32(4, 36 + pcmByteLength, true);
      view.setUint8(8, "W".charCodeAt(0));
      view.setUint8(9, "A".charCodeAt(0));
      view.setUint8(10, "V".charCodeAt(0));
      view.setUint8(11, "E".charCodeAt(0));

      // "fmt " sub-chunk
      view.setUint8(12, "f".charCodeAt(0));
      view.setUint8(13, "m".charCodeAt(0));
      view.setUint8(14, "t".charCodeAt(0));
      view.setUint8(15, " ".charCodeAt(0));
      view.setUint32(16, 16, true); // Subchunk1Size
      view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
      view.setUint16(22, 1, true); // NumChannels
      view.setUint32(24, sampleRate, true); // SampleRate
      view.setUint32(28, sampleRate * 2, true); // ByteRate
      view.setUint16(32, 2, true); // BlockAlign
      view.setUint16(34, 16, true); // BitsPerSample

      // "data" sub-chunk
      view.setUint8(36, "d".charCodeAt(0));
      view.setUint8(37, "a".charCodeAt(0));
      view.setUint8(38, "t".charCodeAt(0));
      view.setUint8(39, "a".charCodeAt(0));
      view.setUint32(40, pcmByteLength, true);

      const wavBuffer = new ArrayBuffer(44 + pcmByteLength);
      const wavBytes = new Uint8Array(wavBuffer);

      wavBytes.set(new Uint8Array(wavHeader), 0);
      wavBytes.set(new Uint8Array(samples.buffer), 44);

      const blob = new Blob([wavBytes], { type: "audio/wav" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result?.split(",")[1];
        if (base64data) {
          resolve(base64data);
        } else {
          reject(new Error("Failed to convert WAV to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } catch (error) {
      reject(error);
    }
  });
}
