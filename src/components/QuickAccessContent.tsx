import { VFC, useEffect, Fragment } from "react";
import { LogController } from "../lib/controllers/LogController";

import { FaCircleExclamation } from "react-icons/fa6";
import { QamStyles } from "./styles/QamStyles";
import { usePluginState } from "../state/PluginContext";
import { ButtonItem, Focusable, PanelSection, TextField } from "decky-frontend-lib";
import { PythonInterop } from "../lib/controllers/PythonInterop";

/**
 * The Quick Access Menu content for the Plugin.
 */
export const QuickAccessContent: VFC<{}> = ({ }) => {
  // * Load your state
  const { isNetworkRunning, networkName, setNetworkName, networkPassword, setNetworkPassword, connectedDevices } = usePluginState();

  useEffect(() => {
    // TODO: handle any onMount tasks
  }, []);

  // TODO: define any function this component will use

  function onNetworkNameChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const name = e.target?.value;
  }

  function onNetworkPasswordChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const password = e.target?.value;
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

        <PanelSection title="Network Settings">
          {isNetworkRunning ? (
            // TODO: style this as needed
            <div>Can't edit the network while its running</div>
          ) : (
            // TODO: style this as needed
            <>
              <TextField label="Name" placeholder="Enter a name" onChange={onNetworkNameChange} value={networkName} />
              {/* TODO: make this field a password field */}
              <TextField label="Password" placeholder="Enter a password" onChange={onNetworkPasswordChange} value={networkPassword} />
            </>
          )}
        </PanelSection>

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
