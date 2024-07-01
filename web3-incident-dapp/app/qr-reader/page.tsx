"use client";
import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
// import { useRouter } from 'next/router';
import Image from "next/image";
import QrFrame from "../../public/qr-code-frame.png";

const QrReader = () => {
  const scanner = useRef<QrScanner | null>(null);
  const videoEl = useRef<HTMLVideoElement | null>(null);
  const qrBoxEl = useRef<HTMLDivElement | null>(null);
  const [qrOn, setQrOn] = useState(true);
  // const router = useRouter();
  const [scannedResult, setScannedResult] = useState("");

  const onScanSuccess = (result: QrScanner.ScanResult) => {
    // router.push(`/${result?.data}`);
    window.location.href = `/${result?.data}`;
    console.log("this is the scanned result", result);
  };

  const onScanFail = (err: Error | string) => {
    console.log(err);
  };

  useEffect(() => {
    if (videoEl?.current && !scanner.current) {
      scanner.current = new QrScanner(videoEl.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxEl?.current || undefined,
      });

      scanner.current
        .start()
        .then(() => setQrOn(true))
        .catch((err: any) => {
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
    <>
    <div className="flex items-center justify-center my-9">
      <p className="text-xl text-white  font-extrabold">If u are facing any medical issue scan here</p>
    </div>
      <div className="qr-reader flex justify-center items-center">
        <video ref={videoEl}></video>
        <div ref={qrBoxEl} className="qr-box flex justify-center items-center">
          <Image
            src={QrFrame}
            alt="Qr Frame"
            width={256}
            height={256}
            className="qr-frame "
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
            {/* Scanned Result: {scannedResult} */}
          </p>
        )}
      </div>
    </>
  );
};

export default QrReader;