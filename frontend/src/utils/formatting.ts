export const titleize = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const sentenceCapitalize = (text: string | null | undefined): string => {
  if (!text) {
    return ''; // Return empty string if input is null, undefined, or empty
  }
  return text
    .toLowerCase()
    .split('. ')
    .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1))
    .join('. ');
}; 