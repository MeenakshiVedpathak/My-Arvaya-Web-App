import React, { useState, useEffect } from "react";
import { fetchImageBlob } from "../../services/uploadService";

export default function Avatar({ doctor = {}, big = false, size }) {
  const rawImg = doctor.profile_image || doctor.image || doctor.photo;
  const [imgSrc, setImgSrc] = useState(rawImg || "");

  useEffect(() => {
    let isMounted = true;
    const targetImg = doctor.profile_image || doctor.image || doctor.photo;

    if (!targetImg) {
      setImgSrc("");
      return;
    }

    if (typeof targetImg === "string" && (targetImg.startsWith("data:") || targetImg.startsWith("blob:"))) {
      setImgSrc(targetImg);
      return;
    }

    fetchImageBlob(targetImg, "doctorProfileImage")
      .then((url) => {
        if (isMounted) {
          setImgSrc(url || targetImg);
        }
      })
      .catch(() => {
        if (isMounted) {
          setImgSrc(targetImg);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [doctor.image, doctor.profile_image, doctor.photo]);

  const containerStyle = {
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...(size ? { width: size, height: size } : {})
  };

  return (
    <div className={"avatar " + (big ? "big" : "")} style={containerStyle}>
      {imgSrc && !imgSrc.includes("ui-avatars") ? (
        <img src={imgSrc} alt={doctor.name || "Doctor"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        doctor.initials || (doctor.name ? doctor.name.charAt(0).toUpperCase() : "D")
      )}
    </div>
  );
}
