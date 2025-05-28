document.addEventListener('DOMContentLoaded', () => {
    const usersContainer = document.getElementById('users-container');
    const ageSelect = document.getElementById('age');
    const regionSelect = document.getElementById('region');
    const sexSelect = document.getElementById('sex');
    const onlyWithPhotoCheckbox = document.getElementById('only-with-photo');
    const onlyFavoritesCheckbox = document.getElementById('only-favorites');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    const statisticsTableBody = document.querySelector('#statistics-table tbody');
    const searchInput = document.getElementById('search');
    const searchBtn = document.querySelector('.button1');
    const userListDiv = document.getElementById('user-list');
    const statsCategorySelect = document.getElementById('stats-category');
    const PAGE_SIZE = 10;
    const MAX_LOADED_USERS = 50;
    let allUsers = [];
    let filteredUsers = [];
    let currentPage = 1;
    let statisticsChart = null;
    let leafletMapInstance = null;

    document.addEventListener('click', (event) => {
        const isClickInside = userListDiv.contains(event.target);
        const isSearchBtn = searchBtn.contains(event.target);
        if (!isClickInside && !isSearchBtn) {
            userListDiv.innerHTML = '';
        }
    });

    function isFavorite(user) {
        return localStorage.getItem(`favorite_${user.email}`) === 'true';
    }

    function daysUntilNextBirthday(dob) {
        console.log('dob:', dob);
        const today = dayjs();
        const birthDate = dayjs(dob);
        if (!birthDate.isValid()) {
            console.warn('Invalid birthDate:', dob);
            return 'N/A';
        }
        let nextBirthday = birthDate.year(today.year());
        if (nextBirthday.isBefore(today, 'day')) {
            nextBirthday = nextBirthday.add(1, 'year');
        }
        return nextBirthday.diff(today, 'day');
    }

    function renderUsers(usersToShow) {
        usersContainer.innerHTML = '';
        _.forEach(usersToShow, user => {
            const daysToBirthday = daysUntilNextBirthday(user.dob.date);
            const card = document.createElement('div');
            card.classList.add('people');
            card.setAttribute('onclick', 'openPopup(this)');
            card.innerHTML = `
        <figure>
            <img src="${user.picture.large}" alt="фото користувача"
                data-name="${user.name.first} ${user.name.last}"
                data-position="Unknown"
                data-country="${user.location.country}"
                data-photo="${user.picture.large}"
                data-phone="${user.phone}"
                data-email="${user.email}"
                data-gender="${user.gender}"
                data-age="${user.dob.age}"
                data-comment="No comment"
                data-dob="${user.dob.date}"
                data-map="https://www.google.com/maps/search/?api=1&query=${user.location.coordinates.latitude},${user.location.coordinates.longitude}"
            >
        </figure>
        <div class="name"><span>${user.name.first} ${user.name.last}</span></div>
        <div class="position"><span>Unknown</span></div>
        <div class="country"><span>${user.location.country}</span></div>
        `;
            usersContainer.appendChild(card);
        });
    }

    window.openPopup = function(card) {
        const img = card.querySelector('img');

        const name = img.dataset.name;
        const position = img.dataset.position;
        const country = img.dataset.country;
        const photo = img.dataset.photo;
        const phone = img.dataset.phone;
        const email = img.dataset.email;
        const gender = img.dataset.gender;
        const age = img.dataset.age;
        const comment = img.dataset.comment;
        const mapLink = img.dataset.map;
        const dob = img.dataset.dob;

        if (!dob) {
            console.warn('DOB is missing on this user!');
        }

        const daysToBirthday = daysUntilNextBirthday(dob);

        const lat = parseFloat(mapLink.split('query=')[1].split(',')[0]);
        const lng = parseFloat(mapLink.split('query=')[1].split(',')[1]);

        document.getElementById('popup-name').textContent = name;
        document.getElementById('popup-position').textContent = position;
        document.getElementById('popup-country').textContent = country;
        document.getElementById('popup-photo').src = photo;
        document.getElementById('popup-phone').textContent = phone;
        document.getElementById('popup-email').textContent = email;
        document.getElementById('popup-gender').textContent = gender;
        document.getElementById('popup-age').textContent = age;
        document.getElementById('popup-comment').textContent = comment;
        document.getElementById('popup-map').href = mapLink;
        const rawDob = img.dataset.dob;
        const dateOnly = rawDob ? rawDob.split('T')[0] : 'Unknown';

        document.getElementById('popup-dob').textContent = `Date of Birth: ${dateOnly}`;

        document.getElementById('popup-days-to-birthday').textContent = `Days to birthday: ${daysToBirthday}`;

        document.getElementById('popup').style.display = 'block';

        const mapContainer = document.getElementById('leaflet-map');
        mapContainer.style.display = 'block';

        if (leafletMapInstance) {
            leafletMapInstance.remove();
        }
        leafletMapInstance = L.map('leaflet-map').setView([lat, lng], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(leafletMapInstance);

        L.marker([lat, lng]).addTo(leafletMapInstance);
    };

    window.closePopup = function () {
        document.getElementById('popup').style.display = 'none';
        document.getElementById('leaflet-map').style.display = 'none';
        if (leafletMapInstance) {
            leafletMapInstance.remove();
            leafletMapInstance = null;
        }
    };

    function updateStatisticsTable(users) {
        statisticsTableBody.innerHTML = '';
        _.forEach(users, user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name.first} ${user.name.last}</td>
                <td>Unknown</td>
                <td>${user.dob.age}</td>
                <td>${_.capitalize(user.gender)}</td>
                <td>${user.location.country}</td>
            `;
            statisticsTableBody.appendChild(row);
        });
    }

    function isAnyFilterActive() {
        return (
            ageSelect.value !== 'select all' ||
            regionSelect.value !== 'select all' ||
            sexSelect.value !== 'select all' ||
            onlyWithPhotoCheckbox.checked ||
            onlyFavoritesCheckbox.checked
        );
    }

    function applyFilters() {
        let filtered = _.clone(allUsers);
        if (ageSelect.value !== 'select all') {
            const ageRanges = {
                '18-31': [18, 31],
                '32-49': [32, 49],
                '50-69': [50, 69]
            };
            const range = ageRanges[ageSelect.value];
            if (range) {
                filtered = _.filter(filtered, user => _.inRange(user.dob.age, range[0], range[1] + 1));
            }
        }
        if (regionSelect.value !== 'select all') {
            const regionsMap = {
                'us': ['united states', 'usa', 'america'],
                'europe': ['england', 'france', 'germany', 'netherlands', 'ireland', 'denmark', 'spain', 'switzerland', 'norway', 'sweden', 'finland', 'austria', 'italy', 'scotland', 'poland', 'russia', 'belgium', 'croatia'],
                'canada': ['canada'],
                'australia': ['australia'],
                'china': ['china']
            };
            const regionCountries = regionsMap[regionSelect.value] || [];
            filtered = _.filter(filtered, user =>
                _.some(regionCountries, rc => _.includes(user.location.country.toLowerCase(), rc))
            );
        }
        if (sexSelect.value !== 'select all') {
            filtered = _.filter(filtered, ['gender', sexSelect.value]);
        }
        if (onlyWithPhotoCheckbox.checked) {
            filtered = _.filter(filtered, user => _.get(user, 'picture.large'));
        }
        if (onlyFavoritesCheckbox.checked) {
            filtered = _.filter(filtered, user => isFavorite(user));
        }
        return filtered;
    }

    function updatePaginationControls() {
        const maxPage = Math.ceil(filteredUsers.length / PAGE_SIZE);
        pageInfo.textContent = `Page ${currentPage} of ${maxPage || 1}`;
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= maxPage;
    }

    function updateVisibleUsers() {
        filteredUsers = isAnyFilterActive() ? applyFilters() : allUsers;
        const maxPage = Math.ceil(filteredUsers.length / PAGE_SIZE);
        if (currentPage > maxPage) currentPage = maxPage || 1;
        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const endIdx = startIdx + PAGE_SIZE;
        const usersToShow = _.slice(filteredUsers, startIdx, endIdx);
        renderUsers(usersToShow);
        updateStatisticsTable(filteredUsers);
        updatePaginationControls();
        const selectedCategory = statsCategorySelect.value || 'gender';
        updateStatisticsChart(filteredUsers, selectedCategory);
    }

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateVisibleUsers();
        }
    });

    nextBtn.addEventListener('click', () => {
        const maxPage = Math.ceil(filteredUsers.length / PAGE_SIZE);
        if (currentPage < maxPage) {
            currentPage++;
            updateVisibleUsers();
        }
    });

    [ageSelect, regionSelect, sexSelect, onlyWithPhotoCheckbox, onlyFavoritesCheckbox].forEach(el => {
        el.addEventListener('change', () => {
            currentPage = 1;
            updateVisibleUsers();
        });
    });

    async function loadInitialUsers() {
        try {
            const response = await fetch(`https://randomuser.me/api/?results=${MAX_LOADED_USERS}`);
            const data = await response.json();
            allUsers = data.results;
            currentPage = 1;
            updateVisibleUsers();
        } catch (err) {
            console.error('Помилка при завантаженні користувачів:', err);
        }
    }

    const table = document.getElementById('statistics-table');
    const headers = table.querySelectorAll('th');
    let sortDirections = Array(headers.length).fill(true);
    headers.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            const type = header.dataset.type || 'string';
            sortTable(index, type, sortDirections[index]);
            sortDirections[index] = !sortDirections[index];
        });
    });

    function sortTable(colIndex, type, ascending) {
        const tbody = table.tBodies[0];
        const rows = Array.from(tbody.rows);
        const sorted = _.orderBy(rows, row => {
            const text = row.cells[colIndex].textContent.trim();
            return type === 'number' ? Number(text) : text.toLowerCase();
        }, [ascending ? 'asc' : 'desc']);
        tbody.innerHTML = '';
        _.forEach(sorted, row => tbody.appendChild(row));
    }

    searchBtn.addEventListener('click', () => {
        const query = _.toLower(_.trim(searchInput.value));
        if (!query) {
            userListDiv.innerHTML = '<p>Enter something to search.</p>';
            return;
        }
        const searchResults = _.filter(allUsers, user => {
            const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
            const age = String(user.dob.age);
            const comment = 'no comment';
            return _.includes(fullName, query) || _.includes(age, query) || _.includes(comment, query);
        });
        userListDiv.innerHTML = searchResults.length === 0 ? '<p>No users found.</p>' : '';
        _.forEach(searchResults, user => {
            const userCard = document.createElement('div');
            userCard.classList.add('search-user');
            userCard.innerHTML = `
                <div><strong>${user.name.first} ${user.name.last}</strong></div>
                <div>Age: ${user.dob.age}</div>
                <div>Email: ${user.email}</div>
                <div>Comment: No comment</div>
                <img src="${user.picture.thumbnail}" alt="User" style="border-radius:50%; margin-top:5px;">
            `;
            userListDiv.appendChild(userCard);
        });
    });

    function updateStatisticsChart(users, category) {
        let counts = {};
        if (category === 'gender') {
            counts = _.countBy(users, 'gender');
        } else if (category === 'age') {
            counts = _.countBy(users, user => {
                const age = user.dob.age;
                if (age >= 18 && age <= 31) return '18-31';
                if (age >= 32 && age <= 49) return '32-49';
                if (age >= 50 && age <= 69) return '50-69';
                return 'Other';
            });
        } else if (category === 'country') {
            counts = _.countBy(users, user => user.location.country);
        }
        const labels = Object.keys(counts);
        const data = Object.values(counts);
        const ctx = document.getElementById('statisticsChart').getContext('2d');
        if (statisticsChart) statisticsChart.destroy();
        statisticsChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    label: `${_.capitalize(category)} Distribution`,
                    data,
                    backgroundColor: generateColors(data.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: {
                        display: true,
                        text: `User ${_.capitalize(category)} Statistics`
                    }
                }
            }
        });
    }

    function generateColors(count) {
        const palette = [
            '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#8AFF33', '#FF33E3', '#335BFF', '#FF5733'
        ];
        return _.times(count, i => palette[i % palette.length]);
    }

    statsCategorySelect.addEventListener('change', updateVisibleUsers);
    loadInitialUsers();
});
