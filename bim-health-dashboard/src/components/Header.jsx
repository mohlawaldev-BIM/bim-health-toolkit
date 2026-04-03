import { useState } from "react";
import AboutModal from "./AboutModal";

export default function Header({ meta }) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-[#4F6CF7] rounded-lg flex
                            items-center justify-center text-sm">
              🏗
            </div>
            <h1 className="text-xl font-bold text-white">
              BIM Health Toolkit
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            {meta?.model_name
              ? `Model: ${meta.model_name}`
              : "No report loaded"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* About button */}
          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                       font-medium transition-all duration-200 cursor-pointer
                       hover:text-white"
            style={{
              background: "#1A1D2E",
              border: "1px solid #2A2D3E",
              color: "#9CA3AF",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#1E2235";
              e.currentTarget.style.borderColor = "#4F6CF740";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#1A1D2E";
              e.currentTarget.style.borderColor = "#2A2D3E";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            About
          </button>

          {meta?.generated_at && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Generated</p>
              <p className="text-sm text-gray-300 font-medium">
                {meta.generated_at}
              </p>
            </div>
          )}
        </div>
      </div>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
}
