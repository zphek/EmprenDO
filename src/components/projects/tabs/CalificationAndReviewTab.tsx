import React, { useState } from 'react';
import { Star, MoreVertical } from 'lucide-react';

// Review type definition
interface Review {
  id: number;
  author: string;
  rating: number;
  content: string;
  date: string;
  verified?: boolean;
}

// Sample review data
const sampleReviews: Review[] = [
  {
    id: 1,
    author: "Samantha D.",
    rating: 4.5,
    content: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt.",
    date: "Posted on August 14, 2023",
    verified: true
  },
  {
    id: 2,
    author: "Alex M.",
    rating: 4,
    content: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.",
    date: "Posted on August 15, 2023",
    verified: true
  }
];

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{review.author}</span>
            {review.verified && (
              <span className="text-blue-600 text-sm">✓</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <Star
                  key={index}
                  size={20}
                  className={`${
                    index < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200'
                  } mr-1`}
                />
              ))}
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreVertical size={20} className="text-gray-500" />
        </button>
      </div>
      <p className="text-gray-700 mb-3">{review.content}</p>
      <span className="text-sm text-gray-500">{review.date}</span>
    </div>
  );
}

function AddReview() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex);
  };

  const handleStarHover = (starIndex: number) => {
    setHoveredRating(starIndex);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = () => {
    console.log('Submitted:', { rating, review });
  };

  return (
    <section className="max-w-2xl mx-auto p-6 py-10">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Agrega tu reseña</h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-2">Calificación</p>
        <div
          className="flex gap-1"
          onMouseLeave={handleMouseLeave}
        >
          {[1, 2, 3, 4, 5].map((starIndex) => (
            <button
              key={starIndex}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                size={24}
                className={`${
                  (hoveredRating || rating) >= starIndex
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Reseña"
          className="w-full min-h-32 p-4 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
      >
        Enviar
      </button>
    </section>
  );
}

export default function CalificationAndReviewTab() {
  const [showAddReview, setShowAddReview] = useState(false);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-blue-900">Reseñas</h1>
        <button
          onClick={() => setShowAddReview(!showAddReview)}
          className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
        >
          Escribir una reseña
        </button>
      </div>

      {showAddReview ? (
        <AddReview />
      ) : (
        <div className="space-y-4">
          {sampleReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}