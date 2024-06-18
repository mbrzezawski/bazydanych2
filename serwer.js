const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const mongoURI = "mongodb://localhost:27017/Tenis";
app.use(express.json());
app.use(cors());
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Połączono z MongoDB"))
  .catch((err) => console.error("Błąd połączenia z MongoDB:", err));

app.get("/", (req, res) => {
  res.send("Witaj w aplikacji Express z MongoDB!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

const User = require("./models/user");
const Court = require("./models/tenisfield");
const DayReservation = require("./models/dayreservations");

app.get("/Users", async (req, res) => {
  try {
    const users = await User.find();
    let htmlResponse = `<table border="1"><tr><th>ID</th><th>Surname</th><th>Name</th><th>Login</th><th>Email</th><th>Reservations</th></tr>`;
    console.log(users);
    users.forEach((user) => {
      console.log(user);
      htmlResponse += `<tr><td>${user.id}</td><td>${user.surname}</td><td>${
        user.name
      }</td><td>${user.credentials
        .map((l) => l.login)
        .join(", ")}</td><td>${user.credentials
        .map((l) => l.email)
        .join(", ")}</td><td>${user.reserved
        .map((r) => `${r.date} at ${r.hour} on field ${r.fieldId}`)
        .join(", ")}</td></tr>`;
    });
    htmlResponse += `</table>`;
    res.send(htmlResponse);
  } catch (error) {
    console.error("Błąd przy pobieraniu danych:", error);
    res.status(500).send("Nie można pobrać danych");
  }
});

app.get("/tennisfields", async (req, res) => {
  try {
    const courts = await Court.find();
    let htmlResponse = `<h2>Tennis Courts</h2><table border="1"><tr><th>ID</th><th>Type</th><th>Price</th></tr>`;
    courts.forEach((court) => {
      htmlResponse += `<tr><td>${court.id}</td><td>${court.Type}</td><td>${court.Price}</td></tr>`;
    });
    htmlResponse += `</table>`;
    res.send(htmlResponse);
  } catch (error) {
    console.error("Error retrieving tennis field data:", error);
    res.status(500).send("Unable to retrieve tennis field data");
  }
});

app.get("/dayreservations", async (req, res) => {
  try {
    const reservations = await DayReservation.find();
    let htmlResponse = `<h2>Day Reservations</h2><table border="1"><tr><th>ID</th><th>Date</th><th>Reservations</th></tr>`;
    reservations.forEach((reservation) => {
      const reservationDetails = reservation.reservations
        .map((r) => `${r.hour} for field ${r.fieldid} by user ${r.userId}`)
        .join(", ");
      htmlResponse += `<tr><td>${reservation.id}</td><td>${reservation.date}</td><td>${reservationDetails}</td></tr>`;
    });
    htmlResponse += `</table>`;
    res.send(htmlResponse);
  } catch (error) {
    console.error("Error retrieving day reservation data:", error);
    res.status(500).send("Unable to retrieve day reservation data");
  }
});

app.post("/add", async (req, res) => {
  console.log(req.body);
  const userWithHighestId = await User.findOne()
    .sort({ id: -1 })
    .select("id -_id")
    .limit(1);
  console.log(userWithHighestId);
  console.log(req.body.login);
  try {
    let email = req.body.email;
    let login = req.body.login;
    const existingUser = await User.findOne({ $or: [{ email }, { login }] });

    if (existingUser) {
      return res.status(409).json({ message: "Użytkownik już istnieje" });
    }

    const newUser = new User({
      id: userWithHighestId.id + 1,
      surname: req.body.surname,
      name: req.body.name,
      credentials: [
        {
          login: req.body.login,
          password: req.body.password,
          email: req.body.email,
        },
      ],
      reserved: [],
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: "Użytkownik dodany pomyślnie", user: newUser });
  } catch (error) {
    console.error("Error during user search or creation:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.post("/log", async (req, res) => {
  const { login, password } = req.body;

  try {
    const user = await User.findOne({
      "credentials.login": login,
      "credentials.password": password,
    });

    if (user) {
      res.status(200).json({ message: "Użytkownik zweryfikowany pomyślnie." });
    } else {
      res.status(401).json({ message: "Nieprawidłowy login lub hasło." });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/reserved", async (req, res) => {
  const { login } = req.body;
  console.log(login);
  try {
    const user = await User.findOne({ "credentials.login": login }, "reserved");

    if (user) {
      res.status(200).json({
        message: "Rezerwacje użytkownika znalezione pomyślnie.",
        reserved: user.reserved,
      });
    } else {
      res
        .status(404)
        .json({ message: "Nie znaleziono użytkownika o podanym loginie." });
    }
  } catch (error) {
    console.error("Error retrieving user reservations:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/reserve-court", async (req, res) => {
  const { userId, reservationDetails } = req.body;
  try {
    const date = await DayReservation.findOne({
      date: reservationDetails.date,
    });

    const dayReservationsWithHighestId = await DayReservation.findOne()
      .sort({ id: -1 })
      .select("id -_id")
      .limit(1);
    currentId = dayReservationsWithHighestId.id + 1;

    if (!date) {
      const newDayReservation = new DayReservation({
        id: dayReservationsWithHighestId.id + 1,
        date: reservationDetails.date,
        reservations: [
          {
            userId: userId,
            hour: reservationDetails.hour,
            fieldid: reservationDetails.fieldId,
          },
        ],
      });
      await newDayReservation.save();
    } else if (date) {
      if (date.reservations.some((e) => e.hour === reservationDetails.hour)) {
        return res
          .status(404)
          .json({ message: "Istnieje już taka rezerwacja" });
      }
      console.log(reservationDetails);
      date.reservations.push({
        userId: userId,
        hour: reservationDetails.hour,
        fieldid: reservationDetails.fieldId,
      });
      await date.save();
      currentId = date.id;
    }
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika." });
    }

    user.reserved.push({
      reservationId: currentId,
      hour: reservationDetails.hour,
      date: reservationDetails.date,
      fieldId: reservationDetails.fieldId,
    });
    await user.save();

    res.status(200).json({
      message: "Rezerwacja została dodana.",
      reservation: reservationDetails,
    });
  } catch (error) {
    console.error("Error during reservation:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/available-courts", async (req, res) => {
  const { date, hour } = req.body;

  try {
    const reservations = await DayReservation.find({
      date: date,
      "reservations.hour": hour,
    });
    console.log(reservations);
    const occupiedFields = reservations.flatMap((reservation) =>
      reservation.reservations.map((r) => r.fieldid)
    );
    console.log(occupiedFields);
    const allCourts = await Court.find({});
    console.log(allCourts);

    const availableCourts = allCourts.filter(
      (court) => !occupiedFields.includes(court.id)
    );
    console.log(availableCourts);
    res.status(200).json({
      message: "Dostępne korty na wybraną godzinę i datę:",
      availableCourts,
    });
  } catch (error) {
    console.error("Error fetching available courts:", error);
    res.status(500).send("Internal Server Error");
  }
});
