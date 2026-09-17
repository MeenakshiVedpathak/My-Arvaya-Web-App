import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Enterprise Dark Teal Medical Header Component matching exact reference Image 2 & Image 3:
 * - Deep dark slate-teal background gradient overlay with user photo (/hero_bg_doctor.jpg)
 * - Translucent dot matrix pattern overlay
 * - Sleek organic wave vector overlays swelling from bottom-right & top-left
 * - Cyan & white breadcrumbs
 * - Bold white title with crisp typography
 * - Soft translucent subtitle
 * - Translucent dark capsule action badges & styled tabs
 */
export default function PageHeader({
  breadcrumbs = [],
  title,
  subtitle,
  icon,
  badge,
  actions,
  children,
  style = {},
  containerStyle = {},
  padding = '32px 0',
  minHeight = '210px',
}) {
  return (
    <div
      className="page-header-banner"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: minHeight,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(135deg, rgba(17, 40, 45, 0.88) 0%, rgba(22, 52, 59, 0.84) 55%, rgba(13, 32, 36, 0.90) 100%), url("/hero_bg_doctor.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
        padding: padding,
        borderBottom: '1px solid rgba(45, 212, 191, 0.15)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        color: '#FFFFFF',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Dot Matrix Pattern Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Top-Left Dark Teal & Cyan Curved Swell (Exact Match to Image) */}
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '260px',
          height: '140px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        viewBox="0 0 260 140"
        fill="none"
      >
        <path
          d="M0 0 L240 0 C150 40 80 85 0 135 Z"
          fill="rgba(15, 118, 110, 0.45)"
        />
        <path
          d="M0 0 L160 0 C100 30 50 60 0 95 Z"
          fill="rgba(45, 212, 191, 0.25)"
        />
      </svg>

      {/* Bottom-Right Short Dark Teal & Cyan Waves (Exact Short Height Match to Image) */}
      <svg
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '520px',
          height: '85px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        viewBox="0 0 520 85"
        fill="none"
      >
        <path
          d="M520 85 L520 15 Q380 5 260 45 Q130 80 0 85 Z"
          fill="rgba(11, 45, 52, 0.65)"
        />
        <path
          d="M520 85 L520 30 Q390 22 280 55 Q160 82 40 85 Z"
          fill="rgba(20, 184, 166, 0.40)"
        />
        <path
          d="M520 85 L520 50 Q410 42 320 68 Q210 85 120 85 Z"
          fill="rgba(45, 212, 191, 0.25)"
        />
      </svg>

      {/* Subtle Medical Plus Cross Accents */}
      <div
        style={{
          position: 'absolute',
          top: '22px',
          left: '95px',
          fontSize: '16px',
          fontWeight: '300',
          color: 'rgba(45, 212, 191, 0.25)',
          pointerEvents: 'none',
          zIndex: 1,
          fontFamily: 'sans-serif',
        }}
      >
        +
      </div>
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '120px',
          fontSize: '18px',
          fontWeight: '300',
          color: 'rgba(45, 212, 191, 0.3)',
          pointerEvents: 'none',
          zIndex: 1,
          fontFamily: 'sans-serif',
        }}
      >
        +
      </div>

      <div
        className="container"
        style={{ position: 'relative', zIndex: 2, ...containerStyle }}
      >
        {/* Breadcrumb row */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div
            className="flex items-center gap-2 text-muted mb-2.5"
            style={{ fontSize: '13px', fontWeight: '500' }}
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <ChevronRight
                      size={13}
                      style={{ opacity: 0.7, color: 'rgba(45, 212, 191, 0.7)' }}
                    />
                  )}
                  {item.link && !isLast ? (
                    <Link
                      to={item.link}
                      style={{
                        color: '#2DD4BF',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                        fontWeight: '500',
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = '#5EEAD4')
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = '#2DD4BF')
                      }
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      style={{
                        color: isLast ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                        fontWeight: isLast ? '700' : '500',
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Title and Actions Row */}
        {(title || actions) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              width: '100%',
            }}
          >
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {icon && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(45, 212, 191, 0.15)',
                      color: '#2DD4BF',
                      border: '1px solid rgba(45, 212, 191, 0.25)',
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                )}
                {title && (
                  <h1
                    style={{
                      fontSize: '26px',
                      fontWeight: '800',
                      color: '#FFFFFF',
                      margin: 0,
                      lineHeight: '1.25',
                      letterSpacing: '-0.02em',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {title}
                  </h1>
                )}
                {badge && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      background: 'rgba(45, 212, 191, 0.15)',
                      color: '#2DD4BF',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      border: '1px solid rgba(45, 212, 191, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p
                  style={{
                    fontSize: '14.5px',
                    color: 'rgba(255, 255, 255, 0.78)',
                    margin: '6px 0 0 0',
                    lineHeight: '1.4',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {actions && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginLeft: 'auto',
                  flexShrink: 0,
                }}
              >
                {actions}
              </div>
            )}
          </div>
        )}

        {children && <div style={{ marginTop: title ? '16px' : 0 }}>{children}</div>}
      </div>
    </div>
  );
}

