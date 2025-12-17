"use client";

import Link from "next/link";
import Image from "next/image";

export default function GigCard({ gig }) {
  return (
    <Link href={`/gigs/${gig._id}`} className="block cursor-pointer">
      {/* GigCard START */}
      <div className="card bg-base-200 hover:shadow-xl transition-all duration-300 h-full">
        {/* Image */}
        <figure className="relative h-48 bg-base-300">
          {gig.images && gig.images.length > 0 ? (
            <Image
              src={gig.images[0].url}
              alt={gig.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-base-content/30">
              No image
            </div>
          )}
        </figure>

        <div className="card-body p-4">
          {/* Freelancer info */}
          <div className="flex items-center gap-2 mb-2">
            <div className="avatar">
              <div className="w-6 h-6 rounded-full">
                {gig.freelancerId?.image ? (
                  <Image
                    src={gig.freelancerId.image}
                    alt={gig.freelancerId.name}
                    width={24}
                    height={24}
                  />
                ) : (
                  <div className="bg-primary text-primary-content flex items-center justify-center text-xs">
                    {gig.freelancerId?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>
            <span className="text-sm text-base-content/70">
              {gig.freelancerId?.name || 'Unknown'}
            </span>
          </div>

          {/* Title */}
          <h3 className="card-title text-base line-clamp-2 min-h-[3rem]">
            {gig.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-sm">
            {gig.rating > 0 ? (
              <>
                <span className="text-warning">★</span>
                <span className="font-semibold">{gig.rating.toFixed(1)}</span>
                <span className="text-base-content/60">
                  ({gig.reviewCount})
                </span>
              </>
            ) : (
              <span className="text-base-content/60">No reviews yet</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-base-300">
            <span className="text-sm text-base-content/60">Starting at</span>
            <span className="text-lg font-bold">
              ${gig.packages?.basic?.price || 0}
            </span>
          </div>
        </div>
      </div>
      {/* GigCard END */}
    </Link>
  );
}
