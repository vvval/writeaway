import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import {
  IPieceItem, Dispatch, IOptions, IComponent, PieceActions, IWriteAwayStateExtension,
} from 'types';
import { REDUCER_KEY } from '../constants';
import {
  updatePiece,
  onEditorActive,
  onNodeResized,
  savePiece,
  setPieceMessage,
  resetPiece,
  setSourceId,
  onActivationSentPiece,
  onDeactivationSentPiece,
} from '../actions/pieces';

export type PieceProps<T> = {
  actions: PieceActions,
  editorActive: boolean,
  expert: boolean,
  piece: IPieceItem<T>,
  config: IOptions,
};

const PieceContainer = <T extends object = any>(props: PieceProps<T>) => {
  const pieceOptions = (props.config.piecesOptions.options ? props.config.piecesOptions.options[props.piece.type] : undefined) || {};
  const EditorComponent: IComponent | undefined = props.config.piecesOptions.components[props.piece.type];
  if (!EditorComponent) {
    throw new Error(`Piece type [${props.piece.type}] not supported`);
  }
  return (
    <EditorComponent
      piece={props.piece}
      wrapper={props.config.editorRoot}
      actions={props.actions}
      expert={props.expert}
      editorActive={props.editorActive}
      api={props.config.api}
      options={pieceOptions}
      className={classNames({
        r_editor: true,
        r_edit: props.editorActive,
        r_highlight: props.editorActive,
        'rx_non-expert': !props.expert,
      })}
    />
  );
};

const mapStateToProps = (state: IWriteAwayStateExtension, ownProps: { id: string }) => ({
  piece: state[REDUCER_KEY].pieces.byId[ownProps.id],
  highlight: state[REDUCER_KEY].pieces.highlight,
  expert: state[REDUCER_KEY].global.expert,
  config: state[REDUCER_KEY].config,
  editorActive: !state[REDUCER_KEY].pieces.byId[ownProps.id].destroy
    && state[REDUCER_KEY].pieces.editorActive
    && (state[REDUCER_KEY].pieces.editorEnabled[state[REDUCER_KEY].pieces.byId[ownProps.id].type] ?? true),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: {
    onManualActivation: (id: string) => dispatch(onActivationSentPiece(id)),
    onManualDeactivation: (id: string) => dispatch(onDeactivationSentPiece(id)),
    updatePiece: (id: string, piece: Partial<IPieceItem>) => dispatch(updatePiece(id, piece)),
    resetPiece: (id: string) => dispatch(resetPiece(id)),
    savePiece: (id: string) => dispatch(savePiece(id)),
    onEditorActive: (id: string, active: boolean) => dispatch(onEditorActive(id, active)),
    onNodeResized: (id: string) => dispatch(onNodeResized(id)),
    setPieceMessage: (id: string, message: string, messageLevel: string) => dispatch(setPieceMessage(id, message, messageLevel)),
    setCurrentSourcePieceId: (id: string) => dispatch(setSourceId(id)),
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PieceContainer);
