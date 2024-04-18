import { createContext, FC, useContext, useEffect, useState } from "react";
import { PluginState, PublicPluginContext, PublicPluginState } from "./PluginState";

const PluginContext = createContext<PublicPluginContext>(null as any);
export const usePluginState = () => useContext(PluginContext);

interface ProviderProps {
  pluginState: PluginState
}

export const PluginContextProvider: FC<ProviderProps> = ({
  children,
  pluginState
}) => {
  const [publicState, setPublicState] = useState<PublicPluginState>({ ...pluginState.getPublicState() });

  useEffect(() => {
    function onUpdate() {
      setPublicState({ ...pluginState.getPublicState() });
    }

    pluginState.eventBus.addEventListener("stateUpdate", onUpdate);

    return () => {
      pluginState.eventBus.removeEventListener("stateUpdate", onUpdate);
    }
  }, []);

  // * Put all of your setter wrappers here.
  const setIsNetworkRunning = (isRunning: boolean) => pluginState.setIsNetworkRunning(isRunning);
  const setNetworkName = (name: string) => pluginState.setNetworkName(name);
  const setNetworkPassword = (password: string) => pluginState.setNetworkPassword(password);
  const setShowNotifications = (shouldShow: boolean) => pluginState.setShowNotifications(shouldShow);
  const setShowGameSupport = (shouldShow: boolean) => pluginState.setShowGameSupport(shouldShow);
  const setConnectedDevices = (devices: string[]) => pluginState.setConnectedDevices(devices);

  return (
    <PluginContext.Provider
      value={{
        ...publicState,
        setIsNetworkRunning,
        setNetworkName,
        setNetworkPassword,
        setShowNotifications,
        setShowGameSupport,
        setConnectedDevices
      }}
    >
      {children}
    </PluginContext.Provider>
  )
}
