import { Svg, Line, Circle, Rect } from '@react-pdf/renderer'

const stroke = {
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
}
const iconStyle = (size: number) => ({
  width: size,
  height: size,
  minWidth: size,
  minHeight: size,
  flexShrink: 0,
})

interface IconProps { size?: number; color?: string }

export function MailIcon({ size = 8, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} style={iconStyle(size)} viewBox="0 0 24 24">
      <Rect x="2" y="4" width="20" height="16" rx="2" {...stroke} stroke={color} />
      <Line x1="2" y1="7" x2="12" y2="13" {...stroke} stroke={color} />
      <Line x1="22" y1="7" x2="12" y2="13" {...stroke} stroke={color} />
    </Svg>
  )
}

export function PhoneIcon({ size = 8, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} style={iconStyle(size)} viewBox="0 0 24 24">
      <Rect x="7" y="2" width="10" height="20" rx="2" {...stroke} stroke={color} />
      <Line x1="10" y1="5" x2="14" y2="5" {...stroke} stroke={color} />
      <Circle cx="12" cy="18" r="1" fill={color} />
    </Svg>
  )
}

export function MapPinIcon({ size = 8, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} style={iconStyle(size)} viewBox="0 0 24 24">
      <Circle cx="12" cy="9" r="5" {...stroke} stroke={color} />
      <Line x1="12" y1="14" x2="12" y2="22" {...stroke} stroke={color} />
      <Circle cx="12" cy="9" r="1.5" fill={color} />
    </Svg>
  )
}

export function LinkIcon({ size = 8, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} style={iconStyle(size)} viewBox="0 0 24 24">
      <Circle cx="8" cy="12" r="4" {...stroke} stroke={color} />
      <Circle cx="16" cy="12" r="4" {...stroke} stroke={color} />
      <Line x1="11" y1="12" x2="13" y2="12" {...stroke} stroke={color} />
    </Svg>
  )
}

export function GlobeIcon({ size = 8, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} style={iconStyle(size)} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" {...stroke} stroke={color} />
      <Line x1="2" y1="12" x2="22" y2="12" {...stroke} stroke={color} />
      <Line x1="12" y1="2" x2="12" y2="22" {...stroke} stroke={color} />
      <Circle cx="12" cy="12" r="6" {...stroke} stroke={color} />
    </Svg>
  )
}

export function XIcon({ size = 8, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} style={iconStyle(size)} viewBox="0 0 24 24">
      <Line x1="6" y1="6" x2="18" y2="18" {...stroke} stroke={color} />
      <Line x1="18" y1="6" x2="6" y2="18" {...stroke} stroke={color} />
    </Svg>
  )
}

export function pdfLinkIcon(label: string) {
  const l = label.toLowerCase()
  if (l.includes('twitter') || l === 'x') return XIcon
  if (l.includes('portfolio') || l.includes('web') || l.includes('website')) return GlobeIcon
  return LinkIcon
}
