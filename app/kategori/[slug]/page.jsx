import { getSupabase } from "@/lib/supabase";
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

    const { data: tutorials, error } = await getSupabase().from('tutorial_list')
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
            <Suspense fallback={<Loading/>
            }>
                <KategoriList initialKategoris={tutorials || []} />
            </Suspense>
        </main>
        </div>
    );
}
