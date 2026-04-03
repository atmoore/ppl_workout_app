import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            PPL
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "#71717a",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            TRACKER
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
