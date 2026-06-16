 let products = [];
    const container = document.getElementById('productContainer');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const sortSelect = document.getElementById('sortSelect');
    
    async function fetchProducts() {
      try {
        const res = await fetch('https://fakestoreapi.com/products');
        const data = await res.json();
        products = data.slice(0,8);
        localStorage.setItem('allProducts',JSON.stringify(products));
        showProducts(products);
      } catch (error) {
        container.innerHTML = '<p class="text-red-600">Failed to load products.</p>';
      }
    }
    
    function showProducts(list) {
      container.innerHTML = '';
      list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'flex flex-col items-center bg-white dark:bg-gray-700 rounded';
        div.innerHTML = `
          <img src="${item.image}" alt="${item.title}" class="h-32 w-32 mx-auto mb-2 object-contain rounded">
          <span class="font-semibold text-gray-800 dark:text-gray-200 text-center">${item.title}</span>
          <span class="text-sm text-gray-600 dark:text-gray-300">₹${item.price}</span>
        `;
        container.appendChild(div);
      }); 
    }


    function filterProducts() {
      let filtered = [...products];
      const term = searchInput.value.toLowerCase().trim();
      if (term) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(term));
      }
      showProducts(filtered);
    }

    function sortProducts() {
      let sorted = [...products];
      if (sortSelect.value === 'low') sorted.sort((a,b)=>a.price-b.price);
      else if (sortSelect.value === 'high') sorted.sort((a,b)=>b.price-a.price);
      showProducts(sorted);
    }

    searchBtn.addEventListener('click', filterProducts);
    sortSelect.addEventListener('change', sortProducts);

    const form = document.getElementById('interestForm');
    const formMsg = document.getElementById('formMsg');
   

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const product = document.getElementById('userProduct').value.trim();
      if (!name || !email || !product) {
        formMsg.textContent = 'Please fill all fields.';
        return;
      }
      localStorage.setItem('eshopUser', JSON.stringify({ name, product }));
      formMsg.textContent = 'Thank you! We have saved your interest.';
    });

    
    window.addEventListener('DOMContentLoaded', () => {
      fetchProducts();
      const user = localStorage.getItem('eshopUser');
      if (user) {
        const{ name, product }=JSON.parse(user);
      }
    
      const locDisplay = document.getElementById('locationDisplay');
      const getLocationBtn = document.getElementById('getLocationBtn');
      getLocationBtn.addEventListener('click',()=>{
        locDisplay.textContent = 'Locating you...';
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            pos => {
              const { latitude, longitude } = pos.coords;
              locDisplay.textContent = `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`;
            },
        
        
          );
        }
      });
    });
   
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('hidden');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) navMenu.classList.add('hidden');
      });
    });
    