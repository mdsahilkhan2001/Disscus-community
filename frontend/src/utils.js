export const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Already absolute
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    // Remove leading slash if both exist to avoid double slash, though usually fine.
    // Ensure clean content concatenation.
    return `${baseUrl}${path}`;
};
