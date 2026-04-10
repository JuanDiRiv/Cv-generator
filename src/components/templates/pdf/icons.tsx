import { Svg, Path, Circle, Rect } from '@react-pdf/renderer'

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
      <Path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" {...stroke} stroke={color} />
      <Rect x="2" y="4" width="20" height="16" rx="2" {...stroke} stroke={color} />
    </Svg>
  )
}

export function PhoneIcon({ size = 8, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} style={iconStyle(size)} viewBox="0 0 24 24">
      <Path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" {...stroke} stroke={color} />
    </Svg>
  )
}

export function MapPinIcon({ size = 8, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} style={iconStyle(size)} viewBox="0 0 24 24">
      <Path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" {...stroke} stroke={color} />
      <Circle cx="12" cy="10" r="3" {...stroke} stroke={color} />
    </Svg>
  )
}

export function LinkIcon({ size = 8, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} style={iconStyle(size)} viewBox="0 0 24 24">
      <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" {...stroke} stroke={color} />
      <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" {...stroke} stroke={color} />
    </Svg>
  )
}

export function GlobeIcon({ size = 8, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} style={iconStyle(size)} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" {...stroke} stroke={color} />
      <Path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" {...stroke} stroke={color} />
      <Path d="M2 12h20" {...stroke} stroke={color} />
    </Svg>
  )
}

export function XIcon({ size = 8, color = '#111111' }: IconProps) {
  return (
    <Svg width={size} height={size} style={iconStyle(size)} viewBox="0 0 24 24">
      <Path d="M18 6 6 18" {...stroke} stroke={color} />
      <Path d="m6 6 12 12" {...stroke} stroke={color} />
    </Svg>
  )
}

export function pdfLinkIcon(label: string) {
  const l = label.toLowerCase()
  if (l.includes('twitter') || l === 'x') return XIcon
  if (l.includes('portfolio') || l.includes('web') || l.includes('website')) return GlobeIcon
  return LinkIcon
}
