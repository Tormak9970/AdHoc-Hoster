import { gamepadDialogClasses } from "decky-frontend-lib";
import { VFC } from "react";

export const modalMargin = '16px + 2.8vw';

// New modal background should be "radial-gradient(155.42% 100% at 0% 0%, #060a0e 0 0%, #0e141b 100%)"

/**
 * All css styling for Deck P2P's modals.
 */
export const ModalStyles: VFC<{}> = ({}) => {
  return (
    <style>{`
      .deck-p2p-modal-scope .${gamepadDialogClasses.GamepadDialogContent} .DialogHeader {
        margin-left: 15px;
      }

      .deck-p2p-modal-scope .${gamepadDialogClasses.ModalPosition} > .${gamepadDialogClasses.GamepadDialogContent} {
        background: radial-gradient(155.42% 100% at 0% 0%, #060a0e 0 0%, #0e141b 100%);
      }

      .deck-p2p-modal-scope .name-field .${gamepadDialogClasses.Field} {
        padding-bottom: 0px;
        padding-top: 0px;
      }
      .deck-p2p-modal-scope .${gamepadDialogClasses.Field}.${gamepadDialogClasses.WithBottomSeparatorStandard}::after {
        left: 1vw;
        right: 1vw;
      }

      .deck-p2p-modal-scope .no-sep .${gamepadDialogClasses.Field}.${gamepadDialogClasses.WithBottomSeparatorStandard}::after,
      .deck-p2p-modal-scope .no-sep.${gamepadDialogClasses.Field}.${gamepadDialogClasses.WithBottomSeparatorStandard}::after {
        display: none
      }
      
      /* Focused styles */
      .deck-p2p-modal-scope .start-focused {
        background-color: rgba(255, 255, 255, 0.15);
        animation-name: gamepaddialog_ItemFocusAnim-darkGrey_2zfa-;
      }
      .deck-p2p-modal-scope .highlight-on-focus {
        animation-duration: .5s;
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83);
      }


      .deck-p2p-modal-scope .password-focusable .DialogInput_Wrapper._DialogLayout.Panel {
        flex-grow: 1;
      }

      .deck-p2p-modal-scope .hide-show-button {
        width: 40px !important;
        min-width: 40px !important;
        max-height: 40px;
        padding: 9px !important;
        margin-left: 7px !important;
      }

      .deck-p2p-modal-scope .hide-show-icon {
        width: 1.3em !important;
        height: 1.3em !important;
      }
    `}</style>
  );
}
