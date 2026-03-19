"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

import { FC } from "react";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const TextEditor: FC<TextEditorProps> = ({ value, onChange }) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder="Typ hier je tekst..."
      className="mb-4"
      modules={{
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image"],
          ["clean"],
        ],
      }}
    />
  );
};

export default TextEditor;
