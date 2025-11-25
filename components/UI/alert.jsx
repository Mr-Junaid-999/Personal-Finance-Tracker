"use client";
import { useState } from "react";
export default function Alert({ type, message }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const bgColor =
    type === "success"
      ? "bg-green-100"
      : type === "error"
      ? "bg-red-100"
      : type === "warning"
      ? "bg-yellow-100"
      : "bg-blue-100";
  const textColor =
    type === "success"
      ? "text-green-700"
      : type === "error"
      ? "text-red-700"
      : type === "warning"
      ? "text-yellow-700"
      : "text-blue-700";
  return (
    <div
      className={`${bgColor} ${textColor} border ${textColor} px-4 py-3 rounded relative mb-4 w-full`}
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
      <span
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        onClick={() => setVisible(false)}
      >
        <svg
          className={`fill-current h-6 w-6 ${textColor}`}
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path d="M14.348 5.652a1 1 0 00-1.414 0L10 8.586 7.066 5.652a1 1 0 10-1.414 1.414L8.586 10l-2.934 2.934a1 1 0 101.414 1.414L10 11.414l2.934 2.934a1 1 0 001.414-1.414L11.414 10l2.934-2.934a1 1 0 000-1.414z" />
        </svg>
      </span>
    </div>
  );
}
