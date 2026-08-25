import { useState } from "react";
import { samplePrescriptions } from "../data/healthData";

function PrescriptionUpload({ onAddExtractedToCart, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [successToast, setSuccessToast] = useState(false);

  const startScanSimulation = (rxData) => {
    setIsScanning(true);
    setScanProgress(10);
    setExtractedData(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setIsScanning(false);
          setExtractedData(rxData);
          // Pre-select all extracted medicines
          const initialSelection = {};
          rxData.medicinesExtracted.forEach((m) => {
            initialSelection[m.matchedId] = true;
          });
          setSelectedItems(initialSelection);
          return 100;
        }
        return prev + 20;
      });
    }, 180);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
      // Auto-scan using first sample template with custom file name
      const customRx = {
        ...samplePrescriptions[0],
        title: `Uploaded Rx: ${file.name}`,
      };
      startScanSimulation(customRx);
    }
  };

  const loadSample = (sample) => {
    setSelectedFile(`Sample_Prescription_${sample.id}.pdf`);
    startScanSimulation(sample);
  };

  const toggleItem = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddToCart = () => {
    if (!extractedData) return;
    const itemsToAdd = extractedData.medicinesExtracted.filter(
      (m) => selectedItems[m.matchedId]
    );

    if (itemsToAdd.length === 0) {
      alert("Please select at least one extracted medicine to add.");
      return;
    }

    onAddExtractedToCart(itemsToAdd);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-md">
              📑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">
                  AI Prescription Rx Scanner
                </h2>
                <span className="rounded-full bg-emerald-400/30 px-2.5 py-0.5 text-xs font-bold text-emerald-100 border border-emerald-300/40">
                  AI Vision 2.0
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">
                Upload your doctor's prescription for instant automated verification & ordering
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Demo Templates Banner */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span>⚡</span> Quick Test Demo Prescriptions (Click to auto-scan):
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {samplePrescriptions.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSample(sample)}
                  className="rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-600 hover:text-white"
                >
                  📄 {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="relative rounded-3xl border-2 border-dashed border-emerald-300 bg-slate-50/80 p-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50/30">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              id="prescription-file-input"
            />
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl text-emerald-700">
              📸
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-800">
              Drag & Drop Prescription or <span className="text-emerald-600 underline">Browse File</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Supported formats: JPEG, PNG, WEBP, PDF (Max 15MB)
            </p>
            {selectedFile && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold text-emerald-800">
                <span>📎 {selectedFile}</span>
              </div>
            )}
          </div>

          {/* Scanning Progress Animation */}
          {isScanning && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center animate-pulse">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold">
                <span className="animate-spin text-xl">⚙️</span>
                <span>AI Optical Character Recognition (OCR) in progress... {scanProgress}%</span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-emerald-200">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-emerald-600">
                Identifying prescribing doctor, dosage schedule, and matching registered medicines...
              </p>
            </div>
          )}

          {/* Extracted Prescription Result */}
          {extractedData && !isScanning && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              {/* Doctor & Patient Info Bar */}
              <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Doctor & Hospital</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{extractedData.doctorName}</p>
                  <p className="text-slate-500">{extractedData.hospital} • {extractedData.regNo}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Patient Details</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {extractedData.patientName} ({extractedData.patientAge}y, {extractedData.patientGender})
                  </p>
                  <p className="text-emerald-700 font-semibold">Diagnosis: {extractedData.diagnosis}</p>
                </div>
              </div>

              {/* Medicines List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span>💊</span> Extracted Medicines ({extractedData.medicinesExtracted.length})
                  </h4>
                  <span className="text-xs text-slate-500">Select items to add to cart</span>
                </div>

                <div className="space-y-2.5">
                  {extractedData.medicinesExtracted.map((med) => {
                    const isChecked = !!selectedItems[med.matchedId];
                    return (
                      <label
                        key={med.matchedId}
                        className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition ${
                          isChecked
                            ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                            : "border-slate-200 bg-white opacity-70"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(med.matchedId)}
                          className="mt-1 h-4 w-4 rounded accent-emerald-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-sm">{med.name}</span>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                              Matched In Stock
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            📋 <span className="font-medium text-emerald-700">Dosage:</span> {med.dosage}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Doctor's Notes */}
              {extractedData.doctorNotes && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-800">
                  <span className="font-bold">Doctor's Clinical Instructions:</span> {extractedData.doctorNotes}
                </div>
              )}

              {/* Compliance & Trust Notice */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>🛡️</span>
                <span>All uploaded prescriptions are audited by licensed SV Care Pharmacists under Pharmacy Act regulations.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        {extractedData && !isScanning && (
          <div className="border-t border-slate-100 bg-slate-50/90 p-4 px-6 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-800">
                {Object.values(selectedItems).filter(Boolean).length} of {extractedData.medicinesExtracted.length}
              </span>{" "}
              medicines selected
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
              >
                <span>🛒</span>
                <span>Add Selected to Cart</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {successToast && (
          <div className="absolute inset-x-0 bottom-6 mx-auto w-fit rounded-full bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow-2xl animate-bounce flex items-center gap-2">
            <span>✓</span> Medicines added to your cart successfully!
          </div>
        )}
      </div>
    </div>
  );
}

export default PrescriptionUpload;
