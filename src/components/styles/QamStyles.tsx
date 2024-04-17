import { gamepadDialogClasses, quickAccessControlsClasses } from "decky-frontend-lib";
import { VFC } from "react";

/**
 * All css styling for the Quick Access Menu part of the Plugin.
 */
export const QamStyles: VFC<{}> = ({}) => {
  return (
    <style>{`
      .deck-p2p-scope {
        width: inherit;
        height: inherit;

        flex: 1 1 1px;
        scroll-padding: 48px 0px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-content: stretch;
      }

      .deck-p2p-scope .${quickAccessControlsClasses.PanelSection} {
        padding: 0px;
      }

      .deck-p2p-scope .${quickAccessControlsClasses.PanelSectionTitle} {
        margin-top: 3px;
        margin-left: 5px;
      }

      .deck-p2p-scope .${gamepadDialogClasses.FieldDescription} {
        margin: 0px 16px;
      }
      .deck-p2p-scope .${gamepadDialogClasses.FieldLabel} {
        margin-left: 16px;
      }

      .deck-p2p-scope .seperator {
        width: 100%;
        height: 1px;
        background: #23262e;
      }
      
      .deck-p2p-scope .no-sep .${gamepadDialogClasses.FieldLabel},
      .deck-p2p-scope .no-sep .${gamepadDialogClasses.Field}.${gamepadDialogClasses.WithBottomSeparatorStandard}::after,
      .deck-p2p-scope .no-sep.${gamepadDialogClasses.Field}.${gamepadDialogClasses.WithBottomSeparatorStandard}::after {
        display: none
      }

      .deck-p2p-scope .no-sep .${gamepadDialogClasses.FieldChildren} {
        width: 100%;
      }
      .deck-p2p-scope .no-sep .${(gamepadDialogClasses as any).FieldChildrenWithIcon} {
        width: calc(100% - 10px);
      }

      @keyframes deck-p2p-loading {
        0% {
          background-color: #ffbd04;
        }
        50% {
          background-color: #fff704;
        }
        100% {
          background-color: #ffbd04;
        }
      }
    `}</style>
  );
}
