<?php

namespace App\Services;

use App\Models\PushSubscription;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PushNotificationService
{
    private string $vapidPublicKey;
    private string $vapidPrivateKey;
    private string $subject;

    public function __construct()
    {
        $this->vapidPublicKey  = config('services.vapid.public_key', '');
        $this->vapidPrivateKey = config('services.vapid.private_key', '');
        $this->subject         = config('services.vapid.subject', 'mailto:admin@fueldelivery.com');
    }

    /**
     * Kirim push notification ke semua subscription milik user
     */
    public function sendToUser(int $userId, string $title, string $body, array $data = []): void
    {
        if (empty($this->vapidPublicKey) || empty($this->vapidPrivateKey)) {
            Log::info('Push notification skipped: VAPID keys belum dikonfigurasi');
            return;
        }

        $subscriptions = PushSubscription::where('user_id', $userId)->get();

        foreach ($subscriptions as $sub) {
            $this->send($sub, $title, $body, $data);
        }
    }

    /**
     * Kirim ke satu subscription
     */
    private function send(PushSubscription $sub, string $title, string $body, array $data): void
    {
        try {
            $payload = json_encode([
                'title' => $title,
                'body'  => $body,
                'icon'  => '/icon-192.png',
                'badge' => '/icon-72.png',
                'data'  => $data,
            ]);

            // Buat JWT VAPID header (simplified — gunakan library minischema/web-push untuk production)
            // Untuk sekarang, log saja sebagai placeholder agar tidak error
            Log::info("Push notification ke user {$sub->user_id}: {$title} - {$body}");

            // TODO: install minischema/web-push package lalu uncomment:
            // $webPush = new WebPush(['VAPID' => [
            //     'subject'    => $this->subject,
            //     'publicKey'  => $this->vapidPublicKey,
            //     'privateKey' => $this->vapidPrivateKey,
            // ]]);
            // $webPush->sendOneNotification(
            //     Subscription::create(['endpoint' => $sub->endpoint,
            //         'keys' => ['p256dh' => $sub->p256dh_key, 'auth' => $sub->auth_key]]),
            //     $payload
            // );

        } catch (\Exception $e) {
            Log::error("Push notification gagal: " . $e->getMessage());
        }
    }

    /**
     * Template notifikasi berdasarkan status delivery
     */
    public static function getStatusNotification(string $status, string $deliveryCode): array
    {
        $map = [
            'PACKED'           => ['📦 Pesanan Dikemas',      "Pesanan {$deliveryCode} sedang dikemas oleh gudang."],
            'IN_TRANSIT'       => ['🚚 Driver Berangkat!',    "Driver sedang menuju lokasi Anda untuk {$deliveryCode}."],
            'NEAR_DESTINATION' => ['📍 Driver Hampir Tiba!',  "Driver {$deliveryCode} sudah dekat. Bersiaplah!"],
            'DELIVERED'        => ['✅ BBM Terkirim!',        "Pengiriman {$deliveryCode} telah tiba. Silakan konfirmasi penerimaan."],
            'COMPLETED'        => ['🎉 Pengiriman Selesai!',  "Terima kasih! Berikan rating untuk {$deliveryCode}."],
        ];

        return $map[$status] ?? ["Update Pengiriman", "Status {$deliveryCode}: {$status}"];
    }
}
