import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const sampleRate = 22_050;
const duration = 24;
const totalSamples = sampleRate * duration;
const bytesPerSample = 2;
const outputPath = resolve("public/music/wedding-theme.wav");
const notes = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [196.0, 246.94, 293.66, 392.0],
];
const buffer = Buffer.alloc(44 + totalSamples * bytesPerSample);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + totalSamples * bytesPerSample, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
buffer.writeUInt16LE(bytesPerSample, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(totalSamples * bytesPerSample, 40);

for (let index = 0; index < totalSamples; index += 1) {
  const time = index / sampleRate;
  const chordIndex = Math.floor(time / 6) % notes.length;
  const beat = Math.floor(time * 2) % 4;
  const note = notes[chordIndex][beat];
  const beatPhase = (time * 2) % 1;
  const pluckEnvelope = Math.exp(-4.5 * beatPhase);
  const fadeIn = Math.min(time / 1.5, 1);
  const fadeOut = Math.min((duration - time) / 1.5, 1);
  const masterEnvelope = Math.max(0, Math.min(fadeIn, fadeOut));
  const pluck =
    Math.sin(2 * Math.PI * note * time) * 0.12 * pluckEnvelope +
    Math.sin(2 * Math.PI * note * 2 * time) * 0.025 * pluckEnvelope;
  const pad = notes[chordIndex].reduce(
    (sum, frequency) =>
      sum + Math.sin(2 * Math.PI * (frequency / 2) * time) * 0.013,
    0,
  );
  const shimmer =
    Math.sin(2 * Math.PI * notes[chordIndex][2] * 2 * time) *
    0.01 *
    Math.exp(-2.8 * ((time + 0.5) % 3));
  const sample = Math.max(
    -1,
    Math.min(1, (pluck + pad + shimmer) * masterEnvelope),
  );

  buffer.writeInt16LE(Math.round(sample * 32_767), 44 + index * 2);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buffer);
