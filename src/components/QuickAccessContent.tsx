import { useState, VFC  } from "react";
import { LogController } from "../lib/controllers/LogController";

import { FaBan, FaCircleExclamation, FaPlay } from "react-icons/fa6";
import { QamStyles } from "./styles/QamStyles";
import { usePluginState } from "../state/PluginContext";
import { DialogButton, Field, Focusable, PanelSection, ToggleField } from "decky-frontend-lib";
import { showNetworkSettingsModal } from "./modals/NetworkSettingsModal";
import { PluginState } from "../state/PluginState";
import { PythonInterop } from "../lib/controllers/PythonInterop";

/**
 * The Quick Access Menu content for the Plugin.
 */
export const QuickAccessContent: VFC<{ pluginState: PluginState }> = ({ pluginState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isNetworkRunning, setIsNetworkRunning, connectedDevices } = usePluginState();

  async function handleButtonClick() {
    setIsLoading(true);
    
    if (isNetworkRunning) {
      await PythonInterop.killNetwork().then((success) => {
        if (success) {
          LogController.log("Killed the adHoc network.");
          setIsNetworkRunning(!isNetworkRunning);
          setIsLoading(false);
        } else {
          LogController.error("Failed to kill the adhoc network.");
          PythonInterop.toast("Error", "Failed to kill the adhoc network");
          setIsLoading(false);
        }
      });
    } else {
      await PythonInterop.startNetwork().then((success) => {
        if (success) {
          LogController.log("Started the adHoc network.");
          setIsNetworkRunning(!isNetworkRunning);
          setIsLoading(false);
        } else {
          LogController.error("Failed to start the adhoc network.");
          PythonInterop.toast("Error", "Failed to start the adhoc network");
          setIsLoading(false);
        }
      });
    }
  }

  return (
    <div className="deck-p2p-scope">
      {LogController.errorFlag && <div style={{ padding: '0 15px', marginBottom: '40px' }}>
        <h3>
          <FaCircleExclamation style={{ height: '.8em', marginRight: '5px' }} fill="red" />
          Deck P2P encountered an error
        </h3>
        <div style={{ wordWrap: 'break-word' }}>
          Please reach out to
          <br />
          <a href='https://github.com/Tormak9970/Deck-P2P/issues'>https://github.com/Tormak9970/Deck-P2P/issues</a>
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
              <DialogButton onClick={() => showNetworkSettingsModal(pluginState)} onOKActionDescription={'Configure'}>
                Configure
              </DialogButton>
            </Focusable>
            <Focusable className="configure-btn" style={{ marginLeft: "10px" }}>
              <DialogButton
                style={{ height: '40px', width: '42px', minWidth: 0, padding: '10px 12px', marginLeft: 'auto', display: "flex", justifyContent: "center", alignItems: "center", marginRight: "8px" }}
                onOKActionDescription={isNetworkRunning ? 'Kill Network' : 'Start Network'}
                onClick={handleButtonClick}
              >
                {isLoading && <div style={{
                  "width": "1.1em",
                  "height": "1.1em",
                  "borderRadius": "50%",
                  "backgroundColor": "#ffbd04",
                  "animation": "deck-p2p-loading 3s ease-in-out infinite"
                }} />}
                {!isLoading && isNetworkRunning && <FaBan size='1.4em' color="#ef5959" />}
                {!isLoading && !isNetworkRunning && <FaPlay size='1.4em' color="lime" />}
              </DialogButton>
              </Focusable>
          </Focusable>
        </Field>
        

        <PanelSection title="Settngs">
            {/* TODO: show settings here */}

            {/* TODO: show toast when someone connects */}
            <ToggleField label="Notifications" description="Show notifications when someone joins or leaves the network" checked={} />

            {/* TODO: show compat on game page */}
          </PanelSection>
      </Focusable>
    </div>
  );
};
