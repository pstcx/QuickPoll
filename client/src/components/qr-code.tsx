import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export default function QRCode({ 
  value, 
  size = 128, 
  color = "#1976D2", 
  backgroundColor = "#FFFFFF" 
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      const canvas = canvasRef.current;
      if (!canvas || !value) return;

      try {
        await QRCodeLib.toCanvas(canvas, value, {
          width: size,
          height: size,
          color: {
            dark: color,
            light: backgroundColor,
          },
          margin: 2,
        });
      } catch (error) {
        console.error('QR code generation error:', error);
        // Fallback: draw error message
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = color;
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('QR Error', size / 2, size / 2);
        }
      }
    };

    generateQRCode();
  }, [value, size, color, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="border border-gray-200 rounded-lg"
    />
  );
}
