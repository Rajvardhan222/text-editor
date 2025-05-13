export default function copyStyles(source,target) {

    // this function copies the styles from the source element to the target element

    const sourceStyles = window.getComputedStyle(source);

    [
        'border',
        'boxSizing',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'letterSpacing',
        'lineHeight',
        'padding',
        'textDecoration',
        'textIndent',
        'textTransform',
        'whiteSpace',
        'wordSpacing',
        'wordWrap',
    ].forEach((property) => {
        target.style[property] = sourceStyles[property];
    });

    
    
}