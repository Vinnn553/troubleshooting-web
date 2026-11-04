import Link from "next/link";

export default function CategorySection() {
    return (
        <div>
            {/* Kategori Section */}
            <section id="kategori" className="kategori section pt-20 mb-24">
                <div className="kategori container-content mx-6 md:mx-36">
                    <div className="mb-10">
                        <span className="text-xs uppercase tracking-wider font-bold text-[#42a6f8] bg-[#E8F5E9] px-3.5 py-1.5 rounded-full inline-block mb-3">
                            Katalog Troubleshooting
                        </span>
                        <h2 className="text-3xl md:text-4xl text-gray-800 font-bold mb-2">
                            Kategori Masalah
                        </h2>
                        <p className="text-gray-500 text-base max-w-2xl">
                            Pilih kategori kendala yang sedang Anda hadapi untuk melihat panduan perbaikannya secara sistematis.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                        <Link href={"/kategori/sistem-operasi"}>
                            <article className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer">
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] text-[#42a6f8] flex items-center justify-center text-3xl mb-5 group-hover:bg-[#42a6f8] group-hover:text-white group-hover:rotate-6 transition-all duration-300 shadow-sm">
                                        <i className="ri-windows-fill"></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#42a6f8] transition-colors">
                                        Operating System
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                        Solusi kendala Blue Screen (BSOD), bootloop, gagal update, dan sistem operasi yang lambat.
                                    </p>
                                </div>
                                <div className="flex items-center text-sm font-semibold text-[#42a6f8] gap-1 group-hover:gap-2 transition-all">
                                    <span>Lihat Solusi</span>
                                    <i className="ri-arrow-right-line"></i>
                                </div>
                            </article>
                        </Link>

                        <Link href={"/kategori/hardware-software"}>
                        <article className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] text-[#42a6f8] flex items-center justify-center text-3xl mb-5 group-hover:bg-[#42a6f8] group-hover:text-white group-hover:rotate-6 transition-all duration-300 shadow-sm">
                                    <i className="ri-cpu-line"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#42a6f8] transition-colors">
                                    Hardware & Software Komputer
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                    Diagnosis RAM error, CPU overheat, display mati/blank, dan kerusakan power supply.
                                </p>
                            </div>
                            <div className="flex items-center text-sm font-semibold text-[#42a6f8] gap-1 group-hover:gap-2 transition-all">
                                <span>Lihat Solusi</span>
                                <i className="ri-arrow-right-line"></i>
                            </div>
                        </article>
                        </Link>

                        <Link href={"/kategori/jaringan"}>
                        <article className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] text-[#42a6f8] flex items-center justify-center text-3xl mb-5 group-hover:bg-[#42a6f8] group-hover:text-white group-hover:rotate-6 transition-all duration-300 shadow-sm">
                                    <i className="ri-wifi-line"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#42a6f8] transition-colors">
                                    Jaringan & WiFi
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                    Koneksi no internet access, kabel LAN unidentified, IP conflict, dan konfigurasi router.
                                </p>
                            </div>
                            <div className="flex items-center text-sm font-semibold text-[#42a6f8] gap-1 group-hover:gap-2 transition-all">
                                <span>Lihat Solusi</span>
                                <i className="ri-arrow-right-line"></i>
                            </div>
                        </article>
                        </Link>

                        <Link href={"/kategori/storage-driver"}>
                        <article className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] text-[#42a6f8] flex items-center justify-center text-3xl mb-5 group-hover:bg-[#42a6f8] group-hover:text-white group-hover:rotate-6 transition-all duration-300 shadow-sm">
                                    <i className="ri-hard-drive-2-line"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#42a6f8] transition-colors">
                                    Storage & Driver
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                    Harddisk / SSD bad sector, partisi tidak terdeteksi, serta corrupt atau missing driver.
                                </p>
                            </div>
                            <div className="flex items-center text-sm font-semibold text-[#42a6f8] gap-1 group-hover:gap-2 transition-all">
                                <span>Lihat Solusi</span>
                                <i className="ri-arrow-right-line"></i>
                            </div>
                        </article>
                        </Link>

                    </div>
                </div>
            </section>
        </div>
    )
}