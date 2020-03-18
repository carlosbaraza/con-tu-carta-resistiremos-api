import express from "express";

const app = express();

const LETTERS = [
  { title: "Animo", body: "Animo, todos estamos contigo. Vamos a salir juntos de esta." }
];

app.get("/letters", (req, res) => {
  res.json(LETTERS);
});

app.listen(process.env.PORT || 3001);
