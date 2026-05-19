import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

/**
 * Inisialisasi Laravel Echo
 * Digunakan untuk mendengarkan event real-time (WebSockets)
 */
export const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY || 'fds_key',
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
    forceTLS: true,
    // Jika menggunakan self-hosted WebSocket (Soketi/Laravel WebSocket), sesuaikan URL di bawah
    // wsHost: window.location.hostname,
    // wsPort: 6001,
    // disableStats: true,
});

export default echo;
