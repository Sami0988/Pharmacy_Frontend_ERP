interface ParsedUserAgent {
  browser: string;
  os: string;
  device: 'desktop' | 'mobile' | 'tablet' | 'unknown';
}

export function parseUserAgent(ua: string): ParsedUserAgent {
  const browser = detectBrowser(ua);
  const os = detectOS(ua);
  const device = detectDevice(ua);

  return { browser, os, device };
}

function detectBrowser(ua: string): string {
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Safari/') && ua.includes('Version/')) return 'Safari';
  if (ua.includes('MSIE') || ua.includes('Trident/')) return 'Internet Explorer';
  return 'Unknown Browser';
}

function detectOS(ua: string): string {
  if (ua.includes('Windows NT 10')) return 'Windows 10/11';
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (ua.includes('Windows NT 6.2')) return 'Windows 8';
  if (ua.includes('Windows NT 6.1')) return 'Windows 7';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown OS';
}

function detectDevice(ua: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  if (ua.includes('Mobile') || ua.includes('Android') && !ua.includes('Tablet')) return 'mobile';
  if (ua.includes('iPad') || ua.includes('Tablet')) return 'tablet';
  if (ua.includes('Windows') || ua.includes('Mac OS X') || ua.includes('Linux')) return 'desktop';
  return 'unknown';
}

export function formatUserAgent(ua: string): string {
  const parsed = parseUserAgent(ua);
  return `${parsed.browser} on ${parsed.os}`;
}
