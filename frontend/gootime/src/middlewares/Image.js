import React, { useState } from "react";

export default function Image({
  imageFileName,
  hoverImageFileName = imageFileName,
  linkTo,
  onClick,
  customStyle,
}) {
  const publicUrl = process.env.PUBLIC_URL;
  const imageFolder = "images";
  const imageUrl = `${publicUrl}/${imageFolder}/${imageFileName}`;
  const hoverImageUrl = `${publicUrl}/${imageFolder}/${hoverImageFileName}`;

  const [isHovered, setIsHovered] = useState(false);

  const handleImageClick = () => {
    if (linkTo) {
      window.location.href = linkTo;
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <img
      src={isHovered ? hoverImageUrl : imageUrl}
      alt={isHovered ? hoverImageFileName : imageFileName}
      className={`cursor-pointer ${customStyle}`}
      onClick={handleImageClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}
