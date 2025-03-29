import { StoryService, AuthService } from "@/lib/requests";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "StorySync Story";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { story_id: string };
}) {
  try {
    const story = await StoryService.getDetails(params.story_id);
    const owner = await AuthService.getUserName(story.owner_id);
    const ownerName = (owner.first_name + " " + owner.last_name).trim();

    if (!story) {
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
              background: "linear-gradient(to right, #8b5cf6, #6366f1)",
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
              position: "relative",
              overflow: "hidden",
              color: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: "40px",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(33, 34, 101, 0.08)",
                maxWidth: "80%",
                textAlign: "center",
                border: "1px solid rgba(33, 34, 101, 0.1)",
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="100" 
                height="100" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#1a2b5f" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{
                  marginBottom: "20px",
                }}
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>

              <h1
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  color: "#1a2b5f",
                  marginBottom: "15px",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.05)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2,
                }}
              >
                Story Not Found
              </h1>
            </div>
          </div>
        ),
        size
      );
    }

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
            background: "linear-gradient(to right, #8b5cf6, #6366f1)",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
            position: "relative",
            overflow: "hidden",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: "40px",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(33, 34, 101, 0.08)",
              maxWidth: "80%",
              textAlign: "center",
              border: "1px solid rgba(33, 34, 101, 0.1)",
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="100" 
              height="100" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#1a2b5f" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                marginBottom: "20px",
              }}
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>

            <h1
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: "#1a2b5f",
                marginBottom: "15px",
                textShadow: "1px 1px 2px rgba(0,0,0,0.05)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.2,
              }}
            >
              {story.title}
            </h1>

            <p
              style={{
                fontSize: 36,
                color: "#4a5568",
                fontWeight: 300,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.4,
              }}
            >
              By {ownerName || "Anonymous"}
            </p>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#ff6b6b",
            color: "white",
            fontFamily: "sans-serif",
            textAlign: "center",
            padding: "20px",
          }}
        >
          Error Generating Image
        </div>
      ),
      size
    );
  }
}
