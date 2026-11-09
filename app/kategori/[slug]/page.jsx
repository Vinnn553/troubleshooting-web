import { supabase } from "@/lib/supabase";
import { Suspense } from "react";
import KategoriList from "./KategoriList";
import Header from "@/app/components/Header";

export const instant = false;

// Mapping slug URL → nama kategori di database Supabase
const slugToKategori = {
    'sistem-operasi': 'Sistem Operasi',
    'hardware': 'Hardware & Software',
    'jaringan': 'Jaringan',
    'storage-driver': 'Storage & Driver',
};

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const namaKategori = slugToKategori[slug];

    if (!namaKategori) {
        return {
            title: "Kategori tidak ditemukan",
            description: "Kategori tutorial tidak ditemukan.",
        };
    }

    return {
        title: `${namaKategori}`,
        description: `Lihat tutorial troubleshooting untuk kategori ${namaKategori}.`,
    };
}

export default async function KategoriPage({ params }) {
    const { slug } = await params;
    const namaKategori = slugToKategori[slug];

    if (!namaKategori) {
        return (
            <div>
                <Header />
                <main className="p-6 pt-20">
                    <p className="text-center text-slate-500 mt-10">Kategori tidak ditemukan.</p>
                </main>
            </div>
        );
    }

    const { data: tutorials, error } = await supabase.from('tutorial_list')
        .select('*')
        .eq('kategori', namaKategori)
        .order('id', { ascending: false });

    if (error) {
        return (
            <div>
                <Header />
                <main className="p-6 pt-20">
                    <div className="w-full flex justify-center items-center mt-10">
                        <article className="bg-white border border-gray-300 rounded-2xl p-10 text-center shadow-sm">
                            <h1 className="text-2xl font-bold text-slate-700">Yahhh... tutorial belum tersedia 😔</h1>
                        </article>
                    </div>
                </main>
            </div>
        );
    }

    if (!tutorials || tutorials.length === 0) {
        return (
            <div>
                <Header />
                <main className="p-6 pt-20">
                    <p className="text-center text-slate-500 mt-10">Belum ada tutorial untuk kategori ini.</p>
                </main>
            </div>
        );
    }

    return (
        <div>
        <Header/>
        <main className="p-6 pt-20">  
            <Suspense fallback={
                <article className="card-list p-3 animate-pulse bg-white border-gray-300 rounded-2xl w-85 h-[200px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer">
                    <div className="card-data flex flex-col">
                        <h3 className="nama_kategori text-[.8rem] font-semibold text-[#42a6f8] bg-[#E8F5E9] rounded-full text-center p-0.5 w-30 mb-3"></h3>
                        <h2 className="nama_masalah text-2xl font-semibold"></h2>
                    </div>
                    <div className="level flex gap-1.5">
                        <span className="bg-gray-400 text-sm text-gray-800 rounded-full font-semibold p-0.5 px-1"></span>
                    </div>
                    <div className="flex items-center text-sm font-semibold text-[#42a6f8] gap-1 group-hover:gap-2 transition-all">
                        <span></span>
                        <i className="ri-arrow-right-line"></i>
                    </div>
                </article>
            }>
                <KategoriList initialKategoris={tutorials || []} />
            </Suspense>
        </main>
        </div>
    );
}
