export type Language = 'id' | 'en';

export const translations = {
  id: {
    // Header
    brand: 'PakMail',
    home: 'Beranda',
    docs: 'Dokumentasi',
    language: 'Bahasa',

    // Hero
    badge: 'Gratis • Tanpa daftar • 100% sementara',
    hero_title_1: 'Email sementara instan untuk',
    hero_title_2: 'inbox yang bersih',
    hero_subtitle:
      'Buat alamat email sekali pakai dalam satu klik. Gunakan untuk formulir, uji coba, atau verifikasi — tanpa spam masuk ke email utama Anda.',
    security_note: 'Email sementara — jangan digunakan untuk akun atau layanan penting.',

    // Creator
    choose_service: 'Pilih Server Layanan',
    server_1_badge: 'Utama',
    server_2_badge: 'Skalabel',
    server_3_badge: 'Cadangan',
    gmail_badge: 'Gmail',
    username_label: 'Nama Pengguna Kustom',
    username_placeholder: 'nama-pilihan-anda',
    random_btn: 'Acak',
    domain_label: 'Pilih Domain',
    create_submit: 'Buat Alamat Email',
    create_submitting: 'Menyiapkan alamat…',
    auto_generate_hint: 'Layanan ini akan menghasilkan alamat acak secara otomatis.',

    // Active Mailbox Card
    active_address_title: 'Alamat Email Aktif Anda',
    copy_address: 'Salin',
    copied: 'Tersalin!',
    refresh_now: 'Segarkan',
    new_address: 'Buat Baru',
    qr_code: 'Kode QR',
    share_link: 'Bagikan',
    send_test_email: 'Kirim Email Tes',
    delete_mailbox: 'Hapus',
    delete_confirm: 'Apakah Anda yakin ingin menghapus email ini dari browser Anda?',
    auto_refresh_in: 'Pembaruan otomatis dalam {sec}s',
    auto_refresh_paused: 'Pembaruan otomatis dijeda (tab tidak aktif)',

    // Inbox
    inbox_title: 'Kotak Masuk',
    inbox_empty_title: 'Menunggu email masuk…',
    inbox_empty_desc:
      'Alamat email sementara Anda sudah aktif dan siap menerima email dari mana saja. Kotak masuk akan diperbarui otomatis setiap beberapa detik.',
    no_subject: '(Tanpa Subjek)',
    just_now: 'baru saja',
    minutes_ago: '{min} menit lalu',
    hours_ago: '{hr} jam lalu',
    days_ago: '{d} hari lalu',
    attachments_count: '{count} lampiran',

    // Message Drawer
    message_from: 'Dari',
    message_to: 'Kepada',
    message_date: 'Waktu',
    view_html: 'HTML (Tampilan Asli)',
    view_text: 'Teks Biasa',
    verification_code_found: 'Kode Verifikasi Terdeteksi',
    copy_code: 'Salin Kode',
    attachments: 'Lampiran',
    download: 'Unduh',
    delete_message: 'Hapus Pesan',
    close: 'Tutup',

    // QR Modal
    qr_modal_title: 'Kode QR Alamat Email',
    qr_modal_desc: 'Pindai kode QR ini menggunakan ponsel cerdas Anda untuk menyalin atau mengirim email ke alamat ini.',
    done: 'Selesai',

    // Share Modal
    share_modal_title: 'Bagikan Kotak Masuk',
    share_modal_desc:
      'Gunakan tautan ini untuk membuka kembali atau membagikan kotak masuk ini kepada orang lain.',
    share_url_label: 'Tautan Berbagi Resmi',
    share_hint: 'Siapa pun yang memiliki tautan dengan token akses ini dapat melihat pesan yang masuk.',

    // Test Email Modal / Action
    test_email_sent_title: 'Email Tes Terkirim!',
    test_email_sent_desc: 'Email uji coba verifikasi telah dikirim ke kotak masuk Anda. Segarkan untuk melihat.',

    // Features Section
    features_how: 'Cara kerjanya',
    steps: [
      {
        title: 'Buat alamat',
        desc: 'Klik satu tombol — alamat email sementara langsung dibuat, tanpa daftar atau verifikasi.',
      },
      {
        title: 'Pakai di mana saja',
        desc: 'Salin alamatnya dan gunakan untuk formulir, uji coba, atau verifikasi sekali pakai.',
      },
      {
        title: 'Baca & buang',
        desc: 'Pesan masuk langsung tampil di inbox. Hapus alamat kapan saja, tidak ada jejak.',
      },
    ],
    features_why: 'Kenapa PakMail?',
    features_list: [
      {
        title: 'Instan & gratis',
        desc: 'Email dibuat dalam hitungan detik, tanpa biaya dan tanpa batas pemakaian.',
      },
      {
        title: 'Lindungi privasi',
        desc: 'Jauhkan spam dan email pemasaran dari inbox utama Anda.',
      },
      {
        title: 'Akses API publik',
        desc: 'Integrasikan layanan ke aplikasi Anda lewat API ber-dokumentasi lengkap.',
      },
      {
        title: 'Tanpa daftar',
        desc: 'Tidak ada akun, tidak ada kata sandi, tidak ada pelacakan. Buka & langsung pakai.',
      },
    ],
    cta_title: 'Ingin mengintegrasikan layanan ini ke aplikasi Anda?',
    cta_desc: 'Dokumentasi lengkap dengan contoh cURL, JavaScript, dan Python.',
    cta_btn: 'Buka Dokumentasi API',

    // Footer
    footer_text: 'email sementara, gratis & tanpa daftar.',
    footer_disclaimer: 'Jangan gunakan untuk akun penting.',
  },
  en: {
    // Header
    brand: 'PakMail',
    home: 'Home',
    docs: 'Documentation',
    language: 'Language',

    // Hero
    badge: 'Free • No signup • 100% disposable',
    hero_title_1: 'Instant temporary email for a',
    hero_title_2: 'clean inbox',
    hero_subtitle:
      'Generate a disposable email address in one click. Use it for forms, trials, or verifications — keeping spam away from your primary inbox.',
    security_note: 'Temporary email — do not use for important accounts or critical services.',

    // Creator
    choose_service: 'Select Service Server',
    server_1_badge: 'Main',
    server_2_badge: 'Scalable',
    server_3_badge: 'Backup',
    gmail_badge: 'Gmail',
    username_label: 'Custom Username',
    username_placeholder: 'your-chosen-name',
    random_btn: 'Random',
    domain_label: 'Select Domain',
    create_submit: 'Create Email Address',
    create_submitting: 'Generating address…',
    auto_generate_hint: 'This service automatically creates a randomized address.',

    // Active Mailbox Card
    active_address_title: 'Your Active Temporary Email',
    copy_address: 'Copy',
    copied: 'Copied!',
    refresh_now: 'Refresh',
    new_address: 'New Address',
    qr_code: 'QR Code',
    share_link: 'Share',
    send_test_email: 'Send Test Email',
    delete_mailbox: 'Delete',
    delete_confirm: 'Are you sure you want to delete this mailbox from your browser?',
    auto_refresh_in: 'Auto-refresh in {sec}s',
    auto_refresh_paused: 'Auto-refresh paused (tab inactive)',

    // Inbox
    inbox_title: 'Inbox',
    inbox_empty_title: 'Waiting for incoming emails…',
    inbox_empty_desc:
      'Your temporary email address is active and ready to receive messages from anywhere. The inbox automatically refreshes every few seconds.',
    no_subject: '(No Subject)',
    just_now: 'just now',
    minutes_ago: '{min}m ago',
    hours_ago: '{hr}h ago',
    days_ago: '{d}d ago',
    attachments_count: '{count} attachment(s)',

    // Message Drawer
    message_from: 'From',
    message_to: 'To',
    message_date: 'Date',
    view_html: 'HTML (Rendered)',
    view_text: 'Plain Text',
    verification_code_found: 'Verification Code Detected',
    copy_code: 'Copy Code',
    attachments: 'Attachments',
    download: 'Download',
    delete_message: 'Delete Message',
    close: 'Close',

    // QR Modal
    qr_modal_title: 'Email Address QR Code',
    qr_modal_desc: 'Scan this QR code with your smartphone camera to copy or send an email to this address.',
    done: 'Done',

    // Share Modal
    share_modal_title: 'Share Mailbox',
    share_modal_desc: 'Use this link to reopen or share this temporary mailbox with others.',
    share_url_label: 'Official Share Link',
    share_hint: 'Anyone with this link and access token can view incoming messages.',

    // Test Email Modal / Action
    test_email_sent_title: 'Test Email Sent!',
    test_email_sent_desc: 'A verification test email has been sent to your inbox. Refresh to view.',

    // Features Section
    features_how: 'How it works',
    steps: [
      {
        title: 'Create address',
        desc: 'Click a single button — a disposable email address is generated instantly with no registration required.',
      },
      {
        title: 'Use anywhere',
        desc: 'Copy the address and use it for signups, trial accounts, or one-time verifications.',
      },
      {
        title: 'Read & discard',
        desc: 'Incoming emails appear directly in your inbox. Delete the address anytime, leaving zero trace.',
      },
    ],
    features_why: 'Why PakMail?',
    features_list: [
      {
        title: 'Instant & free',
        desc: 'Emails generated within seconds, completely free with unlimited usage.',
      },
      {
        title: 'Protect privacy',
        desc: 'Keep spam, promotional clutter, and tracking away from your personal inbox.',
      },
      {
        title: 'Public API access',
        desc: 'Seamlessly integrate temporary email into your apps using our well-documented API.',
      },
      {
        title: 'Zero registration',
        desc: 'No accounts, no passwords, no personal tracking. Open and start using right away.',
      },
    ],
    cta_title: 'Want to integrate this service into your app?',
    cta_desc: 'Complete documentation with code examples in cURL, JavaScript, and Python.',
    cta_btn: 'Open API Documentation',

    // Footer
    footer_text: 'temporary disposable email, free & no registration.',
    footer_disclaimer: 'Do not use for critical accounts.',
  },
};
