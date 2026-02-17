
document.addEventListener('DOMContentLoaded', () => {
    const jobContainer = document.getElementById('job-container');
    const savedContainer = document.getElementById('saved-container');
    const savedJobsKey = 'jobTracker_saved';
    const prefsKey = 'jobTrackerPreferences';

    // State
    let savedJobs = JSON.parse(localStorage.getItem(savedJobsKey)) || [];
    let preferences = JSON.parse(localStorage.getItem(prefsKey)) || null;

    // Helper: Time Ago
    function timeAgo(days) {
        if (days === 0) return "Today";
        if (days === 1) return "1 day ago";
        return `${days} days ago`;
    }

    // Helper: Check if saved
    const isSaved = (id) => savedJobs.includes(id);

    // --- SCORING ENGINE ---
    function calculateMatchScore(job, prefs) {
        if (!prefs) return 0;
        let score = 0;

        // 1. Role Match (+25)
        const roleKeywords = prefs.roleKeywords ? prefs.roleKeywords.toLowerCase().split(',').map(s => s.trim()) : [];
        const jobTitle = job.title.toLowerCase();
        if (roleKeywords.some(k => k && jobTitle.includes(k))) {
            score += 25;
        }

        // 2. Description Match (+15)
        const jobDesc = job.description.toLowerCase();
        if (roleKeywords.some(k => k && jobDesc.includes(k))) {
            score += 15;
        }

        // 3. Location Match (+15)
        if (prefs.preferredLocations && prefs.preferredLocations.some(l => job.location.toLowerCase().includes(l.toLowerCase()))) {
            score += 15;
        }

        // 4. Mode Match (+10)
        if (prefs.preferredMode && prefs.preferredMode.includes(job.mode)) {
            score += 10;
        }

        // 5. Experience Match (+10)
        if (prefs.experienceLevel) {
            if (job.experience.toLowerCase() === prefs.experienceLevel.toLowerCase() ||
                job.experience.includes(prefs.experienceLevel)) {
                score += 10;
            }
        }

        // 6. Skills Match (+15 if overlap)
        if (prefs.skills && job.skills) {
            const userSkills = prefs.skills.map(s => s.toLowerCase());
            const jobSkills = job.skills.map(s => s.toLowerCase());
            const hasOverlap = jobSkills.some(s => userSkills.includes(s));
            if (hasOverlap) score += 15;
        }

        // 7. Freshness (+5 if <= 2 days)
        if (job.postedDaysAgo <= 2) {
            score += 5;
        }

        // 8. Source (+5 if LinkedIn)
        if (job.source === 'LinkedIn') {
            score += 5;
        }

        return Math.min(score, 100);
    }

    // Save Logic
    window.toggleSave = (id) => {
        if (savedJobs.includes(id)) {
            savedJobs = savedJobs.filter(jobId => jobId !== id);
        } else {
            savedJobs.push(id);
        }
        localStorage.setItem(savedJobsKey, JSON.stringify(savedJobs));
        renderApp();
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

    // Helper: Badge Color
    function getScoreBadge(score) {
        let colorClass = 'score-grey'; // < 40
        if (score >= 80) colorClass = 'score-green';
        else if (score >= 60) colorClass = 'score-amber';
        else if (score >= 40) colorClass = 'score-neutral';

        return `<div class="match-badge ${colorClass}" title="Match Score">${score}%</div>`;
    }

    // Render Job Card
    function createJobCard(job) {
        const savedClass = isSaved(job.id) ? 'button--primary' : 'button--secondary';
        const savedText = isSaved(job.id) ? 'Saved' : 'Save';

        let scoreBadge = '';
        if (preferences) {
            const score = calculateMatchScore(job, preferences);
            scoreBadge = getScoreBadge(score);
        }

        return `
        <div class="job-card" data-id="${job.id}">
            <div class="job-card__header">
                <div style="flex:1">
                    <div class="job-card__title">${job.title}</div>
                    <div class="job-card__company">${job.company}</div>
                </div>
                ${scoreBadge}
            </div>
            
             <div class="job-card__meta">
                <span class="job-badge">📍 ${job.location} (${job.mode})</span>
                <span class="job-badge">💼 ${job.experience}</span>
                 <span class="job-badge job-badge--accent">${job.source}</span>
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

    // Filter & Sort Logic
    function getFilteredAndSortedJobs() {
        if (typeof jobs === 'undefined') return [];

        const searchQuery = document.getElementById('search')?.value.toLowerCase() || '';
        const locFilter = document.getElementById('filter-location')?.value || '';
        const modeFilter = document.getElementById('filter-mode')?.value || '';
        const expFilter = document.getElementById('filter-exp')?.value || '';
        const sourceFilter = document.getElementById('filter-source')?.value || '';
        const showMatchesOnly = document.getElementById('toggle-matches')?.checked || false;

        let result = jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchQuery) ||
                job.company.toLowerCase().includes(searchQuery) ||
                job.location.toLowerCase().includes(searchQuery) ||
                job.skills.some(skill => skill.toLowerCase().includes(searchQuery));

            const matchesLoc = locFilter ? job.location.includes(locFilter) : true;
            const matchesMode = modeFilter ? job.mode === modeFilter : true;
            const matchesExp = expFilter ? job.experience === expFilter : true;
            const matchesSource = sourceFilter ? job.source === sourceFilter : true;

            let matchesScore = true;
            if (showMatchesOnly && preferences) {
                const score = calculateMatchScore(job, preferences);
                const threshold = preferences.minMatchScore || 40;
                matchesScore = score >= threshold;
            }

            return matchesSearch && matchesLoc && matchesMode && matchesExp && matchesSource && matchesScore;
        });

        // Sort
        const sortValue = document.getElementById('sort-by')?.value || 'latest';

        result.sort((a, b) => {
            if (sortValue === 'latest') {
                return a.postedDaysAgo - b.postedDaysAgo;
            } else if (sortValue === 'score') {
                const scoreA = calculateMatchScore(a, preferences);
                const scoreB = calculateMatchScore(b, preferences);
                return scoreB - scoreA;
            } else if (sortValue === 'salary') {
                const getSalary = (s) => parseInt(s.replace(/[^0-9]/g, '')) || 0;
                return getSalary(b.salaryRange) - getSalary(a.salaryRange);
            }
            return 0;
        });

        return result;
    }

    window.applyFilters = () => {
        renderApp();
    };

    function renderApp() {
        // Refresh prefs
        preferences = JSON.parse(localStorage.getItem(prefsKey)) || null;

        // Render Dashboard
        if (jobContainer && typeof jobs !== 'undefined') {

            const bannerContainer = document.getElementById('pref-banner-container');
            if (bannerContainer) {
                if (!preferences) {
                    bannerContainer.innerHTML = `
                    <div class="preference-banner">
                        <div>
                            <strong>Activate Intelligent Matching</strong><br>
                            <span class="muted" style="font-size:14px">Set your preferences to see match scores and custom filtering.</span>
                        </div>
                        <a href="settings.html" class="button button--primary button--small">Set Preferences</a>
                    </div>`;
                    bannerContainer.style.display = 'block';
                } else {
                    bannerContainer.style.display = 'none';
                }
            }

            const filtered = getFilteredAndSortedJobs();

            if (filtered.length === 0) {
                jobContainer.innerHTML = `
                 <div class="empty-state" style="grid-column: 1/-1">
                    <span class="empty-state__icon">🔍</span>
                    <h2 class="empty-state__title">No roles match your criteria</h2>
                    <p class="empty-state__text">Adjust filters or lower your match threshold.</p>
                 </div>`;
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
