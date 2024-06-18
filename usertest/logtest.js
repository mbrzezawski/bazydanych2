async function logUser() {
  const url = "http://localhost:3000/log";

  const data = {
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

logUser();
