import { useState } from "react";

export default function Header({ meta }) {

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

          {meta?.generated_at && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Generated</p>
              <p className="text-sm text-gray-300 font-medium">
                {meta.generated_at}
              </p>
            </div>
          )}
      </div>
    </>
  );
}
