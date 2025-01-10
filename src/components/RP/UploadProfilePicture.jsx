import React, { useState } from 'react';

const UploadProfilePicture = ({ onImageSelect }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result); // Update preview image
        onImageSelect(e.target.result); // Send image data to parent
      };
      reader.readAsDataURL(file); // Convert image to data URL
    }
  };

  return (
      <div className="upload-profile-picture">
        <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-control"
        />
        {selectedImage && (
            <div>
              <h3>Image preview:</h3>
              <img
                  src={selectedImage}
                  alt="Selected Profile"
                  className="preview-image"
                  width="100"
              />
            </div>
        )}
      </div>
  );
};

export default UploadProfilePicture;
