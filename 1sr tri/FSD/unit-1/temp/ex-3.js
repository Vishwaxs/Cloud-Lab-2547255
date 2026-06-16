// Responsive Navbar
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  });
}

// Geolocation
const getLocationBtn = document.getElementById('get-location');
const locationDataDiv = document.getElementById('location-data');

if (getLocationBtn && locationDataDiv) {
  getLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      locationDataDiv.textContent = "Geolocation is not supported by your browser.";
      locationDataDiv.classList.remove('hidden');
      return;
    }
    
    locationDataDiv.textContent = "Locating...";
    locationDataDiv.classList.remove('hidden');
    
    navigator.geolocation.getCurrentPosition(
      pos => {
        locationDataDiv.innerHTML = `<span class="font-semibold">Latitude:</span> ${pos.coords.latitude.toFixed(6)}<br>
                            <span class="font-semibold">Longitude:</span> ${pos.coords.longitude.toFixed(6)}<br>
                            <a href="https://www.openstreetmap.org/#map=18/${pos.coords.latitude}/${pos.coords.longitude}" target="_blank" class="text-teal-600 underline mt-2 inline-block">View on Map</a>`;
      },
      err => {
        locationDataDiv.textContent = "Unable to retrieve your location.";
      }
    );
  });
}

// Feedback Form with proper form handling
const feedbackForm = document.querySelector('#feedback-form');

if (feedbackForm) {
  feedbackForm.addEventListener('submit', function(e) {
    // ✅ 1. Prevent the default behavior
    e.preventDefault();
    
    // ✅ 2. Retrieve all values using querySelector and querySelectorAll
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const goal = document.querySelector("#goal").value;
    const plan = document.querySelector("#plan").value;
    const date = document.querySelector("#date").value;
    const sessionTime = document.querySelector("input[name='session-time']:checked")?.value || "Not selected";

    // ✅ 3. Display the captured information below the form in a styled box
    document.querySelector("#output-name").textContent = `Full Name: ${name}`;
    document.querySelector("#output-email").textContent = `Email: ${email}`;
    document.querySelector("#output-goal").textContent = `Primary Goal: ${goal}`;
    document.querySelector("#output-plan").textContent = `Plan Package: ${plan}`;
    document.querySelector("#output-date").textContent = `Preferred Date: ${date}`;
    document.querySelector("#output-time").textContent = `Preferred Session Time: ${sessionTime}`;

    // Show the output box (styled with Tailwind CSS in HTML)
    document.querySelector("#feedback-output").classList.remove("hidden");
    
    // Scroll to the output section
    document.querySelector("#feedback-output").scrollIntoView({ behavior: 'smooth' });
  });
}

// ✅ 4. Custom CSS class to highlight selected radio labels when clicked
document.querySelectorAll('input[name="session-time"]').forEach(radio => {
  radio.addEventListener('change', function() {
    // Remove highlight from all radio labels
    document.querySelectorAll('.custom-radio-label').forEach(label => {
      label.classList.remove('bg-teal-100', 'border-teal-500', 'text-teal-700');
      label.classList.add('border-gray-300');
    });
    
    // Add highlight to selected radio label
    if (this.checked) {
      const parentLabel = this.closest('.custom-radio-label');
      if (parentLabel) {
        parentLabel.classList.add('bg-teal-100', 'border-teal-500', 'text-teal-700');
        parentLabel.classList.remove('border-gray-300');
      }
    }
  });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});