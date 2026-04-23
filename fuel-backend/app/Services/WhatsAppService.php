<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $token;
    private string $apiUrl = 'https://api.fonnte.com/send';

    public function __construct()
    {
        $this->token = config('services.fonnte.token', '');
    }

    /**
     * Kirim pesan WhatsApp ke nomor tertentu
     */
    public function send(string $phone, string $message): bool
    {
        if (empty($this->token)) {
            Log::warning('WhatsApp: FONNTE_TOKEN belum dikonfigurasi di .env');
            return false;
        }

        // Normalisasi nomor: pastikan diawali 62 (Indonesia)
        $phone = $this->normalizePhone($phone);
        if (!$phone) return false;

        try {
            $response = Http::withHeaders(['Authorization' => $this->token])
                ->post($this->apiUrl, [
                    'target'  => $phone,
                    'message' => $message,
                    'delay'   => '2',
                ]);

            if ($response->successful()) {
                Log::info("WhatsApp terkirim ke {$phone}");
                return true;
            }

            Log::error('WhatsApp gagal: ' . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Template pesan berdasarkan status delivery
     */
    public function getStatusMessage(string $status, array $delivery): string
    {
        $code    = $delivery['delivery_code'] ?? '-';
        $driver  = $delivery['driver_name']   ?? 'Driver';
        $address = $delivery['address']       ?? '-';
        $total   = 'Rp ' . number_format($delivery['total_price'] ?? 0, 0, ',', '.');

        $templates = [
            'PACKED' => "📦 *Update Pengiriman BBM*\n\nHalo, pesanan Anda sedang dikemas!\n\n🔖 Kode: *{$code}*\n📍 Tujuan: {$address}\n🚚 Driver: {$driver}\n\nKami akan segera mengirimkan BBM Anda.",

            'IN_TRANSIT' => "🚚 *Driver Sudah Berangkat!*\n\nDriver Anda sedang dalam perjalanan menuju lokasi.\n\n🔖 Kode: *{$code}*\n👷 Driver: {$driver}\n📍 Menuju: {$address}\n\nSilakan pantau secara real-time melalui aplikasi.",

            'NEAR_DESTINATION' => "📍 *Driver Hampir Tiba!*\n\nDriver Anda sudah mendekati lokasi pengiriman.\n\n🔖 Kode: *{$code}*\n\nHarap bersiap menerima pengiriman BBM.",

            'DELIVERED' => "✅ *BBM Telah Terkirim!*\n\nPengiriman Anda telah sampai di tujuan.\n\n🔖 Kode: *{$code}*\n💰 Total: {$total}\n\nTerima kasih telah menggunakan layanan kami! 🙏",

            'COMPLETED' => "🎉 *Pengiriman Selesai!*\n\nTransaksi Anda telah selesai dan tercatat.\n\n🔖 Kode: *{$code}*\n💰 Total: {$total}\n\nBerikan rating untuk driver Anda melalui aplikasi.\nTerima kasih! ⛽",
        ];

        return $templates[$status] ?? "Update pengiriman {$code}: status berubah ke {$status}.";
    }

    private function normalizePhone(?string $phone): ?string
    {
        if (!$phone) return null;
        $phone = preg_replace('/\D/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        } elseif (!str_starts_with($phone, '62')) {
            $phone = '62' . $phone;
        }
        return strlen($phone) >= 10 ? $phone : null;
    }
}
