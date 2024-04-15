import { VFC } from "react"


export type DeviceProps = {
  name: string
}

/**
 * The component representing devices connected to the network.
 */
export const Device: VFC<DeviceProps> = ({ name }) => {
  return (
    <div className="hoster-device">
      <div className="hoster-device-name">{name}</div>
    </div>
  )
}
