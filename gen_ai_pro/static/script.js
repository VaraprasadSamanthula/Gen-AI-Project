/**
 * Spam Detector - Frontend JavaScript
 * Handles spam detection API calls and UI updates
 */

// Session statistics
let stats = {
    totalScans: 0,
    spamCount: 0,
    hamCount: 0
};

// DOM Elements - with null checks
const messageInput = document.getElementById('messageInput');
const scanBtn = document.getElementById('scanBtn');
const resultsSection = document.getElementById('resultsSection');
const classicalResult = document.getElementById('classicalResult');
const agreementMessage = document.getElementById('agreementMessage');
const totalScansEl = document.getElementById('totalScans');
const spamCountEl = document.getElementById('spamCount');
const hamCountEl = document.getElementById('hamCount');

// Safe element access with null checks
const btnText = scanBtn ? scanBtn.querySelector('.btn-text') : null;
const btnLoader = scanBtn ? scanBtn.querySelector('.btn-loader') : null;

// Event Listeners - only if elements exist
if (scanBtn) {
    scanBtn.addEventListener('click', handleScan);
}
if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleScan();
        }
    });
}

/**
 * Handle scan button click
 */
async function handleScan() {
    const text = messageInput.value.trim();
    
    if (!text) {
        alert('Please enter a message to scan');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    hideResults();
    
    try {
        console.log('Sending prediction request...', { text: text.substring(0, 50) + '...' });
        
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });
        
        console.log('Response status:', response.status, response.statusText);
        
        let data;
        try {
            data = await response.json();
            console.log('Response data:', data);
        } catch (jsonError) {
            console.error('Failed to parse JSON response:', jsonError);
            alert('Server returned invalid response. Please check server logs.');
            return;
        }
        
        if (!response.ok) {
            // Server returned an error
            const errorMsg = data.error || `Server error (${response.status})`;
            console.error('Server error:', errorMsg, data);
            alert(`Error: ${errorMsg}`);
            return;
        }
        
        // Success - display results
        console.log('Prediction successful:', data);
        displayResults(data);
        updateStats(data);
        
    } catch (error) {
        console.error('Network/Request error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        alert(`Failed to scan message: ${error.message}\n\nPlease check:\n1. Server is running\n2. Browser console (F12) for details`);
    } finally {
        setLoadingState(false);
    }
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
    if (!scanBtn) return;
    
    if (loading) {
        scanBtn.disabled = true;
        if (btnText) btnText.textContent = 'Scanning...';
        if (btnLoader) btnLoader.classList.remove('hidden');
    } else {
        scanBtn.disabled = false;
        if (btnText) btnText.textContent = 'Scan for Spam';
        if (btnLoader) btnLoader.classList.add('hidden');
    }
}

/**
 * Display prediction results
 */
function displayResults(data) {
    if (!resultsSection) return;
    
    resultsSection.classList.remove('hidden');
    
    // TF-IDF + SVM Model Result (primary model)
    if (data.classical_prediction && classicalResult) {
        const classicalText = classicalResult.querySelector('.result-text');
        
        if (classicalText) {
            // Convert HAM to NOT SPAM for better clarity
            const displayText = data.classical_prediction === 'HAM' ? 'NOT SPAM' : data.classical_prediction;
            classicalText.textContent = displayText;
            classicalText.className = `result-text ${data.classical_prediction.toLowerCase()}`;
        }
    }
    
    // Hide agreement message (only one model now)
    if (agreementMessage) {
        agreementMessage.textContent = '';
        agreementMessage.className = '';
    }
}

/**
 * Check if models agree (not used in single model version)
 */
function checkAgreement(data) {
    // Single model version - no agreement check needed
    if (agreementMessage) {
        agreementMessage.textContent = '';
        agreementMessage.className = '';
    }
}

/**
 * Update session statistics
 */
function updateStats(data) {
    stats.totalScans++;
    
    // Count spam/ham based on TF-IDF + SVM prediction
    const prediction = data.classical_prediction;
    
    if (prediction === 'SPAM') {
        stats.spamCount++;
    } else if (prediction === 'HAM' || prediction === 'NOT SPAM') {
        stats.hamCount++;
    }
    
    // Update UI - with null checks
    if (totalScansEl) totalScansEl.textContent = stats.totalScans;
    if (spamCountEl) spamCountEl.textContent = stats.spamCount;
    if (hamCountEl) hamCountEl.textContent = stats.hamCount;
    
    // Animate stat updates
    [totalScansEl, spamCountEl, hamCountEl].filter(el => el !== null).forEach(el => {
        el.style.transform = 'scale(1.2)';
        setTimeout(() => {
            el.style.transform = 'scale(1)';
        }, 200);
    });
}

/**
 * Hide results section
 */
function hideResults() {
    if (resultsSection) resultsSection.classList.add('hidden');
    if (agreementMessage) {
        agreementMessage.textContent = '';
        agreementMessage.className = '';
    }
}

// Initialize
console.log('Spam Detector - AI-Powered Spam Detection System loaded');

