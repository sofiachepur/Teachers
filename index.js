document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("myModal");
    const btn = document.getElementById("showFormButton");
    const closeBtn = document.querySelector(".close");

    btn.addEventListener("click", () => modal.style.display = "block");
    closeBtn.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", event => {
        if (event.target === modal) modal.style.display = "none";
    });

    document.querySelector(".left-btn").addEventListener("click", () => {
        document.querySelector(".people-container").scrollBy({ left: -250, behavior: "smooth" });
    });

    document.querySelector(".right-btn").addEventListener("click", () => {
        document.querySelector(".people-container").scrollBy({ left: 250, behavior: "smooth" });
    });


    document.querySelectorAll('.people').forEach(card => {
        const img = card.querySelector('img');
        const email = img?.dataset.email;
        if (!email) return;

        const storedFavorite = localStorage.getItem(`favorite_${email}`);
        img.dataset.favorite = storedFavorite === 'true' ? 'true' : 'false';

        const starEl = card.querySelector('.card-favorite');
        if (starEl) {
            starEl.textContent = storedFavorite === 'true' ? '★' : '☆';
        }
    });
});

function openPopup(element) {
    const img = element.querySelector('img');
    if (!img) return;

    const get = key => img.dataset[key] || '';
    const email = get('email');

    document.getElementById('popup-name').textContent = get('name');
    document.getElementById('popup-position').textContent = get('position');
    document.getElementById('popup-country').textContent = get('country');
    document.getElementById('popup-phone').textContent = get('phone');
    document.getElementById('popup-email').textContent = email;
    document.getElementById('popup-gender').textContent = get('gender');
    document.getElementById('popup-age').textContent = get('age');
    document.getElementById('popup-comment').textContent = get('comment');
    document.getElementById('popup-photo').src = get('photo') || 'iconka.png';
    document.getElementById('popup-map').href = get('map') || '#';

    const storedFavorite = localStorage.getItem(`favorite_${email}`);
    const isFavorite = storedFavorite === 'true';
    document.getElementById('favorite-star').textContent = isFavorite ? '★' : '☆';

    document.getElementById('popup').style.display = 'block';
}


function closePopup() {
    document.getElementById('popup').style.display = 'none';
}


function toggleFavorite() {
    const star = document.getElementById('favorite-star');
    const email = document.getElementById('popup-email').textContent;
    const isFavorite = star.textContent === '★';
    const newStatus = !isFavorite;


    localStorage.setItem(`favorite_${email}`, newStatus);


    star.textContent = newStatus ? '★' : '☆';


    const peopleCards = document.querySelectorAll('.people');
    peopleCards.forEach(card => {
        const img = card.querySelector('img');
        if (img && img.dataset.email === email) {
            img.dataset.favorite = newStatus.toString();
            const starEl = card.querySelector('.card-favorite');
            if (starEl) starEl.textContent = newStatus ? '★' : '☆';
        }
    });
}
