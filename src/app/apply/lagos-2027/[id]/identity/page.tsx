"use client";

import Link from "next/link";
import RevelationX1Logo from "@/components/brand/RevelationX1Logo";

import { ChangeEvent, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

const steps = [
  "Player",
  "Contact",
  "Identity",
  "Club & Academy",
  "Representation",
  "Video",
  "Consent",
  "Review",
  "Confirmation",
];

type DocumentType = "PASSPORT" | "NIN" | "HEADSHOT";

type IdentityDocument = {
  id: string;
  type: DocumentType;
  status: "UPLOADED" | "VERIFIED" | "MORE_INFO_REQUIRED" | "REJECTED";

  originalFilename: string | null;
  sizeBytes: string | null;
  uploadedAt: string | null;
};

type Application = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  age: number | null;
  eventSlug: string;
  status: string;
  identityDocuments: IdentityDocument[];
};

type UploadState = {
  file: File | null;
  filename: string;
  uploading: boolean;
  uploaded: boolean;
  progress: number;
  error: string;
};

const initialUploadState: UploadState = {
  file: null,
  filename: "",
  uploading: false,
  uploaded: false,
  progress: 0,
  error: "",
};

const documentConfig: Array<{
  type: DocumentType;
  title: string;
  number: string;
  description: string;
  accept: string;
  guidance: string;
}> = [
  {
    type: "PASSPORT",
    number: "01",
    title: "International Passport",
    description:
      "Upload the identity/photo page of the player's international passport.",
    accept: "application/pdf,image/jpeg,image/png",
    guidance: "PDF, JPG or PNG · Maximum 10 MB",
  },

  {
    type: "NIN",
    number: "02",
    title: "NIN Documentation",
    description:
      "Upload the player's Nigerian National Identification Number documentation or NIN slip.",
    accept: "application/pdf,image/jpeg,image/png",
    guidance: "PDF, JPG or PNG · Maximum 10 MB",
  },

  {
    type: "HEADSHOT",
    number: "03",
    title: "Current Player Headshot",
    description:
      "Upload a recent, clear head-and-shoulders photograph of the player.",
    accept: "image/jpeg,image/png",
    guidance: "JPG or PNG · Maximum 5 MB",
  },
];

