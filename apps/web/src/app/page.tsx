export default function HomePage() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1.5rem',
        padding: '2rem',
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center',
        }}
      >
        XandriX AI OS
      </h1>
      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '1.125rem',
          textAlign: 'center',
          maxWidth: '42ch',
          lineHeight: 1.6,
        }}
      >
        A modular, production-grade autonomous AI software platform. Phase 0 — architecture and foundations in progress.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: '900px',
          marginTop: '1rem',
        }}
      >
        {[
          { name: 'XandriX Chat', status: '🚧 Building', desc: 'Web AI assistant' },
          { name: 'Terminal Agent', status: '🚧 Building', desc: 'CLI autonomy layer' },
          { name: 'XandriX Studio', status: '📋 Planned', desc: 'Browser IDE' },
          { name: 'XandriX Code', status: '📋 Planned', desc: 'Editor extensions' },
          { name: 'Orchestrator', status: '🚧 Building', desc: 'Task coordination' },
          { name: 'SecureOps', status: '📋 Planned', desc: 'Defensive security' },
        ].map((surface) => (
          <div
            key={surface.name}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{surface.status}</span>
            <strong style={{ fontSize: '1rem' }}>{surface.name}</strong>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{surface.desc}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
