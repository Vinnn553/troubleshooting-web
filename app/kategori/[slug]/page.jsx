import { supabase } from "@/lib/supabase";
import { Suspense } from "react";
import KategoriList from "./KategoriList";
import Loading from "./loading";
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

    const loadingTime = new Promise((resolve) => {
        setTimeout(resolve, 2000)
    })

    const { data: tutorials, error } = await supabase.from('tutorial_list')
        .select('*')
        .eq('kategori', namaKategori).order('id', { ascending: false })

    await loadingTime;

    if (error) {
        return (
            <div className="w-full grid justify-center self-center items-center">
                <article className="grid bg-white border-gray-300 rounded-2xl justify-center items-center self-center mt-10 border py-20 px-50">
                    <h1 className="text-4xl">Yahhh... tutorial belum tersedia😔</h1>
                </article>
            </div>
        )
    }

    if (!tutorials || tutorials.length === 0) {
        return <p className="text-center text-slate-500 mt-10">Belum ada tutorial untuk kategori ini.</p>;
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
