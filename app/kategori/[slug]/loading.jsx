import Header from "@/app/components/Header";

export default function Loading() {
    return (
        <div>
            <Header />
            <main className="p-6 pt-20">
                <article className="card-list animate-pulse p-3 bg-white border-gray-300 rounded-2xl w-85 h-[200px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between cursor-pointer">
                    <div className="card-data flex flex-col gap-3">
                        <h3 className="nama_kategori text-[.8rem] font-semibold size-5 text-[#42a6f8] bg-[#E8F5E9] rounded-full text-center p-0.5 w-30 mb-3"></h3>
                        <h2 className="nama_masalah text-2xl bg-gray-400 w-20 size-5 rounded-full font-semibold"></h2>
                        <h2 className="bg-gray-500 w-50 size-4 rounded-full"></h2>
                    </div>
                </article>
            </main>
        </div>
    )
}