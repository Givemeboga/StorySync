import { ImageResponse } from "next/og";
import { Inter } from "next/font/google";

export const runtime = "edge";
export const alt = "StorySync - Create, Share, Inspire";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const inter = Inter({ subsets: ["latin"] });

export default function Image() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "oklch(0.985 0.002 247.839)",
            fontFamily: inter.style.fontFamily,
            padding: "40px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(33, 34, 101, 0.1) 0%, rgba(33, 34, 101, 0.3) 100%)",
              zIndex: 1,
            }}
          />

          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "oklch(0.13 0.028 261.692)",
              marginBottom: "15px",
              maxWidth: "80%",
              lineHeight: 1.2,
              zIndex: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            StorySync
          </h1>

          <p
            style={{
              fontSize: 36,
              color: "oklch(0.4 0.1 261.692)",
              zIndex: 2,
              maxWidth: "70%",
            }}
          >
            Create, Share, and Inspire Stories
          </p>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: "Inter",
            data: Buffer.from(inter.style.fontFamily),
            style: "normal",
          },
        ],
      }
    );
  } catch (error) {
    console.error("OpenGraph Image Generation Error:", error);
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "red",
            color: "white",
            fontFamily: inter.style.fontFamily,
          }}
        >
          Error Generating Image
        </div>
      ),
      size
    );
  }
}
