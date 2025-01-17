/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module SyncUi */

import * as React from "react";
import { SyncUiEventDispatcher, SyncUiEventArgs } from "./SyncUiEventDispatcher";

/**
 * Properties supported by [[BooleanSyncUiListener]] component.
 * @public
 */
export interface BooleanListenerProps {
  /** One or more SyncUi event Ids that will trigger the function to be called. */
  eventIds: string[];
  /** Function to be called to return a boolean value. If the boolean value is different than the component's state value setState is
   * called to update the value and trigger a re-render.
   */
  boolFunc: () => boolean;
  /** Optional, default/initial boolean value that is saved in the components state. If
   * not defined it will default to true.
   */
  defaultValue?: boolean;
}

/**
 * State for the [[BooleanSyncUiListener]] component.
 * @internal
 */
interface BooleanListenerState {
  boolValue: boolean;
}

// cSpell:Ignore Unmounting
/**
 * A component that expect its children to be a function that will be passed the current boolValue state.
 * @public
 */
export class BooleanSyncUiListener extends React.Component<BooleanListenerProps, BooleanListenerState> {
  private _componentUnmounting = false;

  /** @internal */
  public readonly state: BooleanListenerState;

  constructor(props: BooleanListenerProps) {
    super(props);
    this.state = {
      boolValue: undefined !== props.defaultValue ? props.defaultValue : true,
    };
  }

  private _handleVisibilitySyncUiEvent = (args: SyncUiEventArgs): void => {
    /* istanbul ignore next */
    if (this._componentUnmounting) return;
    let boolValue = this.state.boolValue;
    if (this.props.eventIds.some((value: string): boolean => args.eventIds.has(value))) {
      boolValue = this.props.boolFunc();
      if (this.state.boolValue !== boolValue) {
        this.setState((_prevState) => ({ boolValue }));
      }
    }
  }

  public componentDidMount() {
    /* istanbul ignore else */
    if (this.props.boolFunc && this.props.eventIds.length > 0)
      SyncUiEventDispatcher.onSyncUiEvent.addListener(this._handleVisibilitySyncUiEvent);
  }

  public componentWillUnmount() {
    /* istanbul ignore else */
    if (this.props.boolFunc && this.props.eventIds.length > 0) {
      this._componentUnmounting = true;
      SyncUiEventDispatcher.onSyncUiEvent.removeListener(this._handleVisibilitySyncUiEvent);
    }
  }

  private _hasNoChildren = (children: any) => React.Children.count(children) === 0;

  public render(): React.ReactNode {
    const {
      children, eventIds, boolFunc, defaultValue, // do not bleed our props
      ...otherProps /* tslint:disable-line: trailing-comma */ // pass-through props
    } = this.props as any;
    const boolValue = this.state.boolValue;

    return (
      typeof children === "function" ?
        children(boolValue, otherProps)
        : !this._hasNoChildren(children)
          ? React.Children.only(children)
          : null
    );
  }
}
