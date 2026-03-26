import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Reivo — Same output. Half the cost.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
        fontFamily: 'system-ui, sans-serif',
        padding: '60px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#a78bfa',
            letterSpacing: '0.05em',
          }}
        >
          REIVO
        </div>
        <div
          style={{
            fontSize: '56px',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          Same output.
        </div>
        <div
          style={{
            fontSize: '56px',
            fontWeight: 800,
            color: '#a78bfa',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          Half the cost.
        </div>
        <div
          style={{
            fontSize: '22px',
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.5,
            marginTop: '16px',
          }}
        >
          AI proxy that cuts API costs 40-60% via smart model routing. OpenAI / Anthropic / Google.
        </div>
        <div
          style={{
            display: 'flex',
            gap: '32px',
            marginTop: '24px',
          }}
        >
          {['70+ Models', '<30ms Latency', 'Quality Verified'].map((text) => (
            <div
              key={text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '18px',
                color: '#d4d4d8',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#a78bfa',
                }}
              />
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
