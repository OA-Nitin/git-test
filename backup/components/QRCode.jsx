import React, { useEffect, useRef } from 'react';

const QRCode = ({ url, size = 200 }) => {
  const qrContainerRef = useRef(null);
  
  useEffect(() => {
    // Function to generate QR code
    const generateQRCode = async () => {
      if (!qrContainerRef.current) return;
      
      // Clear previous QR code
      qrContainerRef.current.innerHTML = '';
      
      try {
        // Create a canvas element for the QR code
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw a white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Generate QR code using a simple pattern (for demonstration)
        // In a real app, you would use a proper QR code library
        ctx.fillStyle = 'black';
        
        // Draw a simple pattern (this is just for visualization, not a real QR code)
        const cellSize = Math.floor(size / 25);
        const margin = Math.floor(cellSize * 2);
        
        // Draw position detection patterns (corners)
        // Top-left corner
        ctx.fillRect(margin, margin, cellSize * 7, cellSize * 7);
        ctx.fillStyle = 'white';
        ctx.fillRect(margin + cellSize, margin + cellSize, cellSize * 5, cellSize * 5);
        ctx.fillStyle = 'black';
        ctx.fillRect(margin + cellSize * 2, margin + cellSize * 2, cellSize * 3, cellSize * 3);
        
        // Top-right corner
        ctx.fillStyle = 'black';
        ctx.fillRect(size - margin - cellSize * 7, margin, cellSize * 7, cellSize * 7);
        ctx.fillStyle = 'white';
        ctx.fillRect(size - margin - cellSize * 6, margin + cellSize, cellSize * 5, cellSize * 5);
        ctx.fillStyle = 'black';
        ctx.fillRect(size - margin - cellSize * 5, margin + cellSize * 2, cellSize * 3, cellSize * 3);
        
        // Bottom-left corner
        ctx.fillStyle = 'black';
        ctx.fillRect(margin, size - margin - cellSize * 7, cellSize * 7, cellSize * 7);
        ctx.fillStyle = 'white';
        ctx.fillRect(margin + cellSize, size - margin - cellSize * 6, cellSize * 5, cellSize * 5);
        ctx.fillStyle = 'black';
        ctx.fillRect(margin + cellSize * 2, size - margin - cellSize * 5, cellSize * 3, cellSize * 3);
        
        // Draw some random dots to make it look like a QR code
        ctx.fillStyle = 'black';
        const hash = hashCode(url);
        const random = seededRandom(hash);
        
        for (let i = 0; i < 200; i++) {
          const x = margin + Math.floor(random() * (size - margin * 2));
          const y = margin + Math.floor(random() * (size - margin * 2));
          
          // Skip if in corner patterns
          if ((x < margin + cellSize * 8 && y < margin + cellSize * 8) || 
              (x > size - margin - cellSize * 8 && y < margin + cellSize * 8) ||
              (x < margin + cellSize * 8 && y > size - margin - cellSize * 8)) {
            continue;
          }
          
          ctx.fillRect(x, y, cellSize, cellSize);
        }
        
        // Add the canvas to the container
        qrContainerRef.current.appendChild(canvas);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };
    
    generateQRCode();
  }, [url, size]);
  
  return <div ref={qrContainerRef} className="qr-code"></div>;
};

// Helper function to generate a hash from a string
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// Simple seeded random number generator
function seededRandom(seed) {
  let state = seed || 1;
  return function() {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

export default QRCode;
