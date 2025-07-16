import React from "react";

/**
 * ToggleButton - A stylized toggle switch for boolean state.
 * Props:
 *   checked: boolean (toggle state)
 *   onChange: function (called when toggled)
 *   className: string (optional, for custom styling)
 *   ...rest: any (other input props)
 */
export default function ToggleButton({ checked, onChange, className = "", ...rest }) {
  return (
    <label className={`relative inline-block w-12 h-6 cursor-pointer ${className}`}>
      {/* Hidden checkbox (controls the peer state) */}
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        {...rest}
      />
      {/* Toggle background track */}
      <div className="w-full h-full bg-red-500 peer-checked:bg-green-600 rounded-full transition-colors duration-300"></div>
      {/* Sliding white circle */}
      <div
        className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full
          transition-transform duration-300 transform peer-checked:translate-x-6"
      />
    </label>
  );
}
