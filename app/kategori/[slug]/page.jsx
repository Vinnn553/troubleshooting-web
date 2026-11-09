import { getSupabase } from "@/lib/supabase";
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

    const { data: tutorials, error } = await getSupabase()
        .from('tutorial_list')
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
            <Header />
            <main className="p-6 pt-20">
                <KategoriList initialKategoris={tutorials} />
            </main>
        </div>
    );
}
