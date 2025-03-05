"use client";

import Image from "next/image";

interface ProfileImageProps {
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
}

export function ProfileImage({
  avatarUrl,
  firstName,
  lastName,
}: ProfileImageProps) {
  return (
    <div className="w-32 h-32 relative rounded-md overflow-hidden border">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`${firstName || ""} ${lastName || ""}`}
          fill
          style={{ objectFit: "cover" }}
          unoptimized={true}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-3xl">
            {firstName?.[0] || ""}
            {lastName?.[0] || ""}
          </span>
        </div>
      )}
    </div>
  );
}
