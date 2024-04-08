import { createContext, FC, useContext, useEffect, useState } from "react";
import { PluginState, PublicPluginContext, PublicPluginState } from "./PluginState";

const PluginContext = createContext<PublicPluginContext>(null as any);
export const usePluginState = () => useContext(PluginContext);

interface ProviderProps {
  PluginStateClass: PluginState
}

export const PluginContextProvider: FC<ProviderProps> = ({
  children,
  PluginStateClass
}) => {
  const [publicState, setPublicState] = useState<PublicPluginState>({ ...PluginStateClass.getPublicState() });

  useEffect(() => {
    function onUpdate() {
      setPublicState({ ...PluginStateClass.getPublicState() });
    }

    PluginStateClass.eventBus.addEventListener("stateUpdate", onUpdate);

    return () => {
      PluginStateClass.eventBus.removeEventListener("stateUpdate", onUpdate);
    }
  }, []);

  // * Put all of your setter wrappers here.
  const setIsNetworkRunning = (isRunning: boolean) => PluginStateClass.setIsNetworkRunning(isRunning);
  const setNetworkName = (name: string) => PluginStateClass.setNetworkName(name);
  const setNetworkPassword = (password: string) => PluginStateClass.setNetworkPassword(password);
  const setConnectedDevices = (devices: string[]) => PluginStateClass.setConnectedDevices(devices);

  return (
    <PluginContext.Provider
      value={{
        ...publicState,
        setIsNetworkRunning,
        setNetworkName,
        setNetworkPassword,
        setConnectedDevices
      }}
    >
      {children}
    </PluginContext.Provider>
  )
}
