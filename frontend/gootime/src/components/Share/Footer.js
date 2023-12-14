import React from "react";
import LoadingSpinner from "../LoadingSpinner";

const Footer = ({
  selectedTimeSlot,
  handleSubmit,
  isSubmitting,
  handleShare,
}) => (
  <div className="fixed bg-white bottom-0 left-0 right-0 flex justify-center items-center p-2">
    {window.location.pathname.startsWith("/preview") ? (
      <button
        className="fixed left-4 right-4 bottom-4 bg-main-yellow text-black p-2 rounded hover:shadow-md "
        onClick={handleShare}
      >
        Share
      </button>
    ) : (
      selectedTimeSlot && (
        <div className="flex items-center space-x-4 pb-4 pt-2">
          <p>{`Selected Time: ${new Date(
            selectedTimeSlot
          ).toLocaleString()}`}</p>
          <button
            className="bg-main-yellow text-black p-2 rounded hover:shadow-md"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <LoadingSpinner />}
            Submit
          </button>
        </div>
      )
    )}
  </div>
);

export default Footer;
