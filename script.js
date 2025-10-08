// ECO METRIC - GLOBAL SCRIPT V2.0
// Optimized by Gemini

document.addEventListener("DOMContentLoaded", () => {
    
    /**
     * Preloader Handler
     * Fades out the preloader once the window is fully loaded.
     */
    const preloader = document.getElementById("preloader");
    if (preloader) {
        window.addEventListener("load", () => preloader.classList.add("hidden"));
    }

    /**
     * Scroll-to-Top Button Handler
     * Shows the button when the user scrolls down and scrolls to top on click.
     */
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    if (scrollTopBtn) {
        window.onscroll = () => {
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                scrollTopBtn.classList.add("visible");
            } else {
                scrollTopBtn.classList.remove("visible");
            }
        };
        scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

});