document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('rsvpForm');
    const attendingSelect = document.getElementById('attending');
    const attendingDetails = document.getElementById('attendingDetails');
    const primaryEntree = document.getElementById('primaryEntree');
    const addGuestBtn = document.getElementById('addGuestBtn');
    const guestList = document.getElementById('guestList');
    const successMessage = document.getElementById('successMessage');

    let guestCount = 0;

    // 1. Logic to show/hide the details based on attendance
    attendingSelect.addEventListener('change', function () {
        if (this.value === 'Yes') {
            attendingDetails.classList.remove('hidden');
            primaryEntree.setAttribute('required', 'true');
            // Ensure guest fields are required if they are visible
            const guestInputs = guestList.querySelectorAll('input, select');
            guestInputs.forEach(input => input.setAttribute('required', 'true'));
        } else {
            // If they decline or select nothing, hide and bypass required fields
            attendingDetails.classList.add('hidden');
            primaryEntree.removeAttribute('required');
            const guestInputs = guestList.querySelectorAll('input, select');
            guestInputs.forEach(input => input.removeAttribute('required'));
        }
    });

    // 2. Logic to Add a Guest dynamically
    addGuestBtn.addEventListener('click', () => {
        guestCount++;

        const guestDiv = document.createElement('div');
        guestDiv.className = 'guest-card';
        guestDiv.id = `guest-${guestCount}`;

        guestDiv.innerHTML = `
            <button type="button" class="remove-guest" onclick="removeGuest('${guestDiv.id}')">Remove</button>
            <div class="form-group">
                <label>Guest Full Name *</label>
                <!-- Using arrays 'guestNames[]' helps group the data together on submission -->
                <input type="text" name="guestNames[]" placeholder="Guest name" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Guest Entree *</label>
                <select name="guestEntrees[]" required>
                    <option value="">Choose a meal...</option>
                    <option value="Chicken">Spiced Chicken Breast - Cumin & Coriander Dry Cure, Heirloom Carrots, Confit Fingerling Potatoes, Rich Chicken Jus</option>
                    <option value="Salmon">Atlantic Salmon - Crispy Skin Roasted, Yucca & Broccolini Summer Hash, Coconut Mustard Sauce</option>
                    <option value="Vegetarian">*Vegetarian Option* - Crispy Potato Rosti - Curried Potato Cream, Eggplant & Pepper Caponata, Balsamic & Grenadine Gastrique</option>
                    <option value="Kids">*For Kids* - Veggies & Dip, Chicken Tenders</option>
                </select>
            </div>
        `;

        guestList.appendChild(guestDiv);
    });

    // 3. Logic to remove a specific guest
    window.removeGuest = function (guestId) {
        const guestElement = document.getElementById(guestId);
        if (guestElement) {
            guestElement.remove();
        }
    };

    // 4. Handle Form Submission with Make.com Webhook
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        const formData = new FormData(form);

        // Build the payload
        const rsvpData = {
            timestamp: new Date().toLocaleString(),
            primaryName: formData.get('primaryName'),
            attending: formData.get('attending'),
            primaryEntree: formData.get('primaryEntree') || 'N/A',
            comments: formData.get('comments') || '',
            guests: []
        };

        const guestNames = formData.getAll('guestNames[]');
        const guestEntrees = formData.getAll('guestEntrees[]');

        for (let i = 0; i < guestNames.length; i++) {
            rsvpData.guests.push(`${guestNames[i]} (${guestEntrees[i]})`);
        }

        // Flatten the guests array into a single string for the Excel cell
        rsvpData.guestsString = rsvpData.guests.length > 0 ? rsvpData.guests.join(', ') : 'None';

        const webhookURL = 'https://hook.us2.make.com/7vpctcbnrcxwloabqjvrbqee1vq4brnk';

        fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rsvpData)
        })
            .then(response => {
                if (response.ok) {
                    form.style.display = 'none';
                    successMessage.classList.remove('hidden');
                    document.querySelector('.form-container').style.height = 'auto';
                } else {
                    throw new Error("Network response was not ok.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Something went wrong. Please check your connection and try again.");
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit RSVP";
            });
    });
});