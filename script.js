// --- FINAL, STABLE CODE WITH WORKING ADS ---

document.addEventListener("DOMContentLoaded", () => {
    // --- BASIC HANDLERS (Preloader, Scroll, etc.) ---
    const preloader = document.getElementById("preloader");
    if (preloader) {
        window.addEventListener("load", () => preloader.classList.add("hidden"));
    }
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

    // --- FUNCTION TO READ JSON DATA ---
    async function fetchJson(url) {
        try {
            // Appending a timestamp to prevent caching issues
            const response = await fetch(`${url}?t=${new Date().getTime()}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
            return null;
        }
    }

    // --- LAZY LOADING FUNCTION FOR IMAGES ---
    function activateLazyLoading() {
        const lazyImages = document.querySelectorAll("img.lazy:not(.loaded)");
        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add("loaded");
                        img.classList.remove("lazy");
                        observer.unobserve(img);
                    }
                });
            });
            lazyImages.forEach(img => observer.observe(img));
        } else {
            // Fallback for older browsers
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove("lazy");
                img.classList.add("loaded");
            });
        }
    }
    
    // --- IMPROVED FUNCTION TO CREATE ADVERTISEMENT CARDS ---
    function renderCard(item, category) {
        const defaultImagePlaceholder = '<div class="image-placeholder"></div>';
        // Unified image source logic
        let imageUrl = item.image || item.company_logo || (item.images && item.images.length > 0 ? item.images[0].image_url : null);
        
        const imageHtml = imageUrl 
            ? `<img src="${imageUrl}" class="card-img-top lazy" data-src="${imageUrl}" alt="${item.title}">`
            : defaultImagePlaceholder;

        return `
        <div class="col-lg-4 col-md-6 mb-4 announcement-card" data-title="${item.title}" data-location="${item.location}">
            <div class="card h-100">
                <div class="card-number">${item.id || ''}</div>
                ${imageHtml}
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${item.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted"><i class="fas fa-map-marker-alt mr-2"></i> ${item.location}</h6>
                    <p class="card-text flex-grow-1">${item.description}</p>
                    <div class="card-contact-icons mt-auto">
                        ${item.contact ? `<a href="tel:${item.contact}" class="contact-icon" title="Contact by Phone"><i class="fas fa-phone"></i> <span>${item.contact}</span></a>` : ''}
                        ${item.contact_link ? `<a href="${item.contact_link}" class="contact-icon" title="Contact by Email"><i class="fas fa-envelope"></i> <span>Email</span></a>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    }

    // --- GLOBAL FUNCTION TO LOAD ALL CONTENT ---
    async function loadContent(jsonPath, containerId, dataKey) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = await fetchJson(jsonPath);
        const items = data ? data[dataKey] : [];

        if (!items || items.length === 0) {
            container.innerHTML = '<p class="col-12 text-center lead text-muted mt-5">Currently, there are no posts in this section.</p>';
            return;
        }

        // Sort by publication date, newest first
        items.sort((a, b) => new Date(b.publication_date || 0) - new Date(a.publication_date || 0));
        container.innerHTML = items.map(item => renderCard(item, dataKey)).join('');
        activateLazyLoading();
    }
    
    // --- INITIALIZE CONTENT LOADING ---
    if (document.getElementById('announcements-grid')) {
        loadContent('/_data/donations.json', 'announcements-grid', 'requests');
    }
    if (document.getElementById('jobs-grid')) {
        loadContent('/_data/jobs.json', 'jobs-grid', 'vacancies');
    }
    if (document.getElementById('services-grid')) {
        loadContent('/_data/services.json', 'services-grid', 'services');
    }
    if (document.getElementById('housing-grid')) {
        loadContent('/_data/housing.json', 'housing-grid', 'listings');
    }
    
    // Initial call for any images that might already be in view
    activateLazyLoading();
});

/**
 * Generates and inserts the JSON-LD script for a job posting into the page's <head>.
 * This is great for SEO, helping Google understand the job details.
 * @param {object} job - The job posting object with all the data.
 */
function injectJobPostingSchema(job) {
    // Remove any old job schema to avoid duplicates
    const oldSchema = document.getElementById('job-posting-schema');
    if (oldSchema) {
        oldSchema.remove();
    }

    const schema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description, // Ideally, this description should contain HTML for rich formatting
        "datePosted": new Date(job.date).toISOString().split('T')[0], // YYYY-MM-DD format
        "hiringOrganization": {
            "@type": "Organization",
            "name": job.company_name || "Confidential Company",
            "sameAs": window.location.origin // A link to the company's website if available
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "PT", // Assuming all jobs are in Portugal
                "addressLocality": job.location
            }
        }
    };

    // Add optional fields only if they exist to keep the schema clean
    if (job.validThrough) {
        schema.validThrough = new Date(job.validThrough).toISOString().split('T')[0];
    }
    if (job.employmentType) {
        schema.employmentType = job.employmentType; // e.g., "FULL_TIME", "PART_TIME"
    }
    if (job.salary_min && job.salary_max) {
        schema.baseSalary = {
            "@type": "MonetaryAmount",
            "currency": "EUR",
            "value": {
                "@type": "QuantitativeValue",
                "minValue": job.salary_min,
                "maxValue": job.salary_max,
                "unitText": "YEAR" // Or "MONTH", "HOUR"
            }
        };
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'job-posting-schema'; // ID to easily find and remove it later
    script.text = JSON.stringify(schema, null, 2); // Use indentation for readability in dev tools

    document.head.appendChild(script);
}