"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckInScanner() {
  const router = useRouter();

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const [scanning, setScanning] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  function stopCamera() {
    streamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    streamRef.current = null;

    setScanning(false);
  }

  async function startCamera() {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is not supported on this device.",
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

      setScanning(true);

      scanLoop();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to access camera.",
      );
    }
  }

  async function scanLoop() {
    if (!videoRef.current) {
      return;
    }

    const BarcodeDetectorClass =
      (
        window as typeof window & {
          BarcodeDetector?: new (options: {
            formats: string[];
          }) => {
            detect: (
              source: HTMLVideoElement,
            ) => Promise<
              Array<{
                rawValue: string;
              }>
            >;
          };
        }
      ).BarcodeDetector;

    if (!BarcodeDetectorClass) {
      setError(
        "QR scanning is not supported in this browser. Use manual search or a compatible mobile browser.",
      );

      stopCamera();
      return;
    }

    const detector =
      new BarcodeDetectorClass({
        formats: ["qr_code"],
      });

    const loop = async () => {
      if (
        !scanning &&
        !streamRef.current
      ) {
        return;
      }

      try {
        if (
          videoRef.current &&
          videoRef.current.readyState >= 2
        ) {
          const codes =
            await detector.detect(
              videoRef.current,
            );

          const value =
            codes[0]?.rawValue;

          if (value) {
            stopCamera();
            handleScannedValue(value);
            return;
          }
        }
      } catch {
        // Keep scanning.
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  function handleScannedValue(value: string) {
    try {
      const url = new URL(value);

      if (
        url.pathname.startsWith(
          "/checkin/",
        ) ||
        url.pathname.startsWith(
          "/professional-checkin/",
        )
      ) {
        router.push(
          `${url.pathname}${url.search}`,
        );

        return;
      }

      throw new Error(
        "This QR code is not an ASCEND event credential.",
      );
    } catch {
      setError(
        "This QR code is not a valid ASCEND event credential.",
      );
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.1em] text-[#c7ff2f]">
            QR Scanner
          </div>

          <div className="mt-2 text-sm text-white/50">
            Scan a player or professional event credential.
          </div>
        </div>

        {!scanning ? (
          <button
            type="button"
            onClick={startCamera}
            className="rounded-full bg-[#c7ff2f] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-black"
          >
            Start Scanner
          </button>
        ) : (
          <button
            type="button"
            onClick={stopCamera}
            className="rounded-full border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/60"
          >
            Stop Scanner
          </button>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          className="aspect-video w-full object-cover"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 text-sm text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
