/**
 * Trip Planning Features
 */

const TripPlanner = {
    // Initialize date pickers
    initDatePickers: function() {
        const today = new Date().toISOString().split('T')[0];
        
        document.querySelectorAll('input[type="date"]').forEach(input => {
            input.min = today;
        });
        
        // End date should be after start date
        const startDate = document.getElementById('start_date');
        const endDate = document.getElementById('end_date');
        
        if (startDate && endDate) {
            startDate.addEventListener('change', function() {
                endDate.min = this.value;
            });
        }
    },
    
    // Calculate trip duration
    calculateDuration: function(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    },
    
    // Estimate premium price
    estimatePremiumPrice: function(duration) {
        if (duration <= 3) return 149;
        if (duration <= 7) return 99;
        if (duration <= 15) return 299;
        return 499;
    },
    
    // Join trip with code
    joinTrip: async function(joinCode) {
        try {
            const response = await fetch('/trip/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `join_code=${joinCode}`
            });
            
            if (response.ok) {
                YatraSecure.showNotification('Successfully joined trip!', 'success');
                setTimeout(() => location.reload(), 1000);
            } else {
                throw new Error('Invalid join code');
            }
        } catch (error) {
            YatraSecure.showNotification(error.message, 'danger');
        }
    },
    
    // Share join code
    shareJoinCode: function(code, tripName) {
        const text = `Join my trip "${tripName}" on YatraSecure! Use code: ${code}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Join My Trip',
                text: text
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                YatraSecure.showNotification('Join code copied to clipboard!', 'success');
            });
        }
    },
    
    // Generate AI itinerary
    generateItinerary: async function(tripId, interests = []) {
        try {
            YatraSecure.showLoading();
            
            const formData = new FormData();
            interests.forEach(interest => formData.append('interests', interest));
            
            const response = await fetch(`/trip/${tripId}/generate-itinerary`, {
                method: 'POST',
                body: formData
            });
            
            YatraSecure.hideLoading();
            
            if (response.ok) {
                const html = await response.text();
                // Display itinerary in modal or new page
                document.getElementById('itinerary-result').innerHTML = html;
            }
        } catch (error) {
            YatraSecure.hideLoading();
            YatraSecure.showNotification('Error generating itinerary', 'danger');
        }
    },
    
    // Add itinerary item
    addItineraryItem: function(containerId) {
        const container = document.getElementById(containerId);
        const dayNumber = container.children.length + 1;
        
        const itemHtml = `
            <div class="itinerary-item card mb-3">
                <div class="card-body">
                    <h5>Day ${dayNumber}</h5>
                    <div class="row">
                        <div class="col-md-4">
                            <input type="date" class="form-control" name="day_${dayNumber}_date" required />
                        </div>
                        <div class="col-md-8">
                            <input type="text" class="form-control" name="day_${dayNumber}_location" placeholder="Location" required />
                        </div>
                    </div>
                    <div class="mt-2">
                        <textarea class="form-control" name="day_${dayNumber}_activity" placeholder="Activities" rows="3"></textarea>
                    </div>
                    <div class="row mt-2">
                        <div class="col-md-6">
                            <input type="time" class="form-control" name="day_${dayNumber}_start_time" />
                        </div>
                        <div class="col-md-6">
                            <input type="number" class="form-control" name="day_${dayNumber}_cost" placeholder="Estimated Cost (₹)" />
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', itemHtml);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    TripPlanner.initDatePickers();
});

// Export
window.TripPlanner = TripPlanner;