export default function IdentityVerificationPage() {
  const params = useParams<{
    id: string;
  }>();

  const router = useRouter();

  const id = params.id;

  const [application, setApplication] = useState<Application | null>(null);

  const [loading, setLoading] = useState(true);

  const [pageError, setPageError] = useState("");

  const [uploads, setUploads] = useState<Record<DocumentType, UploadState>>({
    PASSPORT: {
      ...initialUploadState,
    },
    NIN: {
      ...initialUploadState,
    },
    HEADSHOT: {
      ...initialUploadState,
    },
  });

  useEffect(() => {
    loadApplication();
  }, [id]);

  async function loadApplication() {
    try {
      setPageError("");

      const response = await fetch(`/api/showcase-applications/${id}/identity`);

      const data = await response.json();

      if (!response.ok) {
        setPageError(data.error || "Unable to load identity verification.");

        return;
      }

      const record = data.application as Application;

      setApplication(record);

      setUploads((current) => {
        const next = {
          ...current,
        };

        for (const type of ["PASSPORT", "NIN", "HEADSHOT"] as DocumentType[]) {
          const existing = record.identityDocuments.find(
            (document) =>
              document.type === type && Boolean(document.uploadedAt),
          );

          if (existing) {
            next[type] = {
              ...next[type],
              file: null,
              filename: existing.originalFilename || "Document uploaded",
              uploaded: true,
              uploading: false,
              progress: 100,
              error: "",
            };
          }
        }

        return next;
      });
    } catch {
      setPageError("Unable to load identity verification.");
    } finally {
      setLoading(false);
    }
  }

  function updateUpload(type: DocumentType, partial: Partial<UploadState>) {
    setUploads((current) => ({
      ...current,

      [type]: {
        ...current[type],
        ...partial,
      },
    }));
  }

  function chooseFile(
    type: DocumentType,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    const isHeadshot = type === "HEADSHOT";

    const maxSize = isHeadshot ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

    const allowedTypes = isHeadshot
      ? ["image/jpeg", "image/png"]
      : ["application/pdf", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      updateUpload(type, {
        file: null,
        uploaded: false,
        progress: 0,

        error: isHeadshot
          ? "Please select a JPG or PNG image."
          : "Please select a PDF, JPG or PNG file.",
      });

      return;
    }

    if (file.size > maxSize) {
      updateUpload(type, {
        file: null,
        uploaded: false,
        progress: 0,

        error: isHeadshot
          ? "Maximum headshot size is 5 MB."
          : "Maximum document size is 10 MB.",
      });

      return;
    }

    updateUpload(type, {
      file,
      filename: file.name,
      uploaded: false,
      uploading: false,
      progress: 0,
      error: "",
    });
  }

  async function uploadDocument(type: DocumentType) {
    const state = uploads[type];

    if (!state.file) {
      updateUpload(type, {
        error: "Please select a file first.",
      });

      return;
    }

    try {
      updateUpload(type, {
        uploading: true,
        progress: 0,
        error: "",
      });

      const presignResponse = await fetch(
        `/api/showcase-applications/${id}/identity/presign`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            filename: state.file.name,

            contentType: state.file.type,

            size: state.file.size,

            documentType: type,
          }),
        },
      );

      const presign = await presignResponse.json();

      if (!presignResponse.ok) {
        throw new Error(presign.error || "Unable to prepare upload.");
      }

      await uploadToR2(presign.uploadUrl, state.file, (progress) => {
        updateUpload(type, {
          progress,
        });
      });

      const completeResponse = await fetch(
        `/api/showcase-applications/${id}/identity/complete`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            documentId: presign.documentId,

            storageKey: presign.storageKey,

            originalFilename: state.file.name,

            mimeType: state.file.type,

            size: state.file.size,
          }),
        },
      );

      const complete = await completeResponse.json();

      if (!completeResponse.ok) {
        throw new Error(
          complete.error || "The file uploaded but could not be recorded.",
        );
      }

      updateUpload(type, {
        file: null,
        filename: state.file.name,
        uploading: false,
        uploaded: true,
        progress: 100,
        error: "",
      });

      await loadApplication();
    } catch (error) {
      updateUpload(type, {
        uploading: false,
        progress: 0,

        error:
          error instanceof Error
            ? error.message
            : "Upload failed. Please try again.",
      });
    }
  }

  const allUploaded =
    uploads.PASSPORT.uploaded &&
    uploads.NIN.uploaded &&
    uploads.HEADSHOT.uploaded;

  const somethingUploading =
    uploads.PASSPORT.uploading ||
    uploads.NIN.uploading ||
    uploads.HEADSHOT.uploading;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090909] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="text-sm text-white/50">
            Loading identity verification...
          </div>
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-[#090909] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
            {pageError || "Application not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <RevelationX1Logo />

          <Link
            href={`/apply/${application.eventSlug}/${application.id}/contact`}
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#c7ff2f]">
            Lagos 2027
          </div>

          <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
            Player Application
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Complete your identity and age verification before proceeding.
          </p>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl overflow-x-auto px-6 lg:px-8">
          <div className="flex min-w-[1180px]">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex flex-1 items-center gap-3 border-r border-white/10 py-5 pr-4"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    index === 2
                      ? "bg-[#c7ff2f] text-black"
                      : index < 2
                        ? "border border-[#c7ff2f]/30 text-[#c7ff2f]"
                        : "border border-white/15 text-white/40"
                  }`}
                >
                  {["1", "2", "3", "4A", "4B", "5", "6", "7", "8"][index]}
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.08em] ${
                    index === 2
                      ? "text-white"
                      : index < 2
                        ? "text-white/60"
                        : "text-white/30"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 3 of 8
          </div>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Identity &amp; Age Verification
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
            To protect the integrity of the selection process, REVELATIONX1 must
            verify the identity and age of every applicant. All three items
            below are required.
          </p>

          <div className="mt-8 rounded-2xl border border-[#c7ff2f]/20 bg-[#c7ff2f]/[0.05] p-6">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c7ff2f]">
              Age Eligibility
            </div>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-black">
                  {application.age ?? "—"}
                </div>

                <div className="mt-1 text-sm text-white/45">
                  Age on first day of Lagos 2027
                </div>
              </div>

              <div className="rounded-full border border-[#c7ff2f]/25 bg-[#c7ff2f]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                ✓ 18–20 Eligible
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            {documentConfig.map((document) => {
              const state = uploads[document.type];

              return (
                <section
                  key={document.type}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-xs font-black text-white/45">
                          {document.number}
                        </div>

                        <h3 className="text-lg font-black">{document.title}</h3>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-white/50">
                        {document.description}
                      </p>

                      <p className="mt-2 text-xs font-semibold text-white/30">
                        {document.guidance}
                      </p>
                    </div>

                    {state.uploaded ? (
                      <div className="shrink-0 rounded-full border border-[#c7ff2f]/25 bg-[#c7ff2f]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#c7ff2f]">
                        ✓ Uploaded
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-black/20 p-5">
                    <input
                      type="file"
                      accept={document.accept}
                      disabled={state.uploading}
                      onChange={(event) => chooseFile(document.type, event)}
                      className="block w-full text-sm text-white/55 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white"
                    />

                    {state.filename ? (
                      <div className="mt-3 break-all text-xs text-white/45">
                        {state.filename}
                      </div>
                    ) : null}

                    {state.uploading ? (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-white/45">
                          <span>Uploading securely...</span>

                          <span>{state.progress}%</span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full bg-[#c7ff2f] transition-all"
                            style={{
                              width: `${state.progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : null}

                    {state.error ? (
                      <div className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs font-semibold text-red-200">
                        {state.error}
                      </div>
                    ) : null}

                    {state.file && !state.uploading ? (
                      <button
                        type="button"
                        onClick={() => uploadDocument(document.type)}
                        className="mt-4 rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
                      >
                        {state.uploaded ? "Replace File" : "Upload File"}
                      </button>
                    ) : null}

                    {state.uploaded && !state.file ? (
                      <p className="mt-4 text-xs leading-5 text-white/35">
                        Select another file above if you need to replace this
                        upload before continuing.
                      </p>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </div>

          {pageError ? (
            <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
              {pageError}
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/apply/${application.eventSlug}/${application.id}/contact`}
              className="text-sm font-bold text-white/45 transition hover:text-white"
            >
              Back to Contact
            </Link>

            <button
              type="button"
              disabled={!allUploaded || somethingUploading}
              onClick={() =>
                router.push(
                  `/apply/${application.eventSlug}/${application.id}/football-status`,
                )
              }
              className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {somethingUploading
                ? "Uploading..."
                : allUploaded
                  ? "Continue"
                  : "Upload All 3 Items"}
            </button>
          </div>
        </div>

        <aside>
          <div className="sticky top-8 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
                Verification Checklist
              </div>

              <div className="mt-5 space-y-4">
                <ChecklistItem
                  label="International Passport"
                  complete={uploads.PASSPORT.uploaded}
                />

                <ChecklistItem
                  label="NIN Documentation"
                  complete={uploads.NIN.uploaded}
                />

                <ChecklistItem
                  label="Current Headshot"
                  complete={uploads.HEADSHOT.uploaded}
                />
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <div
                  className={`text-sm font-black ${
                    allUploaded ? "text-[#c7ff2f]" : "text-white/50"
                  }`}
                >
                  {allUploaded
                    ? "✓ Verification evidence complete"
                    : "All 3 items are required"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1685ff]/20 bg-[#1685ff]/[0.05] p-6">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#1685ff]">
                Private &amp; Secure
              </div>

              <p className="mt-3 text-sm leading-6 text-white/55">
                Passport and NIN documentation are collected solely for
                identity, age and eligibility verification.
              </p>

              <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
                Identity documents and the player headshot are not shown to
                football selectors during anonymous player assessment.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ChecklistItem({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-white/60">{label}</span>

      <span
        className={`text-xs font-black ${
          complete ? "text-[#c7ff2f]" : "text-white/25"
        }`}
      >
        {complete ? "✓ Uploaded" : "Required"}
      </span>
    </div>
  );
}

function uploadToR2(
  uploadUrl: string,
  file: File,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl, true);

    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const progress = Math.round((event.loaded / event.total) * 100);

      onProgress(progress);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      reject(new Error("Secure file upload failed."));
    };

    xhr.onerror = () => {
      reject(new Error("Secure file upload failed."));
    };

    xhr.send(file);
  });
}
