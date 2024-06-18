async function bookCourt() {
  const url = "http://localhost:3000/reserve-court";

  const data = {
    userId: 2,
    reservationDetails: {
      date: "2024-06-05",
      hour: "10:00",
      fieldId: 2,
    },
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

bookCourt();
