// Konfigurasi Supabase Anda
const SUPABASE_URL = "https://voayxgrxsehjynulutsx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYXl4Z3J4c2VoanludWx1dHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNDA3MDgsImV4cCI6MjEwMDgxNjcwOH0.RJfPjzBonn8v3pl3Az3XeFE46W4yMyuHdDe9tOp9yfA";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let slides = [];
let currentIndex = 0;
let slideInterval = 5000; // Durasi gambar (5 detik)

async function fetchAndSyncSlides() {
    try {
        let { data, error } = await supabaseClient.from('slides').select('*');
        
        // TAMBAHKAN BARIS INI UNTUK MELIHAT ERROR ASLINYA DI CONSOLE:
        if (error) {
            console.error("DETAIL ERROR SUPABASE:", error);
            throw error;
        }

        if (data && data.length > 0) {
            slides = data;
            localStorage.setItem('offline_slides', JSON.stringify(slides));
            console.log("Data berhasil disinkronkan dari Supabase.");
        } else {
            console.log("Tabel slides di Supabase kosong.");
        }
    } catch (err) {
        console.log("Koneksi/Ambil data gagal. Masuk mode offline. Alasan:", err.message);
        let localData = localStorage.getItem('offline_slides');
        if (localData) {
            slides = JSON.parse(localData);
        } else {
            slides = [{ type: 'image', url: 'https://via.placeholder.com/1920x1080.png?text=Belum+Ada+Konten+Offline' }];
        }
    }
    renderSlide();
}

function renderSlide() {
    if (slides.length === 0) return;
    
    const container = document.getElementById("slide-content");
    let current = slides[currentIndex];

    if (current.type === "image") {
        container.innerHTML = `<img src="${current.url}" alt="Slide">`;
        setTimeout(nextSlide, slideInterval);
    } else if (current.type === "video") {
        // Video akan otomatis lanjut ke slide berikutnya setelah selesai diputar
        container.innerHTML = `<video src="${current.url}" autoplay muted onended="nextSlide()"></video>`;
    }
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    renderSlide();
}

// Fungsi Fullscreen dengan perubahan teks tombol dinamis
function toggleFullScreen() {
    const btn = document.getElementById("btnFullscreen");
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Deteksi perubahan status fullscreen untuk mengubah teks tombol
document.addEventListener("fullscreenchange", () => {
    const btn = document.getElementById("btnFullscreen");
    if (document.fullscreenElement) {
        btn.innerText = "🗗 Normalscreen";
    } else {
        btn.innerText = "⛶ Fullscreen";
    }
});

// Jalankan saat halaman dimuat
window.onload = () => {
    fetchAndSyncSlides();
};
