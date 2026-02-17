
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('preferences-form');
    const scoreSlider = document.getElementById('minMatchScore');
    const scoreDisplay = document.getElementById('score-val');

    // Update slider value display
    if (scoreSlider && scoreDisplay) {
        scoreSlider.addEventListener('input', (e) => {
            scoreDisplay.innerText = e.target.value;
        });
    }

    // Load Preferences
    const savedPrefs = localStorage.getItem('jobTrackerPreferences');
    if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);

        document.getElementById('roleKeywords').value = prefs.roleKeywords || '';
        document.getElementById('preferredLocations').value = prefs.preferredLocations.join(', ') || '';
        document.getElementById('experienceLevel').value = prefs.experienceLevel || '';
        document.getElementById('skills').value = prefs.skills.join(', ') || '';

        if (prefs.minMatchScore) {
            scoreSlider.value = prefs.minMatchScore;
            scoreDisplay.innerText = prefs.minMatchScore;
        }

        // Checkboxes
        if (prefs.preferredMode) {
            const checkboxes = document.querySelectorAll('input[name="preferredMode"]');
            checkboxes.forEach(cb => {
                if (prefs.preferredMode.includes(cb.value)) cb.checked = true;
            });
        }
    }

    // Save Preferences
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get Checkbox values
        const modeCheckboxes = document.querySelectorAll('input[name="preferredMode"]:checked');
        const modes = Array.from(modeCheckboxes).map(cb => cb.value);

        const prefs = {
            roleKeywords: document.getElementById('roleKeywords').value,
            preferredLocations: document.getElementById('preferredLocations').value.split(',').map(s => s.trim()).filter(s => s),
            preferredMode: modes,
            experienceLevel: document.getElementById('experienceLevel').value,
            skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
            minMatchScore: parseInt(document.getElementById('minMatchScore').value)
        };

        localStorage.setItem('jobTrackerPreferences', JSON.stringify(prefs));

        // Feedback (simple alert as no toast system yet)
        const btn = form.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "Saved!";
        btn.classList.add('button--success');

        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove('button--success');
        }, 2000);
    });
});
