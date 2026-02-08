import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const customSoundsDir = path.join(__dirname, 'public', 'custom_sounds');
const manifestPath = path.join(customSoundsDir, 'manifest.json');

// Ensure directory exists
if (!fs.existsSync(customSoundsDir)) {
    fs.mkdirSync(customSoundsDir, { recursive: true });
}

// Read all audio files in custom_sounds directory
const files = fs.readdirSync(customSoundsDir)
    .filter(f => /\.(mp3|wav|ogg|m4a)$/i.test(f));

// Write manifest
fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));

console.log(`✅ Manifest created with ${files.length} custom sound(s):`);
files.forEach(f => console.log(`   - ${f}`));
