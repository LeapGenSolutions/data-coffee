import { useState } from "react";
import { Minus, X, Maximize } from "lucide-react";

const SurroundAIWidget = (props) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const pipelineId = props.pipeline?.id;
  if (!pipelineId) return null;

  const iframeSrc =
    `https://octopus-nonred-strlit-czh5frcegse9cwdb.centralus-01.azurewebsites.net/` +
    `?pipeline_type=redaction&pipeline_id=${encodeURIComponent(pipelineId)}`;

  return (
    <>
      <div
        className={`
          fixed z-50 bottom-0 left-64
          bg-white rounded-2xl shadow-2xl border-2 border-blue-200
          flex flex-col transition-all duration-300 ease-in-out
          overflow-hidden
          ${isMinimized ? "h-12 w-60" : "h-[85vh] w-100"}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-t-2xl px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold truncate">
            Surround AI "{props.pipeline?.name}"
          </h3>
          <div className="flex items-center space-x-1">
            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-full hover:bg-white/20 focus:outline-none"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize size={16} /> : <Minus size={16} />}
            </button>
            {/* Close */}
            <button
              onClick={() => props.onClose?.()}
              className="p-1 rounded-full hover:bg-white/20 focus:outline-none"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content (always mounted to preserve state) */}
        <div
          className={`
            flex-1 bg-blue-50 overflow-hidden transition-opacity duration-200
            ${isMinimized ? 'opacity-0' : 'opacity-100'}
          `}
        >
          <iframe
            src={iframeSrc}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="Surround AI"
          />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </>
  );
};

export default SurroundAIWidget;
