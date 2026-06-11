import type { DoNotTrackProvider } from '../../application/ports/DoNotTrackProvider'

export class NavigatorDntProvider implements DoNotTrackProvider {
  isEnabled(): boolean {
    const v = navigator.doNotTrack
    return v === '1' || v === 'yes'
  }
}
