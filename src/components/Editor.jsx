import React, { useRef, useState } from "react";
import { useEffect } from "react";
import copyStyles from "../utils/copyStyles";

//This function returns the width of the border by remobing pixel from it
const parseValue = (v) => (v.endsWith("px") ? parseInt(v.slice(0, -2), 10) : 0);

// function createLineNumbers(textarea, lineNumber) {
//   const lines = textarea.value.split("\n").length;
//   lineNumber.innerHTML = Array.from(
//     { length: lines },
//     (_, i) => `<div>${i + 1}</div>`
//   ).join("");
// }

const calculateNumLines = (str, textarea) => {
  // Create a temporary canvas to measure text width
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Get computed styles to measure padding correctly
  const style = window.getComputedStyle(textarea);
  const font = style.getPropertyValue("font");
  const paddingLeft = parseValue(style.paddingLeft);
  const paddingRight = parseValue(style.paddingRight);

  // Set the canvas font to match textarea
  context.font = font;

  const textareaWidth = textarea.clientWidth - paddingLeft - paddingRight;
  const words = str.split(" ");
  let lineCount = 1;
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i] + " ";
    const wordWidth = context.measureText(word).width;
    const lineWidth = context.measureText(currentLine).width;

    if (lineWidth + wordWidth > textareaWidth) {
      lineCount++;
      currentLine = word;
    } else {
      currentLine += word;
    }
  }

  return lineCount;
};

const calculateLineNumbers = (textarea) => {
  if (!textarea) return [];

  const lines = textarea.value.split("\n");
  let lineNumbers = [];
  let lineIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const wrappedLines = calculateNumLines(lines[i], textarea);

    // Add the line number for the first line
    lineNumbers.push(lineIndex);

    // Add empty strings for wrapped lines
    for (let j = 1; j < wrappedLines; j++) {
      lineNumbers.push("");
    }

    lineIndex++;
  }

  return lineNumbers;
};

function Editor() {
  const container = useRef(null);
  const textarea = useRef(null);
  const mirror = useRef(null);
  const lineNumber = useRef(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const mirrorElement = document.createElement("div");
    mirror.current = mirrorElement;
    mirrorElement.classList.add("mirror-content");
    mirrorElement.classList.add("mirror-style");

    if (container.current && textarea.current) {
      setText(textarea.current.value);

      container.current.prepend(mirrorElement);
      copyStyles(textarea.current, mirrorElement);

      const borderWidth = parseValue(textarea.current.style.borderWidth);

      const ro = new ResizeObserver(() => {
        mirrorElement.style.width = `${
          textarea.current.clientWidth + 2 * borderWidth
        }px`;
        mirrorElement.style.height = `${
          textarea.current.clientHeight + 2 * borderWidth
        }px`;
      });
      ro.observe(textarea.current);

      textarea.current.addEventListener("scroll", (e) => {
        mirrorElement.scrollTop = e.target.scrollTop;
        mirrorElement.scrollLeft = e.target.scrollLeft;
      });

      textarea.current.addEventListener("scroll", () => {
        lineNumber.scrollTop = textarea.scrollTop;
      });

      copyStyles(textarea.current, lineNumber.current);
    }
  }, []);

  useEffect(() => {
    if (textarea.current) {
      // Ensure textarea ref is available
      // Adjust textarea height to fit content
      textarea.current.style.height = "auto"; // Reset height to allow shrinking
      textarea.current.style.height = `${textarea.current.scrollHeight}px`; // Set to content height

      // Update line numbers
      if (lineNumber.current) {
        const lineNumbersArray = calculateLineNumbers(textarea.current); // Renamed for clarity
        lineNumber.current.innerHTML = Array.from(
          {
            length: lineNumbersArray.length,
          },
          (_, i) =>
            `<div style="white-space:nowrap; padding-inline: 8px">${
              lineNumbersArray[i] || "&nbsp;"
            }</div>`
        ).join("");
      }
      if (mirror.current) {
        mirror.current.scrollTop = textarea.current.scrollTop;
        mirror.current.scrollLeft = textarea.current.scrollLeft;
      }
    }
  }, [text]);

  return (
    <div className="flex overflow-hidden   border-2 border-gray-600 rounded-md">
      <div
        ref={lineNumber}
        className="overflow-hidden  px text-right border-r-2 border-r-black"
      ></div>
      <div ref={container} className="border-2 relative w-full">
        <textarea
          ref={textarea}
          className="mirror-style p-0.5 border-0 focus:outline-none outline:none border-none resize-none  relative w-full block"
          onChange={(e) => {
            if (mirror.current) {
              setText(e.target.value);
              mirror.current.textContent = e.target.value; // Direct update
            }
          }}
          value={text}
          rows={1}
        ></textarea>
      </div>
    </div>
  );
}

export default Editor;
