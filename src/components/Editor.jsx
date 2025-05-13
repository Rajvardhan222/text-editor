import React, { useRef, useState } from "react";
import { useEffect } from "react";
import copyStyles from "../utils/copyStyles";
import Prism from "prismjs";
import "../prism-cb.css"

const highlight = (mirroredEle,textarea) => {
    mirroredEle.innerHTML = Prism.highlight(textarea.value, Prism.languages.javascript, 'javascript');
};


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
    const mirrorElement = document.createElement("pre");
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
        // handle window resize

        document.addEventListener("resize", () => {
            
            const lineNumbersArray = calculateLineNumbers(textarea.current);
            lineNumber.current.innerHTML = Array.from(
                {
                length: lineNumbersArray.length,
                },
                (_, i) =>
                `<div style="white-space:nowrap; padding-inline: 8px">${
                    lineNumbersArray[i] || "&nbsp;"
                }</div>`
            ).join("");

         
        
        })

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
    <div className="flex overflow-hidden border-2 border-gray-700 rounded-md text-blue-300 bg-gray-800"> {/* Added bg-gray-800 for overall dark theme base */}
      <div
        ref={lineNumber}
        // Added dark background, light text, and adjusted padding
        className="overflow-hidden px-2 py-0.5 text-right border-r-2 border-gray-700 bg-gray-800 text-gray-400 select-none" 
      ></div>
      {/* Added a dark background to the container, matching the overall theme */}
      <div ref={container} className="relative w-full bg-gray-800"> {/* Removed border-2, background set by Prism theme on mirror or this div */}
        <textarea
          ref={textarea}
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          // Ensure text-transparent and bg-transparent so mirror is visible
          className="mirror-style p-0.5 border-0 focus:outline-none outline:none resize-none relative w-full block  "
          onChange={(e) => {
            if (mirror.current && textarea.current) { // Ensure textarea.current also exists
              setText(e.target.value);
              // mirror.current.textContent = e.target.value; // Prism's innerHTML will overwrite this
              highlight(mirror.current, textarea.current); // Highlight the code
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
