import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 128,
  className = '',
  darkColor = '#000000',
  lightColor = '#ffffff',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(value, {
      width: size * 2, // high DPI
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
        if (isMounted) {
          setError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, darkColor, lightColor]);

  if (error || !dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 rounded ${className}`}
      >
        QR Loading...
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR Code: ${value}`}
      width={size}
      height={size}
      className={`block object-contain ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
