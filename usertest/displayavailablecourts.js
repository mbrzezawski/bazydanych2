async function checkAvailableCourts() {
  const url = "http://localhost:3000/available-courts";
  const data = {
    date: "2024-06-05",
    hour: "10:00",
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
      console.log("Dostępne korty:", result.availableCourts);
    } else {
      console.error("Błąd podczas odbierania danych:", await response.text());
    }
  } catch (error) {
    console.error("Błąd sieci:", error);
  }
}

checkAvailableCourts();
