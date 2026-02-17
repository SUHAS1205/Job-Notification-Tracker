
document.addEventListener('DOMContentLoaded', () => {
    const jobContainer = document.getElementById('job-container');
    const savedContainer = document.getElementById('saved-container');
    const savedJobsKey = 'jobTracker_saved';

    // State
    let savedJobs = JSON.parse(localStorage.getItem(savedJobsKey)) || [];

    // Helper: Time Ago
    function timeAgo(days) {
        if (days === 0) return "Today";
        if (days === 1) return "1 day ago";
        return `${days} days ago`;
    }

    // Helper: Check if saved
    const isSaved = (id) => savedJobs.includes(id);

    // Save Logic
    window.toggleSave = (id) => {
        if (savedJobs.includes(id)) {
            savedJobs = savedJobs.filter(jobId => jobId !== id);
        } else {
            savedJobs.push(id);
        }
        localStorage.setItem(savedJobsKey, JSON.stringify(savedJobs));
        renderApp(); // Re-render to update UI
    };

    // Modal Logic
    const modalOverlay = document.getElementById('job-modal');
    window.openModal = (id) => {
        const job = jobs.find(j => j.id === id);
        if (!job) return;

        document.getElementById('modal-title').innerText = job.title;
        document.getElementById('modal-company').innerText = job.company;
        document.getElementById('modal-desc').innerText = job.description;

        const skillsContainer = document.getElementById('modal-skills');
        skillsContainer.innerHTML = job.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');

        const link = document.getElementById('modal-apply');
        link.href = job.applyUrl;

        modalOverlay.classList.add('open');
    };

    window.closeModal = () => {
        modalOverlay.classList.remove('open');
    };

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Render Job Card
    function createJobCard(job) {
        const savedClass = isSaved(job.id) ? 'button--primary' : 'button--secondary';
        const savedText = isSaved(job.id) ? 'Saved' : 'Save';

        return `
        <div class="job-card">
            <div class="job-card__header">
                <div>
                    <div class="job-card__title">${job.title}</div>
                    <div class="job-card__company">${job.company}</div>
                </div>
                <div class="job-badge job-badge--accent">${job.source}</div>
            </div>
            
            <div class="job-card__meta">
                <span class="job-badge">📍 ${job.location} (${job.mode})</span>
                <span class="job-badge">💼 ${job.experience}</span>
            </div>

            <div class="job-card__details">
                <div class="job-salary">${job.salaryRange}</div>
                <div class="job-posted">🕒 ${timeAgo(job.postedDaysAgo)}</div>
            </div>

            <div class="job-card__actions">
                <button class="button button--secondary button--small" onclick="openModal(${job.id})">View</button>
                <button class="button ${savedClass} button--small" onclick="toggleSave(${job.id})">${savedText}</button>
                <a href="${job.applyUrl}" target="_blank" class="button button--secondary button--small">Apply ↗</a>
            </div>
        </div>
        `;
    }

    // Filter Logic
    function getFilteredJobs() {
        if (!typeof jobs === 'undefined') return [];

        const searchQuery = document.getElementById('search')?.value.toLowerCase() || '';
        const locFilter = document.getElementById('filter-location')?.value || '';
        const modeFilter = document.getElementById('filter-mode')?.value || '';
        const expFilter = document.getElementById('filter-exp')?.value || '';
        const sourceFilter = document.getElementById('filter-source')?.value || '';

        return jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchQuery) ||
                job.company.toLowerCase().includes(searchQuery) ||
                job.location.toLowerCase().includes(searchQuery) ||
                job.skills.some(skill => skill.toLowerCase().includes(searchQuery));
            const matchesLoc = locFilter ? job.location.includes(locFilter) : true;
            const matchesMode = modeFilter ? job.mode === modeFilter : true;
            const matchesExp = expFilter ? job.experience === expFilter : true;
            const matchesSource = sourceFilter ? job.source === sourceFilter : true;

            return matchesSearch && matchesLoc && matchesMode && matchesExp && matchesSource;
        });
    }

    window.applyFilters = () => {
        renderApp();
    };

    function renderApp() {
        // Render Dashboard
        if (jobContainer && typeof jobs !== 'undefined') {
            const filtered = getFilteredJobs();
            if (filtered.length === 0) {
                jobContainer.innerHTML = `<div class="empty-state" style="grid-column: 1/-1"><p>No jobs found matching filters.</p></div>`;
            } else {
                jobContainer.innerHTML = filtered.map(createJobCard).join('');
            }
        }

        // Render Saved
        if (savedContainer && typeof jobs !== 'undefined') {
            const mySavedJobs = jobs.filter(j => savedJobs.includes(j.id));
            if (mySavedJobs.length === 0) {
                savedContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1">
                    <span class="empty-state__icon">🔖</span>
                    <h2 class="empty-state__title">No saved jobs</h2>
                    <p class="empty-state__text">Jobs you bookmark will appear here.</p>
                </div>`;
            } else {
                savedContainer.innerHTML = mySavedJobs.map(createJobCard).join('');
            }
        }
    }

    // Initial Render
    renderApp();
});
