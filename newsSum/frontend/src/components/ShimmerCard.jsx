import React from "react";

const ShimmerCard = ({ className = "" }) => {
  return (
    <div className={`rounded-lg overflow-hidden bg-gray-100 ${className}`}>
      <div className="h-40 shimmer" />
      <div className="p-4">
        <div className="h-4 w-3/4 mb-2 rounded shimmer" />
        <div className="h-3 w-full mb-2 rounded shimmer" />
        <div className="h-3 w-5/6 rounded shimmer" />
      </div>
    </div>
  );
};

export default ShimmerCard;
