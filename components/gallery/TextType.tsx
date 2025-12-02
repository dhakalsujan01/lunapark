// src/components/TextType.tsx
"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback, createElement } from "react";

// The CSS for the cursor blink is now handled by a simple animation in your global CSS file.
// Add this to your global.css:
/*
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink {
  animation: blink 1s step-end infinite;
}
*/

interface TextTypeProps {
  text: string | string[];
  as?: React.ElementType;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  initialDelay?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorCharacter?: string;
  className?: string;
  [key: string]: any; // Allow other props
}

export function TextType({
  text,
  as: Component = "span",
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 1500,
  initialDelay = 0,
  loop = true,
  showCursor = true,
  cursorCharacter = "|",
  className = "",
  ...props
}: TextTypeProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleTyping = () => {
      const currentText = textArray[loopIndex % textArray.length];

      if (isDeleting) {
        if (displayedText.length > 0) {
          // Deleting
          timeoutId = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        } else {
          // Finished deleting
          setIsDeleting(false);
          setLoopIndex((prev) => prev + 1);
        }
      } else {
        if (displayedText.length < currentText.length) {
          // Typing
          timeoutId = setTimeout(() => {
            setDisplayedText((prev) => currentText.slice(0, prev.length + 1));
          }, typingSpeed);
        } else {
          // Finished typing, start pause
          if (loop || loopIndex < textArray.length - 1) {
            timeoutId = setTimeout(() => {
              setIsDeleting(true);
            }, pauseDuration);
          }
        }
      }
    };

    if (initialDelay > 0 && displayedText.length === 0 && loopIndex === 0 && !isDeleting) {
      timeoutId = setTimeout(handleTyping, initialDelay);
    } else {
      handleTyping();
    }

    return () => clearTimeout(timeoutId);
  }, [displayedText, isDeleting, loopIndex, textArray, typingSpeed, deletingSpeed, pauseDuration, initialDelay, loop]);

  return createElement(
    Component,
    { className, ...props },
    <>
      {displayedText}
      {showCursor && <span className="animate-blink ml-1">{cursorCharacter}</span>}
    </>
  );
}