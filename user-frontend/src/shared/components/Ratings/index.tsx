import React from "react";

const Ratings = ({ rating = 0, maxStars = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;

        return (
          <div key={index} className="relative w-6 h-6">
            {/* Empty Star */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="absolute w-6 h-6 text-gray-300"
            >
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61L12 17.77l-4.998 3.169a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.06 10.385a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z" />
            </svg>

            {/* Filled Star */}
            <div
              className="absolute overflow-hidden"
              style={{
                width:
                  rating >= starValue
                    ? "100%"
                    : rating >= starValue - 0.5
                    ? "50%"
                    : "0%",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-yellow-400"
              >
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61L12 17.77l-4.998 3.169a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.06 10.385a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Ratings;