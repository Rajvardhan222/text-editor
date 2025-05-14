const nonWordCharacters = [
  ' ', // Space
  '.', // Period
  ',', // Comma
  ';', // Semicolon
  ':', // Colon
  '!', // Exclamation mark
  '?', // Question mark
  '"', // Double quote
  "'", // Single quote
  '`', // Backtick
  '(', // Opening parenthesis
  ')', // Closing parenthesis
  '[', // Opening bracket
  ']', // Closing bracket
  '{', // Opening brace
  '}', // Closing brace
  '<', // Less than
  '>', // Greater than
  '=', // Equals
  '+', // Plus
  '-', // Minus (hyphen)
  '*', // Asterisk
  '/', // Slash
  '\\', // Backslash
  '|', // Pipe
  '&', // Ampersand
  '%', // Percent
  '$', // Dollar
  '#', // Hash
  '@', // At sign
  '^', // Caret
  '~', // Tilde
  '\n', // Newline
  '\t', // Tab
  '\r'  // Carriage return
];
export function getLastWordEnteredByUser(text) {
 
    
    // move backwords to find the last non-word character and thats the latest word which user typed

    if(!text || text.length === 0) {
        return '';
    }

    let lastWord = '';
    let i = text.length - 1;
    while (i >= 0) {
        const char = text[i];
        if (nonWordCharacters.includes(char)) {
            break;
        }
        lastWord = char + lastWord;
        i--;
    }

    return lastWord;
}