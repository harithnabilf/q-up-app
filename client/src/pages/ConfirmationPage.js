import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueueData } from '../hooks/useQueueData';
import QRCode from 'qrcode';

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

const ConfirmationPage = () => {
  const { queueId } = useParams();
  const { queue, loading, error } = useQueueData(queueId);
  const [showTestModal, setShowTestModal] = useState(false);

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
    <>
      {showTestModal && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setShowTestModal(false)}>&times;</button>
                <h2>Test Queue</h2>
                <p className="form-group-description">
                    Click the button below to open a new tab and join the queue as a visitor.
                </p>
                <div className="modal-btn-group">
                    <a href={visitorUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        Join Queue
                    </a>
                </div>
            </div>
        </div>
      )}

      <div className="content-wrapper">
        <div className="confirmation-header">
            <img src="/logo.png" alt="Q-Up Logo" className="logo-image" />
             <button className="btn-icon-link" onClick={() => setShowTestModal(true)} aria-label="Open Test Options">
                <SettingsIcon />
            </button>
        </div>

        <h1>Done! Your queue is ready.</h1>
        {queue && <h2>"{queue.name}"</h2>}
        
        <div className="confirmation-section">
          <a href={adminUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Admin Dashboard
          </a>
          <p className="confirmation-description">
              Click here to open the dashboard where you will manage the queue.
          </p>
        </div>

        <div className="confirmation-section">
          <button className="btn btn-secondary btn-with-icon" onClick={downloadQRCode}>
            <DownloadIcon />
            Download QR Code
          </button>
           <p className="confirmation-description">
              Download the QR code to print and display for your visitors.
          </p>
        </div>
      </div>
    </>
  );
};

export default ConfirmationPage;