import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          borderRadius: 8,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#fafafa",
            letterSpacing: -0.5,
          }}
        >
          P
        </span>
      </div>
    ),
    { ...size }
  );
}
