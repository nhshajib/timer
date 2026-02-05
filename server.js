import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// --- CONFIG ---
const UPLOAD_DIR = path.join(__dirname, 'public', 'custom_sounds');
const ADMIN_PASSWORD = "antigravity"; // Simple hardcoded password

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/custom_sounds', express.static(UPLOAD_DIR));

// Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Sanitize filename: remove spaces, keep extension
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, safeName);
    }
});
const upload = multer({ storage });

// --- ENDPOINTS ---

// 0. Root Status
app.get('/', (req, res) => {
    res.send('Antigravity Audio Server is Running. API available at /api/sounds');
});

// 1. List Sounds
app.get('/api/sounds', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to scan directory' });
        }
        // Filter for audio files optionally, or just return all
        const sounds = files.filter(f => /\.(mp3|wav|ogg|m4a)$/i.test(f));
        res.json(sounds);
    });
});

// 2. Upload Sound
app.post('/api/upload', upload.single('file'), (req, res) => {
    const password = req.headers['x-admin-password'];

    if (password !== ADMIN_PASSWORD) {
        // Delete the file if it was uploaded but password failed
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(401).json({ error: 'Unauthorized: Invalid Password' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
        success: true,
        filename: req.file.filename,
        path: `/custom_sounds/${req.file.filename}`
    });
});

app.listen(PORT, () => {
    console.log(`Audio Server running on http://localhost:${PORT}`);
});
