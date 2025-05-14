import React, { useEffect, useRef } from 'react'; // Import useState
 

function Suggestions({  position, showSuggestions, onSuggestionClick,suggestions,selectedSuggestionIndex,mirror }) { // Added onSuggestionClick prop
    const suggestionRef = useRef(null); // Renamed ref for clarity

    useEffect(() => {
        
        if (suggestionRef.current) {
            // Calculate proper position with smart placement
            const cursorHeight = 20; // Estimated cursor height
            const offset = 10; // Space between cursor and suggestions
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Default position is below cursor
            let top = position.top + cursorHeight + offset;
            let left = position.left;
            
            // If cursor is in bottom 30% of viewport, show above instead
            if (position.top > viewportHeight * 0.7) {
                // Position above cursor
                top = Math.max(5, position.top - offset - suggestionRef.current.clientHeight);
            }
            
            // Handle right edge of screen
            if (left + suggestionRef.current.clientWidth > viewportWidth) {
                left = Math.max(5, viewportWidth - suggestionRef.current.clientWidth - 10);
            }
            
            // Apply calculated position
            suggestionRef.current.style.left = `${left}px`;
            suggestionRef.current.style.top = `${top}px`;
        }
    }, [position]);

   
    if (!showSuggestions  ) {
        return null; // Don't render anything if not shown or no suggestions
    }

    return (
     showSuggestions &&   <ul  
            ref={suggestionRef} 
            className='absolute bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50' // Improved styling
            style={{
                maxHeight: '200px', // Prevent it from becoming too tall
                overflowY: 'auto',  // Add scroll for many suggestions
                minWidth: '150px',  // Give it a minimum width
            }}
        >
            {suggestions?.map((word, index) => {
                return (
                    <li 
                        key={index} 
                        className={`text-blue-300 text-xl font-semibold p-2 hover:bg-gray-500 cursor-pointer` + (selectedSuggestionIndex === index ? ' bg-gray-500' : '')} // Highlight selected suggestion
                        onClick={() => onSuggestionClick && onSuggestionClick(word)} // Handle click
                    >
                        {word}
                    </li>
                );
            })}
        </ul>
    );
}

export default Suggestions;