'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';
import { searchItem } from './Search';
import Modal from './Modal';

export default function Header({ onSearchResults }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  const containerRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      if (onSearchResults) onSearchResults([]);
    } else {
      setIsLoading(true);
      setIsOpen(true);
    }
  };

  // Debounced search: fetch data 300ms setelah user selesai mengetik
  useEffect(() => {
    if (!query.trim()) return;

    let ignore = false;
    const timer = setTimeout(async () => {
      try {
        const data = await searchItem(query);
        if (!ignore) {
          setResults(data);
          setIsLoading(false);
          if (onSearchResults) onSearchResults(data);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error saat melakukan pencarian:', err);
          setResults([]);
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query, onSearchResults]);

  // Tutup dropdown jika user klik di luar area searchbar
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tutup dropdown jika user menekan tombol Escape
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTutorial = (tutorial) => {
    setSelectedTutorial(tutorial);
    setIsOpen(false);
  };

  const handleClearQuery = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setIsLoading(false);
    if (onSearchResults) onSearchResults([]);
  };

  return (
    <>
      <header className="header fixed top-0 left-0 z-50 w-full py-3 px-6 bg-[#8dccff] shadow-sm">
        <nav className="nav max-w-7xl mx-auto flex w-full justify-between items-center gap-4">
          <div className="logo shrink-0">
            <Link href="/" className="nav-logo font-bold text-lg text-slate-800 hover:text-slate-900 transition-colors">
              Dekoruma.com
            </Link>
          </div>

          {/* Search Bar Container */}
          <div ref={containerRef} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400 pointer-events-none" size={16} />
              <input
                type="text"
                placeholder="Cari kendala, error, atau command..."
                value={query}
                onChange={handleInputChange}
                onFocus={() => {
                  if (query.trim()) setIsOpen(true);
                }}
                className="pl-9 pr-8 py-1.5 bg-white text-slate-800 placeholder-slate-400 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-52 sm:w-72 md:w-80 transition-all shadow-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClearQuery}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Dropdown Hasil Pencarian */}
            {isOpen && query.trim() && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-modal-content">
                {isLoading ? (
                  <div className="p-4 flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="animate-spin text-blue-500" size={18} />
                    <span>Mencari tutorial...</span>
                  </div>
                ) : results.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 flex justify-between items-center">
                      <span>Ditemukan {results.length} Tutorial</span>
                      <span className="text-[10px] text-slate-400 lowercase font-normal">klik untuk solusi</span>
                    </div>
                    {results.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTutorial(item)}
                        className="w-full text-left p-3 hover:bg-blue-50/70 transition-colors flex flex-col gap-1 cursor-pointer focus:bg-blue-50 focus:outline-none"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {item.kategori}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.level}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {item.title}
                        </h4>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center text-sm text-slate-500">
                    Tidak ditemukan tutorial yang cocok dengan &ldquo;<span className="font-semibold text-slate-700">{query}</span>&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Modal Popup Detail Tutorial saat salah satu hasil pencarian diklik */}
      <Modal
        isOpen={Boolean(selectedTutorial)}
        tutorial={selectedTutorial}
        onClose={() => setSelectedTutorial(null)}
      />
    </>
  );
}
