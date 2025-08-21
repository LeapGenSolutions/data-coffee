
import { useState } from "react";
import { Minus, X, Maximize } from "lucide-react";

const PromptStudioWidget = (props) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const pipelineId = props.pipeline?.id;
  if (!pipelineId) return null;

  const iframeSrc =
    `https://prompt-str-heczeucfa8gagng9.centralus-01.azurewebsites.net/`;

  return (
    <>
      <div
        className={`
          fixed z-50
          left-[57%]
          bottom-0 top-auto -translate-x-1/2 translate-y-0
          bg-white rounded-2xl shadow-2xl border-2 border-blue-200
          flex flex-col
          overflow-hidden
          ${isMinimized ? "h-12 w-[340px]" : "h-[70vh] w-[650px]"}
          prompt-studio-widget-anim
        `}
        style={{ minWidth: 280, minHeight: 48 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-t-2xl px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold truncate">
            Prompt Studio "{props.pipeline?.name}"
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
            title="Prompt Studio"
          />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease; }
        .prompt-studio-widget-anim {
          transition:
            left 0.4s cubic-bezier(0.4,0,0.2,1),
            top 0.4s cubic-bezier(0.4,0,0.2,1),
            bottom 0.4s cubic-bezier(0.4,0,0.2,1),
            width 0.4s cubic-bezier(0.4,0,0.2,1),
            height 0.4s cubic-bezier(0.4,0,0.2,1),
            transform 0.4s cubic-bezier(0.4,0,0.2,1),
            opacity 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </>
  );
};

export default PromptStudioWidget;
