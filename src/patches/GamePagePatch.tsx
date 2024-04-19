import { afterPatch, appDetailsClasses, findInReactTree, ServerAPI, useParams, wrapReactType } from "decky-frontend-lib";
import { Fragment, ReactElement, VFC } from "react";
import { LuNetwork } from "react-icons/lu";
import { PluginState } from "../state/PluginState";

const positonSettings = {
  topLeft: { top: '40px', left: '20px' },
  topRight: { top: '60px', right: '20px' },
  bottomLeft: { bottom: '40px', left: '20px' },
  bottomRight: { bottom: '40px', right: '20px' }
}

const LanCompatIcon: VFC<{ pluginState: PluginState }> = ({ pluginState }) => {
  const showGameSupport = pluginState.getPublicState().showGameSupport;
  const { appid } = useParams<{ appid: string }>();
  const appOverview = appStore.GetAppOverviewByGameID(parseInt(appid));

  const lanPvpCategoryId = 47;
  const lanCoopCategoryId = 48;

  return showGameSupport && (appOverview?.store_category.includes(lanPvpCategoryId) || appOverview?.store_category.includes(lanCoopCategoryId)) ? (
    <div style={{ position: 'absolute', ...positonSettings["topRight"], backgroundColor: "#9683db", padding: "8px", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <LuNetwork  />
    </div>
  ) : (
    <Fragment />
  )
}

/**
 * Patches the game page to show LAN support.
 * @param serverAPI The serverAPI object.
 * @param pluginState The plugin's state.
 * @returns The unpatch function.
 */
export function patchGamePage(serverAPI: ServerAPI, pluginState: PluginState) {
  return serverAPI.routerHook.addPatch('/library/app/:appid', (props?: { path?: string; children?: ReactElement }) => {
    if (!props?.children?.props?.renderFunc) {
      return props
    }

    afterPatch(props.children.props, 'renderFunc', (_: Record<string, unknown>[], ret?: ReactElement) => {
      if (!ret?.props?.children?.type?.type) {
        return ret
      }

      wrapReactType(ret.props.children);
      afterPatch(ret.props.children.type, 'type', (_: Record<string, unknown>[], ret2?: ReactElement) => {
        const container = findInReactTree(ret2, (x: ReactElement) => Array.isArray(x?.props?.children) && x?.props?.className?.includes(appDetailsClasses.InnerContainer));
        if (typeof container !== 'object') {
          return ret2
        }

        container.props.children.splice(1, 0, <LanCompatIcon pluginState={pluginState} />)

        return ret2
      });

      return ret
    });
    
    return props
  });
}
