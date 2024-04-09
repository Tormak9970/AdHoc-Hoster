import { gamepadDialogClasses, quickAccessControlsClasses } from "decky-frontend-lib";
import { VFC } from "react";

/**
 * All css styling for the Quick Access Menu part of the Plugin.
 */
export const QamStyles: VFC<{}> = ({}) => {
  return (
    <style>{`
      .adhoc-hoster-scope {
        width: inherit;
        height: inherit;

        flex: 1 1 1px;
        scroll-padding: 48px 0px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-content: stretch;
      }

      .adhoc-hoster-scope .${quickAccessControlsClasses.PanelSection} {
        padding: 0px;
      }

      .adhoc-hoster-scope .${quickAccessControlsClasses.PanelSectionTitle} {
        margin-top: 3px;
        margin-left: 5px;
      }

      .adhoc-hoster-scope .${gamepadDialogClasses.FieldDescription} {
        margin: 0px 16px;
      }
      .adhoc-hoster-scope .${gamepadDialogClasses.FieldLabel} {
        margin-left: 16px;
      }

      .tab-master-scope .configure-btn .${gamepadDialogClasses.Field}.${gamepadDialogClasses.WithBottomSeparatorStandard}::after {
        display: none;
      }
      .tab-master-scope .configure-btn .${gamepadDialogClasses.FieldLabel} {
        display: none;
      }
      .tab-master-scope .configure-btn .${gamepadDialogClasses.FieldChildren} {
        width: calc(100% - 32px);
      }

      .adhoc-hoster-scope .seperator {
        width: 100%;
        height: 1px;
        background: #23262e;
      }
      
      .adhoc-hoster-scope .no-sep .${gamepadDialogClasses.FieldLabel},
      .adhoc-hoster-scope .no-sep .${gamepadDialogClasses.Field}.${gamepadDialogClasses.WithBottomSeparatorStandard}::after,
      .adhoc-hoster-scope .no-sep.${gamepadDialogClasses.Field}.${gamepadDialogClasses.WithBottomSeparatorStandard}::after {
        display: none
      }

      .adhoc-hoster-scope .no-sep .${gamepadDialogClasses.FieldChildren} {
        width: 100%;
      }
      .adhoc-hoster-scope .no-sep .${(gamepadDialogClasses as any).FieldChildrenWithIcon} {
        width: calc(100% - 10px);
      }
    `}</style>
  );
}
