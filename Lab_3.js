// дані
const randomUserMock = [
    {
        gender: "male",
        name: { title: "Mr", first: "Norbert", last: "Weishaupt" },
        location: {
            city: "Rhön-Grabfeld",
            state: "Mecklenburg-Vorpommern",
            country: "Germany",
            postcode: 52640,
            coordinates: { latitude: "-42.1817", longitude: "-152.1685" },
            timezone: { offset: "+9:30", description: "Adelaide, Darwin" }
        },
        email: "norbert.weishaupt@example.com",
        dob: { date: "1956-12-23T19:09:19.602Z", age: 65 },
        phone: "0079-8291509",
        picture: {
            large: "https://randomuser.me/api/portraits/men/28.jpg",
            thumbnail: "https://randomuser.me/api/portraits/thumb/men/28.jpg"
        }
    }
];

const additionalUsers = [
    {
        full_name: "Jane Doe",
        age: 30,
        country: "USA",
        email: "jane.doe@example.com",
        phone: "+1-202-555-0173",
        gender: "female",
        city: "New York",
        state: "NY",
        note: "Excellent",
        picture_large: "",
        picture_thumbnail: ""
    },
    {
        full_name: "Ivan Ivanov",
        age: 25,
        country: "Ukraine",
        email: "ivan.ivanov@example.com",
        phone: "+380-44-555-1234",
        gender: "male",
        city: "Kyiv",
        state: "Kyivska",
        note: "Good",
        picture_large: "",
        picture_thumbnail: ""
    },
    {
        full_name: "Anna Müller",
        age: 35,
        country: "Germany",
        email: "anna.mueller@example.com",
        phone: "+49-30-123456",
        gender: "female",
        city: "Berlin",
        state: "Berlin",
        note: "Excellent",
        picture_large: "",
        picture_thumbnail: ""
    },
    {
        full_name: "John Smith",
        age: 40,
        country: "UK",
        email: "john.smith@example.com",
        phone: "+44-20-7946-0958",
        gender: "male",
        city: "London",
        state: "England",
        note: "Average",
        picture_large: "",
        picture_thumbnail: ""
    }
];

const courses = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing",
    "Chess", "Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"
];

// Завдання 1, форматування
function formatUser(user) {
    return {
        gender: user.gender,
        title: user.name?.title || "",
        full_name: user.full_name || `${user.name?.first || ""} ${user.name?.last || ""}`.trim(),
        city: user.location?.city || user.city || "",
        state: user.location?.state || user.state || "",
        country: user.location?.country || user.country || "",
        postcode: user.location?.postcode || "",
        coordinates: user.location?.coordinates || {},
        timezone: user.location?.timezone || {},
        email: user.email,
        b_date: user.dob?.date || null,
        age: user.dob?.age || user.age,
        phone: user.phone,
        picture_large: user.picture?.large || user.picture_large || "",
        picture_thumbnail: user.picture?.thumbnail || user.picture_thumbnail || "",
        id: crypto.randomUUID(),
        favorite: Math.random() < 0.5,
        course: courses[Math.floor(Math.random() * courses.length)],
        bg_color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        note: user.note || ""
    };
}

function mergeAndFormat(users1, users2) {
    const all = [...users1, ...users2];
    const seen = new Set();
    const formatted = [];
    for (const user of all) {
        const email = user.email;
        if (!seen.has(email)) {
            seen.add(email);
            formatted.push(formatUser(user));
        }
    }
    return formatted;
}

const users = mergeAndFormat(randomUserMock, additionalUsers);
console.log("Завдання 1", users);

//Завдання 2, валідація
function isValidUser(user) {
    const strFields = ["full_name", "gender", "note", "state", "city", "country"];
    const startsWithCapital = s => typeof s === "string" && /^[A-ZА-Я]/.test(s);
    for (const field of strFields) {
        if (!startsWithCapital(user[field])) return false;
    }
    const validEmail = typeof user.email === "string" && user.email.includes("@");
    const validAge = typeof user.age === "number";
    const validPhone = typeof user.phone === "string";
    return validEmail && validAge && validPhone;
}

console.log("Завдання 2");
users.forEach(u => console.log(`${u.full_name}: ${isValidUser(u)}`));

// Завдання 3, фільтрація
function filterUsers(users, filters) {
    return users.filter(user =>
        Object.entries(filters).every(([key, value]) => user[key] === value)
    );
}
console.log("Завдання 3:");
console.log(filterUsers(users, { country: "Germany" }));

//Завдання 4, сортування
function sortUsers(users, field, ascending = true) {
    return [...users].sort((a, b) => {
        if (typeof a[field] === "number") {
            return ascending ? a[field] - b[field] : b[field] - a[field];
        } else {
            return ascending
                ? (a[field] || "").localeCompare(b[field] || "")
                : (b[field] || "").localeCompare(a[field] || "");
        }
    });
}
console.log("Завдання 4");
console.log(sortUsers(users, "age"));

// Завдання 5, пошук по імені
function findUser(users, field, value) {
    return users.find(user => user[field] === value);
}
console.log("Завдання 5:");
console.log(findUser(users, "full_name", "Ivan Ivanov"));

//пошук по частині
function findUsersByPartialMatch(users, field, partialValue) {
    const lowerPartial = partialValue.toLowerCase();
    return users.filter(user =>
        (user[field] || "").toLowerCase().includes(lowerPartial)
    );
}
console.log("Завдання 5.1 - Частковий пошук по імені:");
console.log(findUsersByPartialMatch(users, "full_name", "Ivan"));

//Завдання 6, відсоток
function percentageMatch(users, predicate) {
    const matchCount = users.filter(predicate).length;
    return (matchCount / users.length) * 100;
}
console.log("Завдання 6 - % користувачів віком > 30:");
console.log(percentageMatch(users, u => u.age > 30));
