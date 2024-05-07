import { useEffect, useRef, useState } from "react";
import "./index.css";
import QrScanner from "qr-scanner";
import QrFrame from "./qr-code-frame.png";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const QrReader = () => {
  const scanner = useRef();
  const videoEl = useRef(null);
  const qrBoxEl = useRef(null);
  const [qrOn, setQrOn] = useState(true);
  const navigate = useNavigate();
  const [scannedResult, setScannedResult] = useState("");

  const onScanSuccess = (result) => {
    console.log(result);
    setScannedResult(result?.data);
    if(scannedResult){
      navigate(`/${scannedResult}`);
    }
  };

  



  const onScanFail = (err) => {
    console.log(err);
  };

  useEffect(() => {
    if (videoEl?.current && !scanner.current) {
      scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxEl?.current || undefined,
      });

      scanner?.current
        ?.start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) setQrOn(false);
        });
    }

    return () => {
      if (!videoEl?.current) {
        scanner?.current?.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!qrOn)
      alert(
        "Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload."
      );
  }, [qrOn]);

  return (
    <div className="qr-reader">
      <video ref={videoEl}></video>
      <div ref={qrBoxEl} className="qr-box">
        <img
          src={QrFrame}
          alt="Qr Frame"
          width={256}
          height={256}
          className="qr-frame"
        />
      </div>
      {scannedResult && (
        <p
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 99999,
            color: "black",
          }}
        >
          Scanned Result: {scannedResult}
        </p>
      )}
    </div>
  );
};

export default QrReader;
