import {
  ConfirmModal,
  Field,
  TextField,
  afterPatch,
  quickAccessControlsClasses,
  showModal
} from "decky-frontend-lib";
import { useState, VFC, useEffect, Fragment } from "react";
import { ModalStyles } from "../styles/ModalStyles";
import { PluginContextProvider, usePluginState } from "../../state/PluginContext";
import { LogController } from "../../lib/controllers/LogController";
import { PluginState } from "../../state/PluginState";
import { PythonInterop } from "../../lib/controllers/PythonInterop";

type NetworkSettingsModalProps = {
  closeModal?: () => void
};

/**
 * The modal for editing the network settings.
 */
const NetworkSettingsModal: VFC<NetworkSettingsModalProps> = ({ closeModal }) => {
  const { networkName, setNetworkName, networkPassword, setNetworkPassword } = usePluginState();
  
  const [localName, setLocalName] = useState<string>(networkName);
  const [localPassword, setLocalPassword] = useState<string>(networkPassword);
  const [canSave, setCanSave] = useState<boolean>(false);
  const [patchInput, setPatchInput] = useState<boolean>(true);

  function onNetworkNameChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setLocalName(e.target?.value);
  }

  function onNetworkPasswordChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setLocalPassword(e.target?.value);
  }

  const nameInputElement = <TextField placeholder="Enter a name" onChange={onNetworkNameChange} value={localName} />

  //reference to input field class component instance, which has a focus method
  let inputComponentInstance: any;

  if (patchInput) {
    afterPatch(nameInputElement.type.prototype, 'render', function (_: any, ret: any) {
      //@ts-ignore     get reference to instance
      inputComponentInstance = this;
      return ret;
    }, { singleShot: true });
  }

  useEffect(() => {
    inputComponentInstance.Focus();
    setPatchInput(false);
  }, []);

  useEffect(() => {
    setCanSave(localName.length >= 3 && localPassword.length >= 8);
  }, [localName, localPassword]);

  async function onSave() {
    if (canSave) {
      let shouldSave = true;
      
      const nameSucceeded = await PythonInterop.setNetworkName(localName);
      if (nameSucceeded) {
        setNetworkName(localName);
      } else {
        PythonInterop.toast("Error", "Failed to set network name!");
        shouldSave = false;
      }

      const passwordSucceeded = await PythonInterop.setNetworkPassword(localPassword);
      if (passwordSucceeded) {
        setNetworkPassword(localPassword);
      } else {
        PythonInterop.toast("Error", "Failed to set network password!");
        shouldSave = false;
      }

      if (shouldSave) {
        LogController.log("Saved Network Settings.");
        closeModal!();
      }
    } else {
      PythonInterop.toast("Can't Save Settings", "Please check that the name and password are long enough");
    }
  }


  return (
    <ConfirmModal
      bAllowFullSize
      onCancel={closeModal}
      onEscKeypress={closeModal}
      strTitle={"Network Settings"}
      onOK={onSave}
      strOKButtonText="Save"
    >
      <div style={{ padding: "4px 16px 1px" }} className="name-field">
        <Field className="no-sep" description={
        <>
          <div style={{ paddingBottom: "6px" }} className={quickAccessControlsClasses.PanelSectionTitle}>
            Name
          </div>
          {nameInputElement}
          <div style={{ fontSize: "12px", padding: "6px 0px" }}>Name of the network. Must be at least 3 characters</div>
        </>
        } />
      </div>

      <div style={{ padding: "4px 16px 1px" }} className="name-field">
        <Field className="no-sep" description={
        <>
          <div style={{ paddingBottom: "6px" }} className={quickAccessControlsClasses.PanelSectionTitle}>
            Password
          </div>
          <TextField
            placeholder="Enter a password"
            onChange={onNetworkPasswordChange}
            value={localPassword}
            bIsPassword={true}
            // @ts-ignore
            type={"password"}
          />
          <div style={{ fontSize: "12px", padding: "6px 0px" }}>Password for the network. Must be at least 8 characters</div>
        </>
        } />
      </div>
    </ConfirmModal>
  );
};

const NetworkModalWrapper: VFC<{ pluginState: PluginState, closeModal?: () => void }> = ({ pluginState, closeModal }) => {
  return (
    <PluginContextProvider pluginState={pluginState}>
      <ModalStyles />
      <div className="ad-hoc-hoster-modal-scope">
        <NetworkSettingsModal closeModal={closeModal} />
      </div>
    </PluginContextProvider>
  );
}

/**
 * Function to show the NetworkSettingsModal.
 * @param pluginState The pluginState instance.
 */
export function showNetworkSettingsModal(pluginState: PluginState) {
  showModal(<NetworkModalWrapper pluginState={pluginState} />);
}
