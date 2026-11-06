'use client'
import { useState } from "react"
import Modal from "../components/Modal"
export default function TutorialList({ initialTutorials = []}) {

    const [selectedTutorial, setSelectedTutorial] = useState(null)
    const dataToDisplay = initialTutorials.length > 0 ? initialTutorials : [];
    return (
        <div>
            {/* Tutorial Section */}
            <section className="tutorial section mb-10">
                <div className="container-content mx-6 md:mx-36">
                    <div className="mb-10">
                        <span className="text-xs uppercase tracking-wider font-bold text-[#42a6f8] bg-[#E8F5E9] px-3.5 py-1.5 rounded-full inline-block mb-3">
                            Tutorial Troubleshooting
                        </span>
                        <h2 className="text-3xl md:text-4xl text-gray-800 font-bold mb-2">
                            Pemecahan Masalah
                        </h2>
                        <p className="text-gray-500 text-base max-w-2xl">
                            Pilih kategori kendala yang sedang Anda hadapi untuk melihat panduan perbaikannya secara sistematis.
                        </p>
                    </div>
                    <div className="card-group flex flex-wrap gap-4">
                        {dataToDisplay.map((item => (
                            <article key={item.id} onClick={() => setSelectedTutorial(item)} className="card-list p-3 bg-white border-gray-300 rounded-2xl w-85 h-[200px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer">
                            <div className="card-data flex flex-col">
                                <h3 className="nama_kategori text-[.8rem] font-semibold text-[#42a6f8] bg-[#E8F5E9] rounded-full text-center p-0.5 w-30 mb-3">{item.kategori}</h3>
                                <h2 className="nama_masalah text-2xl font-semibold">{item.title}</h2>
                            </div>
                            <div className="level flex gap-1.5">
                                    <span className="bg-gray-400 text-sm text-gray-800 rounded-full font-semibold p-0.5 px-1">{item.level}</span>
                            </div>
                            <div className="flex items-center text-sm font-semibold text-[#42a6f8] gap-1 group-hover:gap-2 transition-all">
                                <span className="">Lihat Solusi</span>
                                <i className="ri-arrow-right-line"></i>
                            </div>
                        </article>
                        )))}
                    </div>
                </div>
            </section>

            {selectedTutorial && (
                <Modal
                    isOpen
                    tutorial={selectedTutorial}
                    onClose={() => setSelectedTutorial(null)}
                />
            )}
        </div>
    )
}