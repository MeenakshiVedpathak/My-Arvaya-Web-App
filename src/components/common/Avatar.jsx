export default function Avatar({ doctor, big = false }) {
  return (
    <div className={"avatar " + (big ? "big" : "")} style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {doctor.image ? (
        <img src={doctor.image} alt={doctor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        doctor.initials
      )}
    </div>
  );
}
