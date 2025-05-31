// QRGenerator.jsx
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRGenerator = ({ value }) => {
  if (!value) return null;

  return (
    <div className="text-center">
      <div className="card">
        <div className="card-body">
          <h4 className="card-title mb-3">Your Business Card QR Code</h4>
          <div className="d-flex justify-content-center">
            <QRCodeCanvas
              value={value}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#333"
              bgColor="#ffffff"
            />
          </div>
          <p className="mt-3 mb-0">
            Scan this QR code to view your digital business card
          </p>
          <div className="mt-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                const canvas = document.querySelector("canvas");
                if (!canvas) return;
                const image = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = image;
                link.download = "business-card-qr.png";
                link.click();
              }}
            >
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
