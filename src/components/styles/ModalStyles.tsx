import { gamepadDialogClasses } from "decky-frontend-lib";
import { VFC } from "react";

export const modalMargin = '16px + 2.8vw';

// New modal background should be "radial-gradient(155.42% 100% at 0% 0%, #060a0e 0 0%, #0e141b 100%)"

/**
 * All css styling for AdHoc-Hoster's modals.
 */
export const ModalStyles: VFC<{}> = ({}) => {
  return (
    <style>{`
      .ad-hoc-hoster-modal-scope .${gamepadDialogClasses.GamepadDialogContent} .DialogHeader {
        margin-left: 15px;
      }

      .ad-hoc-hoster-modal-scope .${gamepadDialogClasses.ModalPosition} > .${gamepadDialogClasses.GamepadDialogContent} {
        background: radial-gradient(155.42% 100% at 0% 0%, #060a0e 0 0%, #0e141b 100%);
      }

      .ad-hoc-hoster-modal-scope .name-field .${gamepadDialogClasses.Field} {
        padding-bottom: 0px;
        padding-top: 0px;
      }
      .ad-hoc-hoster-modal-scope .${gamepadDialogClasses.Field}.${gamepadDialogClasses.WithBottomSeparatorStandard}::after {
        left: 1vw;
        right: 1vw;
      }

      .ad-hoc-hoster-modal-scope .no-sep .${gamepadDialogClasses.Field}.${gamepadDialogClasses.WithBottomSeparatorStandard}::after,
      .ad-hoc-hoster-modal-scope .no-sep.${gamepadDialogClasses.Field}.${gamepadDialogClasses.WithBottomSeparatorStandard}::after {
        display: none
      }
      
      /* Focused styles */
      .ad-hoc-hoster-modal-scope .start-focused {
        background-color: rgba(255, 255, 255, 0.15);
        animation-name: gamepaddialog_ItemFocusAnim-darkGrey_2zfa-;
      }
      .ad-hoc-hoster-modal-scope .highlight-on-focus {
        animation-duration: .5s;
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0.17, 0.45, 0.14, 0.83);
      }
    `}</style>
  );
}
