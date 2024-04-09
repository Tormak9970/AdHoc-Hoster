import { VFC  } from "react";
import { LogController } from "../lib/controllers/LogController";

import { FaBan, FaCircleExclamation, FaPlay } from "react-icons/fa6";
import { QamStyles } from "./styles/QamStyles";
import { usePluginState } from "../state/PluginContext";
import { DialogButton, Field, Focusable, PanelSection } from "decky-frontend-lib";
import { showNetworkSettingsModal } from "./modals/NetworkSettingsModal";
import { PluginState } from "../state/PluginState";

/**
 * The Quick Access Menu content for the Plugin.
 */
export const QuickAccessContent: VFC<{ pluginState: PluginState }> = ({ pluginState }) => {
  // * Load your state
  const { isNetworkRunning, connectedDevices } = usePluginState();

  function handleButtonClick() {

  }

  return (
    <div className="adhoc-hoster-scope">
      {LogController.errorFlag && <div style={{ padding: '0 15px', marginBottom: '40px' }}>
        <h3>
          <FaCircleExclamation style={{ height: '.8em', marginRight: '5px' }} fill="red" />
          QuickStart encountered an error
        </h3>
        <div style={{ wordWrap: 'break-word' }}>
          Please reach out to
          <br />
          <a href='https://github.com/Tormak9970/QuickStart/issues'>https://github.com/Tormak9970/QuickStart/issues</a>
          <br />
          {/* TODO: once you make a forum post for support for your plugin, add it here */}
          {/* or
          <br />
          <a href='https://discord.com/channels/960281551428522045/1049449185214206053'>https://discord.com/channels/960281551428522045/1049449185214206053</a>
          <br />
          for support. */}
        </div>
      </div>}
      <QamStyles />
      <Focusable>
        {/* TODO: isRunning indicator */}
        {/* TODO: styling will need work  */}

        <Field className="no-sep">
          <Focusable style={{ width: "100%", display: "flex" }}>
            <Focusable className="configure-btn" style={{ width: "calc(100% - 50px)" }}>
              <DialogButton disabled={isNetworkRunning} onClick={() => showNetworkSettingsModal(pluginState)} onOKActionDescription={'Configure'}>
                Configure
              </DialogButton>
            </Focusable>
            <Focusable className="configure-btn" style={{ marginLeft: "10px" }}>
              <DialogButton
                style={{ height: '40px', width: '42px', minWidth: 0, padding: '10px 12px', marginLeft: 'auto', display: "flex", justifyContent: "center", alignItems: "center", marginRight: "8px" }}
                onOKActionDescription={isNetworkRunning ? 'Kill Network' : 'Start Network'}
                onClick={handleButtonClick}
              >
                {isNetworkRunning ? (
                  <FaBan size='1.4em' color="#ef5959" />
                ) : (
                  <FaPlay size='1.4em' color="lime" />
                )}
              </DialogButton>
              </Focusable>
          </Focusable>
        </Field>

        <PanelSection>
          {/* TODO: run/kill button here */}
        </PanelSection>
        

        {isNetworkRunning && (
          <PanelSection title="Connections">
            {/* TODO: list devices here */}
          </PanelSection>
        )}
      </Focusable>
    </div>
  );
};
