import { afterPatch, findInReactTree, getReactRoot, sleep } from "decky-frontend-lib"
import { LogController } from "../lib/controllers/LogController"
import { PluginState } from "../state/PluginState"
import { PiShareNetworkBold } from "react-icons/pi"

const reactTree = getReactRoot(document.getElementById('root') as any);

/**
 * Gets the wifi icon element.
 * @returns The wifi icon.
 */
async function getWifiIcon(): Promise<any> {
  let wifiIconNode: any;
  let t = 0;

  while (!wifiIconNode) {
    wifiIconNode = findInReactTree(reactTree, node => node?.type?.toString().includes('WirelessConnectingActive') && node?.type?.toString().includes('WirelessNetwork'));
    
    if (wifiIconNode) continue;

    if (t >= 20000) {
      LogController.log('Wifi Icon', `Failed to find wifi icon node after ${t / 1000} sec.`);
      return;
    }

    t += 200;
    await sleep(200);
  }

  return wifiIconNode;
}

/**
 * Patches the wifi icon element.
 * @param patch The patch function.
 * @returns The unpatch function.
 */
async function patchWifiIcon(patch: (ret: any) => any): Promise<() => void> {
  let wifiIconNode: any = await getWifiIcon();

  const orig = wifiIconNode.type;

  const wifiIconWrapper = (props: any) => {
    const ret = orig(props);

    patch(ret);
    
    return ret;
  }

  wifiIconNode.type = wifiIconWrapper;

  if (wifiIconNode.alternate) {
    wifiIconNode.alternate.type = wifiIconNode.type;
  }

  return () => {
    wifiIconNode.type = orig;
    wifiIconNode.alternate.type = wifiIconNode.type;
  }
}

/**
 * Unpatches the wifi symbol.
 */
export let unpatchWifiSymbol: () => void = () => {};

/**
 * Patches
 * @param pluginState The plugin's state.
 */
export async function patchWifiSymbol(pluginState: PluginState): Promise<void> {
  const patch = (ret: any) => {
    afterPatch(ret, 'type', (_: any, ret2: any) => {
      const { isNetworkRunning, connectedDevices } = pluginState.getPublicState();

      return isNetworkRunning ? (
        <div style={{ height: "18px", display: "flex", alignItems: "center" }}>
          <PiShareNetworkBold className="adhoc-hoster-p2p-icon" />
          <div style={{ marginLeft: "7px", lineHeight: "16px" }}>{connectedDevices.length}</div>
        </div>
      ) : ret2
    });
  }

  unpatchWifiSymbol = await patchWifiIcon(patch);
}
