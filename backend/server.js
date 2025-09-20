const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const app = express();
const cors = require("cors");
const PORT = 5000;
app.use(cors());

// --- Connect to MongoDB ---
mongoose
  .connect(
    "mongodb+srv://codebitts:anilarora1@cluster0.9wpahhh.mongodb.net/imageDB?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// --- Create Schema ---
const imageSchema = new mongoose.Schema({
  name: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

const Image = mongoose.model("Image", imageSchema);

// --- Multer Setup (Memory Storage) ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Upload Route ---
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("1");
    const newImage = new Image({
      name: req.file.originalname,
      img: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    const savedImage = await newImage.save();
    res.json({ message: "Image uploaded to MongoDB!", id: savedImage._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// --- Get Image Route ---
app.get("/image/:id", async (req, res) => {
  try {
    console.log("Requested ID:", req.params.id);
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Image not found" });

    res.contentType(image.img.contentType);
    res.send(image.img.data);
  } catch (error) {
    res.status(404).json({ error: "Image not found" });
  }
});

// --- Beautify Route (Returns two images) ---
app.post("/beautify/:id", async (req, res) => {
  try {
    console.log("1");
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Image not found" });

    // Convert image buffer to base64 for sending to frontend
    const base64Image = `data:${
      image.img.contentType
    };base64,${image.img.data.toString("base64")}`;

    // Return two images (same for now)
    res.json({
      message: "Beautified images",
      images: [base64Image, base64Image],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to beautify image" });
  }
});

// --- Start Server ---
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
