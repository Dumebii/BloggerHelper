import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Ozigi — AI Content That Sounds Human';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          background: '#f9f8f7',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Red left accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 8,
            height: '100%',
            background: '#dc2626',
          }}
        />

        {/* Decorative large "O" watermark */}
        <div
          style={{
            position: 'absolute',
            right: -60,
            bottom: -80,
            width: 420,
            height: 420,
            borderRadius: '50%',
            border: '48px solid rgba(15,23,42,0.04)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 40,
            bottom: 0,
            width: 280,
            height: 280,
            borderRadius: '50%',
            border: '32px solid rgba(220,38,38,0.07)',
            display: 'flex',
          }}
        />

        {/* Top bar: logo + url */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '48px 72px 0 80px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://ozigi.app/logo.png"
              width={44}
              height={44}
              alt=""
              style={{ borderRadius: 10 }}
            />
            <span
              style={{
                color: '#0f172a',
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: '-1.5px',
                textTransform: 'uppercase',
              }}
            >
              Ozigi
            </span>
          </div>

          <span
            style={{
              color: '#94a3b8',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}
          >
            ozigi.app
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 80px',
          }}
        >
          {/* Eyebrow tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#dc2626',
              }}
            />
            <span
              style={{
                color: '#dc2626',
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              AI Content Engine
            </span>
          </div>

          {/* Headline line 1 */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-4px',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            Content that
          </div>

          {/* Headline line 2 — "sounds like" white on red slab + "you." */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 20,
              marginTop: 6,
              lineHeight: 0.95,
            }}
          >
            <div
              style={{
                background: '#dc2626',
                padding: '4px 24px 10px 0',
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              <span
                style={{
                  fontSize: 96,
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '-4px',
                  textTransform: 'uppercase',
                }}
              >
                sounds like
              </span>
            </div>
            <span
              style={{
                fontSize: 96,
                fontWeight: 900,
                color: '#dc2626',
                letterSpacing: '-4px',
                textTransform: 'uppercase',
              }}
            >
              you.
            </span>
          </div>

          {/* Subtext */}
          <div
            style={{
              marginTop: 32,
              fontSize: 22,
              fontWeight: 500,
              color: '#64748b',
              lineHeight: 1.45,
              maxWidth: 680,
              display: 'flex',
            }}
          >
            Turn raw notes, URLs & ideas into posts that pass for human.
            No AI aftertaste.
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 80px',
            borderTop: '1px solid rgba(15,23,42,0.08)',
          }}
        >
          {/* Platform pills */}
          <div style={{ display: 'flex', gap: 10 }}>
            {['𝕏', 'LinkedIn', 'Discord', 'Slack', 'Email'].map((p) => (
              <div
                key={p}
                style={{
                  background: 'rgba(15,23,42,0.05)',
                  border: '1px solid rgba(15,23,42,0.1)',
                  borderRadius: 100,
                  padding: '7px 18px',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                }}
              >
                {p}
              </div>
            ))}
          </div>

          {/* "Try free" badge */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: 100,
              padding: '10px 24px',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            Try free →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
