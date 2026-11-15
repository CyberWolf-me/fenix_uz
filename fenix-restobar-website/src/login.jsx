/* ═══════════ FENIX Dispatch OS — Luxury Branded Login Screen ═══════════ */
function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim()) {
      setError('Пожалуйста, введите имя пользователя');
      return;
    }
    if (!password.trim()) {
      setError('Пожалуйста, введите пароль администратора');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        const token = data.token;
        if (remember) {
          localStorage.setItem('fenix_admin_auth', token);
        } else {
          sessionStorage.setItem('fenix_admin_auth', token);
        }
        // Set persistent cookie
        document.cookie = `fenix_admin_auth=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
        
        if (onLoginSuccess) {
          onLoginSuccess(token, data.user);
        }
      } else {
        setError(data.error || 'Неверное имя пользователя или пароль');
      }
    } catch (err) {
      setError('Ошибка связи с сервером. Убедитесь, что сервер запущен.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 25%, rgba(211, 170, 99, 0.16) 0%, rgba(14, 13, 10, 0.96) 65%, #070605 100%)',
      fontFamily: 'var(--f-body, "Manrope", system-ui, sans-serif)',
      color: 'var(--text, #f2ebdc)',
      padding: '20px',
      overflowY: 'auto'
    }}>
      {/* Subtle background ambient light */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(211, 170, 99, 0.12) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '430px',
        background: 'rgba(18, 17, 13, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(211, 170, 99, 0.3)',
        borderRadius: '20px',
        boxShadow: '0 32px 80px -16px rgba(0, 0, 0, 0.9), 0 0 40px -10px rgba(211, 170, 99, 0.18)',
        padding: '38px 32px 32px',
        boxSizing: 'border-box'
      }}>
        {/* Brand Crest & Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(211, 170, 99, 0.28) 0%, rgba(211, 170, 99, 0.08) 100%)',
            border: '1px solid rgba(211, 170, 99, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(211, 170, 99, 0.2)'
          }}>
            <img
              src="img/fenix-mark.svg"
              alt="Fenix"
              style={{
                width: '38px',
                height: '38px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(211, 170, 99, 0.4))'
              }}
            />
          </div>

          <h1 style={{
            margin: '0 0 6px',
            fontFamily: 'var(--f-body, "Manrope", system-ui, sans-serif)',
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: 'var(--accent-2, #efd9a8)',
            textTransform: 'uppercase',
            lineHeight: 1
          }}>
            FENIX
          </h1>

          <div style={{
            fontFamily: 'var(--f-mono, "JetBrains Mono", monospace)',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--accent, #d3aa63)',
            opacity: 0.9,
            marginBottom: '10px'
          }}>
            Restobar & Lounge · Dispatch OS
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(211, 170, 99, 0.08)',
            border: '1px solid rgba(211, 170, 99, 0.18)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '12px',
            color: 'var(--text-2, #a99f8b)'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#57a877',
              boxShadow: '0 0 8px #57a877'
            }} />
            Служебный вход для персонала
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(213, 97, 79, 0.15)',
            border: '1px solid rgba(213, 97, 79, 0.45)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#ff9d91'
          }}>
            <Icon name="alert" size={17} stroke={1.8} style={{ flexShrink: 0, color: '#ff6e5a' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Username Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-2, #a99f8b)',
              marginBottom: '8px'
            }}>
              Имя пользователя
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-3, #6f6656)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <Icon name="users" size={16} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="admin"
                autoFocus
                style={{
                  width: '100%',
                  height: '46px',
                  background: 'rgba(8, 7, 5, 0.7)',
                  border: '1px solid rgba(201, 168, 106, 0.22)',
                  borderRadius: '10px',
                  padding: '0 14px 0 42px',
                  color: 'var(--text, #f2ebdc)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.18s ease, box-shadow 0.18s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent, #d3aa63)';
                  e.target.style.boxShadow = '0 0 12px rgba(211, 170, 99, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(201, 168, 106, 0.22)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-2, #a99f8b)',
              marginBottom: '8px'
            }}>
              Пароль доступа
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-3, #6f6656)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <Icon name="lock" size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%',
                  height: '46px',
                  background: 'rgba(8, 7, 5, 0.7)',
                  border: '1px solid rgba(201, 168, 106, 0.22)',
                  borderRadius: '10px',
                  padding: '0 44px 0 42px',
                  color: 'var(--text, #f2ebdc)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.18s ease, box-shadow 0.18s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent, #d3aa63)';
                  e.target.style.boxShadow = '0 0 12px rgba(211, 170, 99, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(201, 168, 106, 0.22)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-3, #6f6656)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text, #f2ebdc)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-3, #6f6656)'}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
              </button>
            </div>
          </div>

          {/* Remember me & Quick note */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: 'var(--text-2, #a99f8b)'
          }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: 'var(--accent, #d3aa63)', cursor: 'pointer' }}
              />
              <span>Запомнить на этом устройстве</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              height: '48px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #d3aa63 0%, #b8860b 100%)',
              color: '#0e0b04',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(211, 170, 99, 0.28)',
              transition: 'transform 0.18s ease, filter 0.18s ease',
              marginTop: '6px'
            }}
            onMouseOver={(e) => { if (!loading) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.filter = 'none'; }}
          >
            {loading ? (
              <>
                <Icon name="loop" size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Проверка доступа…</span>
              </>
            ) : (
              <>
                <span>Войти в систему</span>
                <Icon name="chevronR" size={16} stroke={2.2} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
