import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

// Routes
app.use("/api/hello", (req, res) => {
  const timestamp = new Date().toISOString();
  res.json({ hello: "world", world: "hello", cool: "video", timestamp });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
