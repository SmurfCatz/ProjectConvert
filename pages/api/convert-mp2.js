import { IncomingForm } from 'formidable';
import ffmpeg from 'fluent-ffmpeg'; 
import fs from 'fs';
import path from 'path'; 

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new IncomingForm({
    maxFileSize: 50 * 1024 * 1024, // 50MB max file size
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: 'Error parsing file' });
    }

    const file = files.file[0];
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const inputFilePath = file.filepath;
    const originalFilename = path.parse(file.originalFilename).name;
    const bitrate = fields.bitrate ? fields.bitrate : '128k'; // Default bitrate
    const outputFilePath = path.join(path.dirname(inputFilePath), `${originalFilename}.mp2`);

    ffmpeg(inputFilePath)
      .audioCodec('mp2')
      .audioBitrate(bitrate) // Set bitrate here
      .toFormat('mp2')
      .on('end', () => {
        const safeFilename = encodeURIComponent(`${originalFilename}.mp2`);

        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        const readStream = fs.createReadStream(outputFilePath);
        readStream.pipe(res).on('finish', () => {
          fs.unlink(outputFilePath, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting file', unlinkErr);
          });
        });
      })
      .on('error', (err) => {
        console.error('Error converting file', err);
        res.status(500).json({ message: 'Error converting file' });
      })
      .save(outputFilePath);
  });
}
