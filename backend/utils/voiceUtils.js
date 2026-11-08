/**
 * Voice Engine Utility Functions
 * Used for speech sanitization, text-to-speech cleaning, and duplicate transcript prevention.
 */

const sanitizeTextForSpeech = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    // Remove markdown code blocks ``` ... ```
    .replace(/```[\s\S]*?```/g, '')
    // Remove markdown inline code `...`
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown headers #, ##, ###
    .replace(/^#{1,6}\s+/gm, '')
    // Remove markdown bold/italic **text**, *text*, __text__, _text_
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove prompt directives [Presented Coding Challenge]:, [Candidate Verbal Explanation]: etc
    .replace(/\[(?:Presented|Submitted|Candidate)[^\]]*\]:?/gi, '')
    // Remove markdown bullets •, -, *
    .replace(/^[\s]*[•\-\*]\s+/gm, '')
    // Remove JSON-like wrappers or curly braces
    .replace(/\{[\s\S]*?\}/g, '')
    // Remove emojis and non-standard symbols
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Replace multiple spaces and newlines with a single space
    .replace(/\s+/g, ' ')
    .trim();
};

const mergeTranscriptSegments = (existing, incoming) => {
  const cleanExisting = (existing || '').trim();
  const cleanIncoming = (incoming || '').trim();
  if (!cleanIncoming) return cleanExisting;
  if (!cleanExisting) return cleanIncoming;

  const existingWords = cleanExisting.split(/\s+/);
  const incomingWords = cleanIncoming.split(/\s+/);

  const maxOverlap = Math.min(6, existingWords.length, incomingWords.length);
  for (let len = maxOverlap; len > 0; len--) {
    const endSlice = existingWords.slice(-len).join(' ').toLowerCase();
    const startSlice = incomingWords.slice(0, len).join(' ').toLowerCase();
    if (endSlice === startSlice) {
      const nonOverlapping = incomingWords.slice(len).join(' ');
      return nonOverlapping ? `${cleanExisting} ${nonOverlapping}` : cleanExisting;
    }
  }

  return `${cleanExisting} ${cleanIncoming}`;
};

module.exports = {
  sanitizeTextForSpeech,
  mergeTranscriptSegments
};

