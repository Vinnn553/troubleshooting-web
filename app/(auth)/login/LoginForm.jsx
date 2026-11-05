'use client'
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn('credentials', {
            email,
            password,
            callbackUrl: `${window.location.origin}/dashboard`,
            redirect: false, // Jangan biarkan NextAuth me-redirect otomatis
        });

        setLoading(false);

        if (result?.error) {
            setError("Email atau password salah!");
        } else if (result?.ok) {
            router.push('/dashboard'); // Arahkan ke halaman admin setelah sukses
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md w-96 space-y-4">
                <h2 className="text-2xl font-bold text-center text-gray-800">Login Admin</h2>
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
                        {error}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded-lg mt-1"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded-lg mt-1"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#42a6f8] text-white p-2 rounded-lg font-semibold hover:bg-[#3283c7] disabled:opacity-50"
                >
                    {loading ? "Memproses..." : "Masuk"}
                </button>
            </form>
        </div>
    );
}