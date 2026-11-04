'use client'
import Modal from "@/app/components/Modal";
import { useState } from "react";

// Komponen child terpisah agar await params tidak memblokir prerender
export default function KategoriList({ initialKategoris = [] }) {

    const [selectedTutorial, setSelectedTutorial] = useState(null)
    const tutorials = initialKategoris.length > 0 ? initialKategoris : [];

    return (
        <div className="card-group flex flex-wrap gap-4">
            {tutorials.map((item) => (
                <article key={item.id} onClick={() => setSelectedTutorial(item)} className="card-list p-3 bg-white border-gray-300 rounded-2xl w-85 h-[200px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer">
                    <div className="card-data flex flex-col">
                        <h3 className="nama_kategori text-[.8rem] font-semibold text-[#42a6f8] bg-[#E8F5E9] rounded-full text-center p-0.5 w-30 mb-3">{item.kategori}</h3>
                        <h2 className="nama_masalah text-2xl font-semibold">{item.title}</h2>
                    </div>
                    <div className="level flex gap-1.5">
                        <span className="bg-gray-400 text-sm text-gray-800 rounded-full font-semibold p-0.5 px-1">{item.level}</span>
                    </div>
                    <div className="flex items-center text-sm font-semibold text-[#42a6f8] gap-1 group-hover:gap-2 transition-all">
                        <span>Lihat Solusi</span>
                        <i className="ri-arrow-right-line"></i>
                    </div>
                </article>
            ))}
            <Modal isOpen={Boolean(selectedTutorial)} tutorial={selectedTutorial} onClose={() => setSelectedTutorial(null)}/>
        </div>
    );
}