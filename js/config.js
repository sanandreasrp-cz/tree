window.CONFIG = {
    // Browser tab title.
    title: "San Andreas RP",

    // Name shown on the card.
    name: "San Andreas RP",

    // Short text under the name. Line breaks (\n) are allowed.
    bio: "Tvoř si vlastní příběh v Los Santos",

    // Location line. Set to "" to hide it.
    location: "",

    // Logo shown in the round frame. If it fails to load, the first letter of the name is shown.
    logo: "assets/images/logo.png",

    // Languages your team supports. Shown as small tags. Set to [] to hide.
    languages: [],

    // Background: .mp4 / .webm / .png / .jpg / .webp / .gif. Set src to "" for the built-in animated eclipse.
    background: {
        src: "assets/images/background.mp4",
        fit: "cover",
        // Darkness overlay on top of the background media (0 - 1).
        dim: 0.35,
        // true = draw the animated eclipse on top of your media too.
        canvasOverlay: false
    },

    // Turn any animation on or off.
    animations: {
        entrance: true,
        shimmerName: true,
        logoRing: false,
        floatingIcons: true,
        badgePop: true,
        tilt: true
    },

    // Links: icon = any Font Awesome 6 class. Replace the example URLs with your own.
    links: [
        { icon: "fa-brands fa-discord", title: "Discord", url: "https://discord.gg/Y3PRBNdpMM" },
        { icon: "fa-solid fa-book", title: "Pravidla", url: "https://sanandreasroleplay.gitbook.io/main" },
        { icon: "fa-brands fa-tiktok", title: "Tiktok", url: "https://youtube.com/@your-channel" },
        { icon: "fa-brands fa-instagram", title: "Instagram", url: "https://www.instagram.com/sanandreasrp.cz" },
        { icon: "fa-brands fa-youtube", title: "YouTube", url: "https://www.tiktok.com/@sanandreas.rp" },
    ],

    // Badges shown in the bottom right corner of the card.
    badges: [
        { icon: "fa-solid fa-cubes", title: "ESX", desc: "Stavěno na ESX" },
        { icon: "fa-solid fa-code", title: "Custom Scripty", desc: "Moderní a optimalizované scripty" },
    ],

    // Roleplay server panel below the card. Set name to "" to hide the whole panel.
    server: {
        name: "",
        description: "",

        // Opened by the Connect button. Use https://cfx.re/join/<code> or fivem://connect/<ip>:<port>.
        connectUrl: "https://cfx.re/join/",

        // Address shown with a copy button. Set to "" to hide it.
        address: "connect https://cfx.re/join/",

        // Base URL of the server that serves /players.json and /info.json (for example https://play.example.com:30120).
        // The page must be able to reach it over HTTPS with CORS allowed. Set to "" to hide the live status.
        statusUrl: "",

        // Fallback slot count when /info.json does not report one. Set to 0 to hide the slot count.
        maxPlayers: 0,

        // How often the player count is refreshed, in milliseconds. Set to 0 to refresh only once.
        refreshMs: 15000,

        // Maximum time to wait for the server, in milliseconds.
        timeoutMs: 5000,

        // How long the "Copied" text stays visible, in milliseconds.
        copyFeedbackMs: 1500
    },

    // All texts used by the page.
    texts: {
        online: "Online",
        offline: "Offline",
        checking: "Kontrola",
        players: "Hráči",
        connect: "Připojit se",
        copy: "Kopírovat",
        copied: "Zkopírováno",
        languages: "Jazyky"
    }
};
