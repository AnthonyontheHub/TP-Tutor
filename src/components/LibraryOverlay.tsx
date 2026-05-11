import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Search, BookOpen, ChevronLeft } from 'lucide-react';
import { textbookContent } from '../data/textbook';

interface LibraryOverlayProps {
  initialChapterId?: string;
  onClose: () => void;
  onJumpToRoadmap: (nodeId: string) => void;
}

export const LibraryOverlay: React.FC<LibraryOverlayProps> = ({ initialChapterId, onClose, onJumpToRoadmap }) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(initialChapterId || textbookContent[0]?.id);
  const [search, setSearch] = useState('');

  const filteredChapters = useMemo(() => {
    return textbookContent.filter(ch => 
      ch.title.toLowerCase().includes(search.toLowerCase()) || 
      ch.sections.some(s => s.content.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search]);

  const selectedChapter = textbookContent.find(ch => ch.id === selectedChapterId) || textbookContent[0];

  return (
    <div className="fixed inset-0 z-[1000] flex bg-[#fdfbf7] text-[#2c2c2c] font-serif">
      {/* Sidebar */}
      <div className="w-80 border-r border-[#dcd8ce] flex flex-col">
        <div className="p-6 border-b border-[#dcd8ce] flex justify-between items-center">
          <h2 className="font-bold tracking-wider uppercase text-sm text-[#8b8575]">Table of Contents</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#a8a395]" size={16} />
            <input 
              placeholder="Search concepts..."
              className="w-full pl-10 pr-4 py-2 bg-[#f4f0e6] border-none rounded-md placeholder:text-[#a8a395]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChapters.map(ch => (
            <button 
              key={ch.id}
              className={`w-full text-left px-6 py-4 border-b border-[#f0ece2] hover:bg-[#f4f0e6] transition-colors ${selectedChapterId === ch.id ? 'bg-[#f4f0e6] font-bold' : ''}`}
              onClick={() => setSelectedChapterId(ch.id)}
            >
              {ch.title}
            </button>
          ))}
        </div>
      </div>

      {/* Reading Area */}
      <div className="flex-1 overflow-y-auto p-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 border-b-2 border-[#8b8575] pb-6">{selectedChapter.title}</h1>
          <div className="space-y-10 leading-relaxed text-lg">
            {selectedChapter.sections.map((sec, i) => (
              <div key={i}>
                <h3 className="text-xl font-bold mb-3 text-[#5c584a]">{sec.subtitle}</h3>
                <ReactMarkdown>{sec.content}</ReactMarkdown>
              </div>
            ))}
          </div>
          
          <div className="mt-20 pt-10 border-t border-[#dcd8ce]">
            <button 
              onClick={() => onJumpToRoadmap(selectedChapter.relatedNodeIds[0])}
              className="flex items-center gap-2 text-[#8b8575] font-bold hover:text-black transition-colors"
            >
              <ChevronLeft size={20} /> Jump to Lesson Roadmap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
