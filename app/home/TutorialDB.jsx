export default async function TutorialDb() {
    // Ambil data tutorial dari Supabase dengan aman
      let tutorials = [];
      try {
        const { data, error } = await supabase
          .from('tutorial_list')
          .select('*')
          .order('id', { ascending: false });
    
        if (!error && data) {
          tutorials = data;
        }
      } catch (err) {
        console.error("Gagal terhubung ke Supabase:", err);
      }

      return {
        
      }
}