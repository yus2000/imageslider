// Konfigurasi Supabase Anda
const SUPABASE_URL = https://voayxgrxsehjynulutsx.supabase.co;
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYXl4Z3J4c2VoanludWx1dHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNDA3MDgsImV4cCI6MjEwMDgxNjcwOH0.RJfPjzBonn8v3pl3Az3XeFE46W4yMyuHdDe9tOp9yfA;
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let slides = [];
let currentIndex = 0;
let slideInterval = 5000; // Durasi gambar (5 detik)

async function fetchAndSyncSlides() {
    try {
        // Coba ambil data terbaru dari Supabase (jika ada internet)
        let { data, error } = await supabaseClient.from('slides').select('*');
        if (!error && data && data.length > 0) {
            slides = data;
            // Simpan ke localStorage sebagai cache offline
            localStorage.setItem('offline_slides', JSON.stringify(slides));
            console.log("Data berhasil disinkronkan dari Supabase.");
        } else {
            throw new Error("Gagal ambil dari server, pakai cache lokal.");
        }
    } catch (err) {
        console.log("Koneksi internet terputus/gagal. Menggunakan mode Offline.");
        // Ambil data cadangan dari memori lokal Smart TV
        let localData = localStorage.getItem('offline_slides');
        if (localData) {
            slides = JSON.parse(localData);
        } else {
            // Data default darurat jika belum pernah tersinkron sama sekali
            slides = [{ type: 'image', url: 'https://via.placeholder.com/1920x1080.png?text=Belum+Ada+Konten' }];
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