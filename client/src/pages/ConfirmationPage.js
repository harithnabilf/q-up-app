import React from 'react';
import { useParams } from 'react-router-dom';
import { useQueueData } from '../hooks/useQueueData'; // Import the correct data hook
import QRCode from 'qrcode';

const QrIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
    <line x1="14" y1="14" x2="14" y2="14.01"></line>
    <line x1="17.5" y1="14" x2="17.5" y2="21"></line>
    <line x1="21" y1="17.5" x2="14" y2="17.5"></line>
    <line x1="21" y1="21" x2="21" y2="21.01"></line>
  </svg>
);

const ConfirmationPage = () => {
  const { queueId } = useParams();
  // Use the new hook to fetch data for this specific queue
  const { queue, loading, error } = useQueueData(queueId);

  const visitorUrl = `${window.location.origin}/queue/${queueId}`;
  const adminUrl = `${window.location.origin}/admin/${queueId}`;

  const downloadQRCode = async () => {
    if (!queue) return;

    const response = await fetch('/logo.png');
    const imageBlob = await response.blob();
    const reader = new FileReader();
    const dataUriPromise = new Promise(resolve => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageBlob);
    });
    const logoDataUri = await dataUriPromise;

    const qrCodeSvgString = await QRCode.toString(visitorUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
    });

    const a4Width = 210;
    const a4Height = 297;
    const flyerSize = 150; 
    const qrBoxSize = 90;

    const printableSvg = `
    <svg width="${a4Width}mm" height="${a4Height}mm" viewBox="0 0 ${a4Width} ${a4Height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
            @page { size: A4; margin: 0; }
            .title { font-family: -apple-system, 'Inter', sans-serif; font-size: 8px; font-weight: bold; text-anchor: middle; }
            .queue-name { font-family: -apple-system, 'Inter', sans-serif; font-size: 10px; font-weight: bold; text-anchor: middle; fill: #333; }
        </style>
        <g transform="translate(${(a4Width - flyerSize) / 2}, 60)">
            <image x="${(flyerSize - 40) / 2}" y="15" height="32" width="40" xlink:href="${logoDataUri}"/>
            <text x="${flyerSize / 2}" y="55" class="title">Queue-Up!</text>
            <svg x="${(flyerSize - qrBoxSize) / 2}" y="65" width="${qrBoxSize}" height="${qrBoxSize}">
                ${qrCodeSvgString}
            </svg>
            <text x="${flyerSize / 2}" y="${75 + qrBoxSize}" class="queue-name">"${queue.name}"</text>
        </g>
    </svg>
    `;

    const blob = new Blob([printableSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = `${queue.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_printable_qrcode.svg`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="content-wrapper"><h1>Loading...</h1></div>;
  if (error) return <div className="content-wrapper"><h1>Queue not found.</h1></div>;

  return (
    <div className="content-wrapper">
       <img src="/logo.png" alt="Q-Up Logo" className="logo-image" />
      <h1>Done! Your queue is ready.</h1>
      {queue && <h2>"{queue.name}"</h2>}
      
      <div className="confirmation-section">
        <div className="button-group">
          <a href={visitorUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-grow">
            Join Queue
          </a>
          <button className="btn btn-secondary btn-icon" onClick={downloadQRCode} aria-label="Download QR Code">
            <QrIcon />
          </button>
        </div>
        <p className="confirmation-description">
            Click 'Join Queue' to test it yourself. Download the QR code to print and display for your visitors.
        </p>
      </div>

      <div className="confirmation-section">
        <a href={adminUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          Admin Dashboard
        </a>
        <p className="confirmation-description">
            Click here to open the dashboard where you will manage the queue.
        </p>
      </div>
    </div>
  );
};

export default ConfirmationPage;