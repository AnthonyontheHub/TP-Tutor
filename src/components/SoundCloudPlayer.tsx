import React from 'react';

interface SoundCloudPlayerProps {
  url: string;
  height?: number | string;
}

export default function SoundCloudPlayer({ url, height = 300 }: SoundCloudPlayerProps) {
  if (!url) return null;
  
  // Encode the URL to be safe for the iframe
  const encodedUrl = encodeURIComponent(url);
  const embedUrl = `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23d4af37&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;

  return (
    <div className="glass-panel overflow-hidden rounded-xl mb-6 border border-[var(--gold)]/20 shadow-lg shadow-black/40">
      <iframe
        width="100%"
        height={height}
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={embedUrl}
      ></iframe>
    </div>
  );
}
