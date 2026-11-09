// app/components/Modal.jsx
'use client';
import { useState } from "react";
import { Copy, Check, Terminal, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { parseTutorialContent } from "@/lib/tutorial-content";

// Komponen Terminal Command Prompt dengan background hitam pekat
function TerminalCommandBox({ command }) {
  const [copied, setCopied] = useState(false);

  if (!command || !command.trim()) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(command.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = command.trim().split("\n");

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-black my-4">
      {/* Header Jendela Terminal CMD */}
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          {/* Tombol khas jendela OS */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
          </div>
          <span className="text-xs font-mono text-slate-300 ml-2 flex items-center gap-1.5">
            <Terminal size={14} className="text-slate-400" /> Command Prompt (cmd.exe)
          </span>
        </div>

        {/* Tombol Copy Perintah */}
        <button
          onClick={handleCopy}
          type="button"
          className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Salin Perintah</span>
            </>
          )}
        </button>
      </div>

      {/* Area Body Terminal - Background Hitam Pekat */}
      <div className="p-4 bg-black text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed">
        <div className="text-slate-500 text-xs mb-1 select-none">Microsoft Windows [Version 10.0.19045]</div>
        <div className="text-slate-500 text-xs mb-3 select-none">(c) Microsoft Corporation. All rights reserved.</div>

        <div className="space-y-1.5">
          {lines.map((line, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-emerald-400 select-none shrink-0 font-bold">C:\Windows\System32&gt;</span>
              <span className="text-white font-semibold break-all">{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Modal({ isOpen, onClose, tutorial }) {
  const [stepSelection, setStepSelection] = useState({ tutorialId: null, index: 0 });
  const [feedbackCounts, setFeedbackCounts] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackState, setFeedbackState] = useState({ tutorialId: null, message: "" });

  const feedbackMessage =
    feedbackState.tutorialId === tutorial?.id ? feedbackState.message : "";

  const counts =
    feedbackCounts?.tutorialId === tutorial?.id
      ? feedbackCounts
      : {
          tutorialId: tutorial?.id,
          suka: Number(tutorial?.suka ?? 0),
          tidak_suka: Number(tutorial?.tidak_suka ?? 0),
        };

  async function submitFeedback(type) {
    if (feedbackLoading || !tutorial?.id) return;

    setFeedbackLoading(true);
    setFeedbackState({ tutorialId: tutorial.id, message: "" });

    try {
      const response = await fetch(`/api/tutorials/${tutorial.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Feedback gagal disimpan.");
      }

      setFeedbackCounts({
        tutorialId: tutorial.id,
        suka: Number(result.suka),
        tidak_suka: Number(result.tidak_suka),
      });
      setFeedbackState({
        tutorialId: tutorial.id,
        message: "Terima kasih atas feedback Anda.",
      });
    } catch (error) {
      setFeedbackState({
        tutorialId: tutorial.id,
        message: error.message || "Gagal menyimpan feedback.",
      });
    } finally {
      setFeedbackLoading(false);
    }
  }

  if (!isOpen || !tutorial) return null;

  const content = parseTutorialContent(tutorial.langkah);
  const activeStepIndex =
    stepSelection.tutorialId === tutorial.id ? stepSelection.index : 0;
  const updateActiveStepIndex = (updateIndex) => {
    setStepSelection((selection) => {
      const currentIndex =
        selection.tutorialId === tutorial.id ? selection.index : 0;
      const index =
        typeof updateIndex === "function" ? updateIndex(currentIndex) : updateIndex;
      return { tutorialId: tutorial.id, index };
    });
  };
  const activeStep = content.steps[activeStepIndex] || content.steps[0];
  const hasMultipleSteps = content.steps.length > 1;

  return (
    // Backdrop overlay
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-modal-backdrop"
    >
      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-modal-content will-change-transform border border-slate-100"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#42a6f8] bg-[#E8F5E9] px-3 py-1 rounded-full inline-block">
                {tutorial.kategori}
              </span>
              {tutorial.level && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {tutorial.level}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {tutorial.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Konten Langkah Solusi (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <section aria-live="polite">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                  Langkah {activeStepIndex + 1} dari {content.steps.length}
                </p>
                <h3 className="font-semibold text-gray-800 text-lg">
                  {activeStep.title}
                </h3>
              </div>
              {hasMultipleSteps && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateActiveStepIndex((index) => Math.max(0, index - 1))}
                    disabled={activeStepIndex === 0}
                    aria-label="Langkah sebelumnya"
                    className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveStepIndex((index) => Math.min(content.steps.length - 1, index + 1))}
                    disabled={activeStepIndex === content.steps.length - 1}
                    aria-label="Langkah berikutnya"
                    className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="text-gray-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-24">
              {activeStep.description ? (
                <ul className="list-disc list-inside space-y-2">
                  {activeStep.description.split("\n").map((instruction, index) => (
                    instruction.trim() && <li key={index}>{instruction.trim()}</li>
                  ))}
                </ul>
              ) : (
                "Tidak ada rincian penjelasan tambahan."
              )}
            </div>
          </section>

          {hasMultipleSteps && (
            <div className="flex flex-wrap gap-2" aria-label="Pilih langkah">
              {content.steps.map((step, index) => (
                <button
                  key={`${step.title}-${index}`}
                  type="button"
                  onClick={() => updateActiveStepIndex(index)}
                  aria-current={activeStepIndex === index ? "step" : undefined}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeStepIndex === index
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {index + 1}. {step.title}
                </button>
              ))}
            </div>
          )}

          {/* Perintah Terminal / Command Prompt (Background Hitam) */}
          {activeStep.command && (
            <div>
              <h3 className="font-semibold text-gray-800 text-base mb-1">Perintah Terminal / Command Prompt:</h3>
              <TerminalCommandBox command={activeStep.command} />
            </div>
          )}

          {/* Screenshot Foto (Jika Ada) */}
          {content.imageUrl && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-base">Screenshot / Panduan Visual:</h3>
                <a href={content.imageUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                  Buka Gambar Penuh <ExternalLink size={12} />
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner p-1">
                <Image
                  src={content.imageUrl}
                  alt={tutorial.title || "Screenshot Panduan"}
                  className="w-full max-h-80 object-contain rounded-lg mx-auto bg-slate-900/5"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tombol Like dan Unlike */}
        <div className="p-3">
          <h2 className="font-semibold">Apakah tutorial ini membantu?</h2>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              disabled={feedbackLoading}
              onClick={() => submitFeedback("suka")}
              className="text-sm bg-blue-500 font-bold text-white p-2 rounded-lg disabled:opacity-50"
            >
              Membantu 😁 ({counts.suka})
            </button>
            <button
              type="button"
              disabled={feedbackLoading}
              onClick={() => submitFeedback("tidak_suka")}
              className="text-sm bg-slate-600 font-bold text-white p-2 rounded-lg disabled:opacity-50"
            >
              Tidak Membantu 😔 ({counts.tidak_suka})
            </button>
          </div>
          {feedbackMessage && (
            <p role="status" className="mt-2 text-sm text-slate-600">
              {feedbackMessage}
            </p>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#42a6f8] hover:bg-[#3283c7] text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
