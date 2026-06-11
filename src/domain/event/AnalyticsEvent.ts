import { EventName } from './EventName'
import { Props } from './Props'
import { Revenue } from './Revenue'

/** Domain entity: a named analytics event with optional props and revenue. */
export class AnalyticsEvent {
  readonly name: EventName
  readonly props: Props
  readonly revenue: Revenue | undefined

  constructor(name: EventName, props?: Props, revenue?: Revenue) {
    this.name = name
    this.props = props ?? new Props()
    this.revenue = revenue
  }
}
