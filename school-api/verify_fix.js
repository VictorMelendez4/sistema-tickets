// import fetch from 'node-fetch'; // Native fetch in Node 18+

async function testRegistration() {
    const url = 'http://localhost:4000/api/auth/register-teacher';
    const body = {
        firstName: "Armando",
        lastName: "Ciseña",
        email: `armando${Date.now()}@test.com`, // Unique email
        password: "password123",
        phone: "1234567890",
        specialty: ["Math"]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Response:', data);

        if (response.status === 201) {
            console.log("SUCCESS: Teacher registered successfully.");
        } else {
            console.log("FAILED: Registration failed.");
        }
    } catch (error) {
        console.error("ERROR: Could not connect to server.", error.message);
    }
}

testRegistration();
