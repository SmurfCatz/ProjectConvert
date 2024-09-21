"use client";
import { useState } from 'react';
import './style.css'; 

export default function ConvertPage() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState('128k'); 
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileInfo, setFileInfo] = useState({ name: '', size: 0 });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const handleBitrateChange = (e) => {
    setBitrate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('กรุณาเลือกไฟล์');
      return;
    }
  
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bitrate', bitrate);
  
    try {
      const res = await fetch(`/api/convert-${format}`, {
        method: 'POST',
        body: formData,
      });
  
      if (!res.ok) throw new Error('Network response was not ok');
  
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
  
      const originalName = file.name.split('.').slice(0, -1).join('.');
      const convertedFileName = `${originalName}.${format}`;
  
      setDownloadUrl(url);
      setFileInfo({ name: convertedFileName, size: blob.size });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>แปลงไฟล์เสียง</h1>
      <form onSubmit={handleSubmit} className="conversion-form">
        <div className="form-group">
          <label htmlFor="file">เลือกไฟล์</label>
          <input type="file" id="file" onChange={handleFileChange} />
        </div>

        <div className="form-group">
          <label htmlFor="format">เลือกประเภทไฟล์ที่ต้องการแปลง</label>
          <select id="format" value={format} onChange={handleFormatChange}>
            <option value="mp3">MP3</option>
            <option value="mp2">MP2</option> {/* Added MP2 option */}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bitrate">เลือกบิตเรท</label>
          <select id="bitrate" value={bitrate} onChange={handleBitrateChange}>
            <option value="64k">64 kbps</option>
            <option value="128k">128 kbps</option>
            <option value="192k">192 kbps</option>
            <option value="320k">320 kbps</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'กำลังดำเนินการ...' : 'แปลงไฟล์'}
        </button>
      </form>

      {downloadUrl && (
        <div className="result-card">
          <div className="file-info">
            <h3>ชื่อไฟล์: {fileInfo.name}</h3>
            <p>ขนาดไฟล์: {(fileInfo.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <a href={downloadUrl} download={fileInfo.name} className="download-btn">
            ดาวน์โหลดไฟล์
          </a>
        </div>
      )}
    </div>
  );
}
