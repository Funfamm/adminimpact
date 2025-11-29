
/*
 * NOTE: This file represents the Node.js backend logic.
 * In a real deployment, this runs in the container.
 */

import express from 'express';
import cors from 'cors';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Fix for __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// INCREASE PAYLOAD LIMIT for the JSON body
app.use(express.json({ limit: '10mb' }) as any);

// Enable CORS for all routes - Critical for frontend communication
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}) as any);

// Google Cloud Storage Setup
// This automatically uses GOOGLE_APPLICATION_CREDENTIALS in Cloud Run/Compute Engine
const storage = new Storage();

// Bucket Config - Ensure these buckets exist in your Google Cloud Storage
const BUCKET_CASTING = 'ai-impact-casting-media';
const BUCKET_SPONSOR = 'ai-impact-sponsor-logos';
const BUCKET_MOVIES = 'ai-impact-movie-media'; // Dedicated bucket for large video files

// Generate Signed URL for Direct Upload
app.post('/api/uploads/sign', async (req, res) => {
  try {
    const { fileName, fileType, bucketType } = req.body;
    
    let bucketName = BUCKET_CASTING;
    if (bucketType === 'sponsor') bucketName = BUCKET_SPONSOR;
    if (bucketType === 'movie') bucketName = BUCKET_MOVIES;

    const bucket = storage.bucket(bucketName);
    // Sanitize filename to prevent overwrites or path traversal
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const file = bucket.file(`${Date.now()}_${safeName}`);

    // Generate V4 Signed URL for PUT request
    // This allows the browser to upload directly to Google's servers
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour expiration for large uploads
      contentType: fileType, // STRICT CONTENT TYPE MATCHING REQUIRED
    });

    // Generate public URL
    // NOTE: Buckets must be configured as public-read for this to work for streaming
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${file.name}`;

    res.json({ url, path: file.name, publicUrl });
  } catch (error) {
    console.error('GCS Sign Error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL. Check server logs/credentials.' });
  }
});

// Admin Auth Route (Stub)
app.post('/api/auth/login', (req, res) => {
    // In real app: Validate hash with bcrypt, query Postgres
    const { email, password } = req.body;
    
    // Allow env var override, but default to the requested password for ease of setup/demo
    const validPass = process.env.ADMIN_PASS || 'Impact@123';
    
    // Accept if password matches
    if(password === validPass) {
        // Return JWT
        res.json({ token: 'mock-jwt-token' });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Serve Frontend in Production
// In Docker, we copy 'dist' to the same directory as this script (./dist)
// Locally, it might be in ../dist
if (process.env.NODE_ENV === 'production') {
    let distPath = path.join(__dirname, 'dist');
    
    // Check if ./dist exists (Docker structure), otherwise try ../dist (Local structure)
    if (!fs.existsSync(distPath)) {
        distPath = path.join(__dirname, '../dist');
    }

    console.log(`Serving static files from: ${distPath}`);

    app.use(express.static(distPath) as any);
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
