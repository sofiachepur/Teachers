document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form.modal-body');

    function startsWithCapital(str) {
        return /^[A-ZА-ЯҐІЇЄ][a-zа-яґіїє'\-\s]*$/.test(str);
    }

    function validatePhone(phone, country) {
        if (!phone) return false;
        if (country === 'Ukraine' || country === 'Україна') {
     return /^(\+380|0)\d{9}$/.test(phone.replace(/\s+/g, ''));
        } else if (country === 'USA' || country === 'United States') {
            return /^(\(\d{3}\)\s?|\d{3}-)\d{3}-\d{4}$/.test(phone);
        }
        return /^[\d+\-\s()]+$/.test(phone);
    }

    function validateEmail(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value.trim();
        });

        const errors = [];


        if (!data.name || !startsWithCapital(data.name)) {
            errors.push('Поле "Name" повинно починатися з великої літери.');
        }

        if (!data.gender || !['male', 'female', 'other'].includes(data.gender)) {
            errors.push('Виберіть стать (gender).');
        }

        if (data.comments && !startsWithCapital(data.comments)) {
            errors.push('Поле "Notes" має починатися з великої літери, якщо заповнене.');
        }

        if (!data.country || !startsWithCapital(data.country)) {
            errors.push('Поле "Country" має починатися з великої літери.');
        }

        if (!data.city || !startsWithCapital(data.city)) {
            errors.push('Поле "City" має починатися з великої літери.');
        }

        let age = null;
        if (data.birthday) {
            const birthDate = new Date(data.birthday);
            const diffMs = Date.now() - birthDate.getTime();
            const ageDt = new Date(diffMs);
            age = Math.abs(ageDt.getUTCFullYear() - 1970);
            if (isNaN(age) || age <= 0) {
                errors.push('Поле "Date of Birth" має бути валідною датою.');
            }
        } else {
            errors.push('Поле "Date of Birth" обов\'язкове.');
        }

        if (data.phone && !validatePhone(data.phone, data.country)) {
            errors.push('Невірний формат телефону для країни ' + data.country);
        }

        if (data.email && !validateEmail(data.email)) {
            errors.push('Невірний формат email.');
        }

        if (errors.length > 0) {
            alert('Помилки:\n' + errors.join('\n'));
            return;
        }

        fetch('http://localhost:3000/teachers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                alert('Викладача додано успішно!');
                form.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Помилка при відправці даних');
            });
    });
});
