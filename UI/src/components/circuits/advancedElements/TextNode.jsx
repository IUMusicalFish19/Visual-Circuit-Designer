import { useState } from "react";

export default function TextNode({ data, selected }) {
  const [text, setText] = useState(data.label || "");

  return (
    <div
      style={{
        padding: 10,
        border: selected ? "2px solid #007acc" : "1px solid #999",
        borderRadius: 8,
        backgroundColor: "white",
        minWidth: 100,
        minHeight: 40,
        fontSize: 14,
      }}
    >
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          data.onTextChange?.(e.target.value);
        }}
        style={{
          width: "100%",
          height: "100%",
          resize: "none",
          border: "none",
          outline: "none",
          background: "transparent",
        }}
      />
    </div>
  );
}
