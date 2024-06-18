async function addUser() {
  const url = "http://localhost:3000/add";

  const data = {
    name: "John",
    surname: "Doe",
    email: "john.doe@example.com",
    login: "alamakota",
    password: "wcaleniema",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Sukces:", result);
    } else {
      console.error("Błąd:", response.statusText);
    }
  } catch (error) {
    console.error("Błąd sieci:", error);
  }
}

addUser();
