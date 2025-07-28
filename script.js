    // Tema escuro
    const toggleBtn = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-theme');
      toggleBtn.textContent = '☀️ Light Mode';
    }

    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      toggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Lógica de navegação
    const homeView = document.getElementById('home-view');
    const detailView = document.getElementById('detail-view');
    const countryDetail = document.getElementById('country-detail');
    const backButton = document.getElementById('back-button');
    const container = document.getElementById('countries-container');
    const searchInput = document.getElementById('search');
    const regionFilter = document.getElementById('region-filter');

    let allCountries = [];

    fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital,cca3,borders')
      .then(res => res.json())
      .then(data => {
        allCountries = data;
        renderCountries(allCountries);
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) showCountryDetail(code);
      });

    function renderCountries(countries) {
      container.innerHTML = '';
      countries.forEach(country => {
        const card = document.createElement('div');
        card.className = 'country-card';
        card.innerHTML = `
          <img src="${country.flags.svg}" alt="Flag of ${country.name.common}">
          <div class="info">
            <h2>${country.name.common}</h2>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <p><strong>Capital:</strong> ${country.capital?.[0] || 'N/A'}</p>
          </div>
        `;
        card.addEventListener('click', () => {
          history.pushState({}, '', '?code=' + country.cca3);
          showCountryDetail(country.cca3);
        });
        container.appendChild(card);
      });
    }

    function showCountryDetail(code) {
      const country = allCountries.find(c => c.cca3 === code);
      if (!country) return;

      homeView.style.display = 'none';
      detailView.style.display = 'block';

      let bordersHTML = 'None';
      if (country.borders?.length) {
        bordersHTML = '';
        country.borders.forEach(code => {
          const neighbor = allCountries.find(c => c.cca3 === code);
          if (neighbor) {
            bordersHTML += `<button onclick="goToCountry('${neighbor.cca3}')">${neighbor.name.common}</button> `;
          }
        });
      }

      countryDetail.innerHTML = `
        <div class="info">
          <h2>${country.name.common}</h2>
          <img src="${country.flags.svg}" alt="${country.name.common}" style="max-width:300px" />
          <p><strong>Capital:</strong> ${country.capital?.[0] || 'N/A'}</p>
          <p><strong>Region:</strong> ${country.region}</p>
          <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
          <div><strong>Border Countries:</strong> ${bordersHTML}</div>
        </div>
      `;
    }

    function goToCountry(code) {
      history.pushState({}, '', '?code=' + code);
      showCountryDetail(code);
    }

    backButton.addEventListener('click', () => {
      history.pushState({}, '', location.pathname);
      detailView.style.display = 'none';
      homeView.style.display = 'block';
    });

    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase();
      const filtered = allCountries.filter(c => c.name.common.toLowerCase().includes(term));
      renderCountries(filtered);
    });

    regionFilter.addEventListener('change', () => {
      const region = regionFilter.value;
      const filtered = region ? allCountries.filter(c => c.region === region) : allCountries;
      renderCountries(filtered);
    });

    window.addEventListener('popstate', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        showCountryDetail(code);
      } else {
        detailView.style.display = 'none';
        homeView.style.display = 'block';
      }
    });