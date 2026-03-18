const videos = [
  {
    id: "1",
    title: "Exploring the Maldives",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    thumbnail: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop",
    duration: "10:24"
  },
  {
    id: "2",
    title: "Tokyo City Guide 2026",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop",
    duration: "15:45"
  },
  {
    id: "3",
    title: "Safari in Kenya",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    thumbnail: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800&auto=format&fit=crop",
    duration: "12:10"
  },
  {
    id: "4",
    title: "Paris: The City of Light",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    thumbnail: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop",
    duration: "08:50"
  },
  {
    id: "5",
    title: "Hiking in the Swiss Alps",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    duration: "11:30"
  }
];

function getVideos() {
  return videos;
}

module.exports = { getVideos };
