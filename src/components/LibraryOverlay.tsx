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
    <div className="fixed inset-0 z-[1000] flex bg-[#1a1814] text-[#e8e0d0] font-serif">
      {/* Sidebar */}
      <div className="w-80 border-r border-[#3a3528] flex flex-col">
        <div className="p-6 border-b border-[#3a3528] flex justify-between items-center">
          <h2 className="font-bold tracking-wider uppercase text-sm text-[#c8b97a]">Table of Contents</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#8b8575]" size={16} />
            <input 
              placeholder="Search concepts..."
              className="w-full pl-10 pr-4 py-2 bg-[#2a2720] border-none rounded-md placeholder:text-[#8b8575] text-[#e8e0d0]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChapters.map(ch => (
            <button 
              key={ch.id}
              className={`w-full text-left px-6 py-4 border-b border-[#2a2720] hover:bg-[#2a2720] transition-colors ${selectedChapterId === ch.id ? 'bg-[#2a2720] font-bold text-[#c8b97a]' : ''}`}
              onClick={() => setSelectedChapterId(ch.id)}
            >
              {ch.title}
            </button>
          ))}
        </div>
      </div>

      {/* Reading Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 md:p-20"
        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowWrap: 'break-word', wordBreak: 'break-word', padding: '0 16px', paddingTop: '40px', paddingBottom: '40px' }}
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 border-b-2 border-[#c8b97a] pb-6 text-[#c8b97a]">{selectedChapter.title}</h1>
          <div className="space-y-10 leading-relaxed text-lg">
            {selectedChapter.sections.map((sec, i) => (
              <div key={i}>
                <h3 className="text-xl font-bold mb-3 text-[#c8b97a]">{sec.subtitle}</h3>
                <ReactMarkdown>{sec.content}</ReactMarkdown>
              </div>
            ))}
          </div>
          
          <div className="mt-20 pt-10 border-t border-[#3a3528]">
            <button 
              onClick={() => onJumpToRoadmap(selectedChapter.relatedNodeIds[0])}
              className="flex items-center gap-2 text-[#c8b97a] font-bold hover:text-white transition-colors"
            >
              <ChevronLeft size={20} /> Jump to Lesson Roadmap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
