import React, { useRef, useState } from "react";
import { useEffect } from "react";
import copyStyles from "../utils/copyStyles";
import Prism from "prismjs";
import "../prism-cb.css";
import Suggestions from "./Suggestions";
import { getLastWordEnteredByUser } from "../utils/getLastWord";
import { jsKeywords } from "../static/keyword";

const highlight = (mirroredEle, textarea) => {
  mirroredEle.innerHTML = Prism.highlight(
    textarea.value,
    Prism.languages.javascript,
    "javascript"
  );
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

//functioin to get client cursor position where he is writin
function getCursorPosition(textarea, mirroredEle) {
// Create a temporary element to avoid modifying the original mirroredEle
const tempMirroredEle = document.createElement("pre");
copyStyles(textarea, tempMirroredEle); // Use copyStyles to replicate styles

// Ensure the temporary element is part of the layout for getBoundingClientRect to work
// but keep it off-screen
tempMirroredEle.style.position = "absolute";
tempMirroredEle.style.left = "-9999px";
tempMirroredEle.style.top = "-9999px";
tempMirroredEle.style.visibility = "hidden"; // Keep it invisible
document.body.appendChild(tempMirroredEle);


const cursorPos = textarea.selectionStart;
const textBeforeCursor = textarea.value.substring(0, cursorPos);
const textAfterCursor = textarea.value.substring(cursorPos);

const pre = document.createTextNode(textBeforeCursor);
const post = document.createTextNode(textAfterCursor);
const caretEle = document.createElement("span");
// Using a zero-width space or a specific character might be more robust
// than &nbsp; if the font/styling causes &nbsp; to have width.
// However, for consistency with the original, we'll keep &nbsp;
// but ensure it doesn't break layout if it has width.
caretEle.innerHTML = "&nbsp;";


tempMirroredEle.innerHTML = ""; // Clear previous content
tempMirroredEle.append(pre, caretEle, post);

// Get bounding rectangles AFTER the temp element is populated and in the DOM
const rect = caretEle.getBoundingClientRect(); // Caret's viewport rect (when in offscreen temp element)
const textareaRect = textarea.getBoundingClientRect(); // Textarea's viewport rect
const tempMirroredEleRect = tempMirroredEle.getBoundingClientRect(); // Temp element's viewport rect

// Clean up the temporary element
document.body.removeChild(tempMirroredEle);

// Calculate caret's X offset within the temp mirrored element's content box
const caretX_in_temp = rect.left - tempMirroredEleRect.left;
// Calculate caret's Y offset within the temp mirrored element's content box
const caretY_in_temp = rect.top - tempMirroredEleRect.top;

// The final position is the textarea's viewport top-left,
// plus the caret's offset within the (mirrored) textarea content,
// adjusted for the textarea's own scroll position.
// This assumes textarea has 'border-0'. If it had borders, we would add
// textarea.clientLeft and textarea.clientTop to textareaRect.left/top respectively.
return {
    left: textareaRect.left + caretX_in_temp - textarea.scrollLeft,
    top: textareaRect.top + caretY_in_temp - textarea.scrollTop,
};
}
function Editor() {
  const container = useRef(null);
  const textarea = useRef(null);
  const mirror = useRef(null);
  const lineNumber = useRef(null);
  const [text, setText] = useState("");
  const [cursorPos, setCursorPos] = useState({ left: 0, top: 0 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [liveword, setLiveword] = useState("");
  const [suggestions, setSuggestions] = useState([]); // Use state for suggestions
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  function onSuggestionClick(suggestion) {
    const currentTextValue = textarea.current.value;
    const selectionStart = textarea.current.selectionStart; // Cursor position, typically at the end of liveword
    const selectionEnd = textarea.current.selectionEnd; // End of current selection, if any

    // `liveword` is the state variable holding the word/prefix that triggered suggestions.
    // We assume `liveword` correctly represents the text to be replaced, ending at `selectionStart`.
    const lengthOfLiveword = liveword ? liveword.length : 0;

    // Calculate the starting index of the liveword.
    // It's the current cursor position minus the length of the liveword.
    const livewordStartIndex = selectionStart - lengthOfLiveword;

    // Ensure livewordStartIndex is not negative (e.g., if liveword is unexpectedly long or selectionStart is 0).
    // This is a safeguard; ideally, liveword logic should prevent this inconsistency.
    const actualLivewordStartIndex = Math.max(0, livewordStartIndex);

    // Construct the new text
    const textBeforeLiveword = currentTextValue.substring(0, actualLivewordStartIndex);
    // Preserve text that was after the original cursor position or selection
    const textAfterOriginalSelection = currentTextValue.substring(selectionEnd);

    const newText = textBeforeLiveword + suggestion + textAfterOriginalSelection;

    setText(newText); // Update React state

    // Directly update textarea value for immediate feedback before async state update
    textarea.current.value = newText;
    textarea.current.focus();

    // Set cursor position to be after the inserted suggestion
    const newCursorPosition = (textBeforeLiveword + suggestion).length;
    textarea.current.setSelectionRange(newCursorPosition, newCursorPosition);

    highlight(mirror.current, textarea.current); // Highlight the code

    setShowSuggestions(false);
  }

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


      // suggestions

       
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
        });

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

      // handle auto complete and suggestions
      const cursorPos = getCursorPosition(textarea.current, mirror.current);

      let lastWordEntered = getLastWordEnteredByUser(text);
      setLiveword(lastWordEntered);
      setCursorPos(cursorPos);
      console.log(cursorPos);
      if (lastWordEntered.length > 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }

      if (lastWordEntered && lastWordEntered.trim() !== "") {
        // Only filter if liveword is not empty
        const filteredSuggestions = jsKeywords.filter((word) => {
          return word.toLowerCase().startsWith(lastWordEntered.toLowerCase()); // Case-insensitive search
        });
        setSuggestions(filteredSuggestions);
      } else {
        setSuggestions([]); // Clear suggestions if liveword is empty
      }
      
    }

    
      
  

  }, [text]);
  useEffect(() => {
    const currentTextarea = textarea.current; // Capture for cleanup

    const handleKeyDown = (e) => {
      if (showSuggestions && suggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (suggestions[selectedSuggestionIndex] !== undefined) {
            onSuggestionClick(suggestions[selectedSuggestionIndex]);
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          setShowSuggestions(false);
        }
      }
    };

    if (currentTextarea) {
      currentTextarea.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      currentTextarea?.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSuggestions, suggestions, selectedSuggestionIndex, onSuggestionClick]); // Correct dependencies
  return (
    <>
      <Suggestions
        suggestions={suggestions}
        selectedSuggestionIndex={selectedSuggestionIndex}
        position={cursorPos}
        showSuggestions={showSuggestions}
        onSuggestionClick={onSuggestionClick}
      />
      <div className="flex overflow-hidden border-2 border-gray-700 rounded-md text-blue-300 bg-gray-800">
        {" "}
        {/* Added bg-gray-800 for overall dark theme base */}
        <div
          ref={lineNumber}
          // Added dark background, light text, and adjusted padding
          className="overflow-hidden px-2 py-0.5 text-right border-r-2 border-gray-700 bg-gray-800 text-gray-400 select-none"
        ></div>
        {/* Added a dark background to the container, matching the overall theme */}
        <div ref={container} className="relative w-full bg-gray-800">
          {" "}
          {/* Removed border-2, background set by Prism theme on mirror or this div */}
          <textarea
            ref={textarea}
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            // Ensure text-transparent and bg-transparent so mirror is visible
            className="mirror-style p-0.5 border-0 focus:outline-none outline:none resize-none relative w-full block  "
            onChange={(e) => {
              if (mirror.current && textarea.current) {
                // Ensure textarea.current also exists
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
    </>
  );
}

export default Editor;
