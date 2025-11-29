
export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080/api'
  : '/api';

export const SOCIAL_PLATFORMS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Twitter/X',
  'LinkedIn',
  'Other'
];

export const GENRES = [
  'Sci-Fi',
  'Documentary',
  'Drama',
  'Thriller',
  'Experimental',
  'AI Generated'
];

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_47obylq',
  CASTING_TEMPLATE_ID: 'template_goc785c',
  SPONSOR_TEMPLATE_ID: 'template_x2x2miw',
  PUBLIC_KEY: 'urOrIucPP5N9SzBeu'
};

// Using a standard open source test video for demonstration purposes
const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const MOCK_MOVIES = [
  {
    id: '1',
    title: 'Neon Horizon',
    description: 'A cyberpunk saga exploring the boundaries of artificial consciousness in a decaying metropolis.',
    year: 2025,
    genre: ['Sci-Fi', 'Thriller'],
    duration: '1h 45m',
    matchScore: 98,
    resolutionTag: '4K',
    thumbnailUrl: 'https://picsum.photos/800/450?random=1',
    videoUrl: SAMPLE_VIDEO,
    isFeaturedHome: true,
    isFeaturedMovies: true
  },
  {
    id: '2',
    title: 'The Algorithm\'s Echo',
    description: 'A documentary investigating the hidden patterns within global data streams.',
    year: 2024,
    genre: ['Documentary'],
    duration: '52m',
    matchScore: 85,
    resolutionTag: 'HD',
    thumbnailUrl: 'https://picsum.photos/800/450?random=2',
    videoUrl: SAMPLE_VIDEO,
    isFeaturedHome: false,
    isFeaturedMovies: true
  },
  {
    id: '3',
    title: 'Void Drifter',
    description: 'A lone astronaut navigates the silence of deep space.',
    year: 2025,
    genre: ['Sci-Fi', 'Drama'],
    duration: '2h 10m',
    matchScore: 92,
    resolutionTag: '8K',
    thumbnailUrl: 'https://picsum.photos/800/450?random=3',
    videoUrl: SAMPLE_VIDEO,
    isFeaturedHome: false,
    isFeaturedMovies: true
  },
  {
    id: '4',
    title: 'Synthetic Dreams',
    description: 'An experimental anthology of AI-generated visuals and soundscapes.',
    year: 2023,
    genre: ['Experimental', 'AI Generated'],
    duration: '30m',
    matchScore: 88,
    resolutionTag: '4K',
    thumbnailUrl: 'https://picsum.photos/800/450?random=4',
    videoUrl: SAMPLE_VIDEO,
    isFeaturedHome: false,
    isFeaturedMovies: true
  }
];
