import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // Import the CSS file

function App() {
  const [file, setFile] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [beautifiedImages, setBeautifiedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setBeautifiedImages([]); // clear old beautified images
  };

  // Upload image to backend
  const handleUpload = async () => {
    if (!file) return alert("Please select an image first!");
    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data.message);
      setImageId(res.data.id);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Beautify image using stored ID
  const handleBeautify = async () => {
    if (!imageId) return alert("Upload image first!");

    try {
      setLoading(true);
      const res = await axios.post(`http://localhost:5000/beautify/${imageId}`);
      if (res.data.images && res.data.images.length > 0) {
        setBeautifiedImages(res.data.images);
      } else {
        alert("No images received from server");
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h2>Image Uploader</h2>
      <input type="file" onChange={handleFileChange} />
      {preview && <img className="preview" src={preview} alt="preview" />}
      <div className="button-group">
        <button
          className="submit-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Submit"}
        </button>
        <button
          className="beautify-btn"
          onClick={handleBeautify}
          disabled={!imageId || loading}
        >
          {loading ? "Processing..." : "Beautify Image"}
        </button>
      </div>

      {beautifiedImages.length > 0 && (
        <div className="beautified-container">
          <h3>Beautified Images</h3>
          <div className="beautified-images">
            {beautifiedImages.map((img, index) => (
              <img key={index} src={img} alt={`beautified-${index}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
