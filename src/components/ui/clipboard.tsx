import React, { useRef, useState } from "react";
import { CircleCheckBig } from "lucide-react";

export default function Clipboard({ url }: { url: string }) {
  const [copySuccess, setCopySuccess] = useState("");
  const inputRef = useRef(null);

  const copyToClipboard = () => {
    if (inputRef.current) {
      (inputRef.current as HTMLInputElement).select();
      document.execCommand("copy");
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000); // Clear the message after 2 seconds
    }
  };

  return (
    <section className="mx-auto w-full max-w-[400px]">
        <div className="relative">
        <input
            type="text"
            ref={inputRef}
            value={url}
            readOnly
            className="h-12 w-full rounded-lg bg-white border border-[#E5E7EB] py-3 pl-3 pr-24 text-outline-none duration-200 selection:bg-transparent outline-none text-black"
        />
        <button
            onClick={copyToClipboard}
            className="absolute right-[2px] top-1 flex h-[40px] w-[86px] bg-white items-center justify-center text-duration-200 border-l border-l-[#E5E7EB]"
        >
            {copySuccess ? (
                <CircleCheckBig className="w-[17px] h-[17px] text-[#222222]" />
            ) : (
                <div className="flex items-center justify-center gap-2">
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.57143 12.1431V13.2145C8.57143 13.5695 8.28362 13.8574 7.92857 13.8574H0.642857C0.287813 13.8574 0 13.5695 0 13.2145V3.35735C0 3.00231 0.287813 2.71449 0.642857 2.71449H2.57143V10.6431C2.57143 11.4702 3.24431 12.1431 4.07143 12.1431H8.57143ZM8.57143 2.92878V0.143066H4.07143C3.71638 0.143066 3.42857 0.430879 3.42857 0.785924V10.6431C3.42857 10.9981 3.71638 11.2859 4.07143 11.2859H11.3571C11.7122 11.2859 12 10.9981 12 10.6431V3.57164H9.21429C8.86071 3.57164 8.57143 3.28235 8.57143 2.92878ZM11.8117 2.09765L10.0454 0.331343C9.92486 0.210792 9.76136 0.143067 9.59087 0.143066L9.42857 0.143066V2.71449H12V2.5522C12 2.38171 11.9323 2.2182 11.8117 2.09765Z" fill="#222222"/>
                    </svg>
                    <p className="text-[14px] text-[#222222] font-normal">Copy</p>
                </div>
            )}
        </button>
        </div>
    </section>
  );
}
