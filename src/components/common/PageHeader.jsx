import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Professional Medical Page Header Component matching exact user reference image:
 * - Light medical mint gradient background
 * - High-tech subtle dot matrix pattern overlay
 * - ECG pulse vector heartbeat waveform on the right
 * - Soft mint wave SVG overlay swelling from bottom-right corner
 * - Subtle medical cross "+" accents
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
  padding = '26px 0',
}) {
  return (
    <div
      className="page-header-banner"
      style={{
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(125deg, #EFFBF8 0%, #F6FCFB 45%, #E1F5F2 100%)',
        padding: padding,
        borderBottom: '1px solid rgba(15, 118, 110, 0.12)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.015)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Dot Matrix Pattern Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(15, 118, 110, 0.09) 1.2px, transparent 1.2px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Top-Left Soft Mint Curved Swell */}
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '260px',
          height: '160px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        viewBox="0 0 260 160"
        fill="none"
      >
        <path
          d="M0 0 L180 0 Q100 80 0 140 Z"
          fill="rgba(167, 243, 208, 0.25)"
        />
        <path
          d="M0 0 L120 0 Q60 60 0 100 Z"
          fill="rgba(207, 240, 233, 0.35)"
        />
      </svg>

      {/* Bottom-Right Large Soft Mint Wave Swell */}
      <svg
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '440px',
          height: '170px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        viewBox="0 0 440 170"
        fill="none"
      >
        <path
          d="M440 170 L440 30 Q340 10 230 95 Q140 150 0 170 Z"
          fill="rgba(207, 240, 233, 0.6)"
        />
        <path
          d="M440 170 L440 60 Q350 45 270 115 Q190 155 80 170 Z"
          fill="rgba(167, 243, 208, 0.45)"
        />
        <path
          d="M440 170 L440 95 Q370 85 310 135 Q240 160 150 170 Z"
          fill="rgba(45, 212, 191, 0.28)"
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
          color: 'rgba(15, 118, 110, 0.25)',
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
          right: '110px',
          fontSize: '18px',
          fontWeight: '300',
          color: 'rgba(15, 118, 110, 0.28)',
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
                      size={12}
                      style={{ opacity: 0.5, color: '#94A3B8' }}
                    />
                  )}
                  {item.link && !isLast ? (
                    <Link
                      to={item.link}
                      style={{
                        color: '#64748B',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                        fontWeight: '500',
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = 'var(--primary, #0F766E)')
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = '#64748B')
                      }
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      style={{
                        color: isLast ? '#0F2930' : '#64748B',
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
                      background: 'rgba(15, 118, 110, 0.1)',
                      color: 'var(--primary, #0F766E)',
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
                      color: '#0F2930',
                      margin: 0,
                      lineHeight: '1.25',
                      letterSpacing: '-0.02em',
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
                      background: 'rgba(15, 118, 110, 0.1)',
                      color: 'var(--primary, #0F766E)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      border: '1px solid rgba(15, 118, 110, 0.2)',
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
                    color: '#64748B',
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
