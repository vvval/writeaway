import { IPieceProps } from '@writeaway/core';
import { boundMethod } from 'autobind-decorator';
import { html as html_beautify } from 'js-beautify';
import React, { Component } from 'react';

import Modal from 'react-modal';
import { shallowEqual } from 'react-redux';
import { WriteAwaySeoData, WriteAwaySeoKeyField, WriteAwaySeoState } from 'types';

import Editor from 'react-simple-code-editor';
// @ts-ignore
import { highlight, languages } from 'prismjs/components/prism-core';
import i18n from './i18n';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';

export class WriteAwaySeo extends Component<IPieceProps<WriteAwaySeoData>, WriteAwaySeoState> {
  /**
   * Specify component should be rendered inside target node and capture all inside html
   * @type {string}
   */
  static readonly renderType = 'BEFORE';

  static readonly editLabel = i18n.floatingEditLabel;

  static readonly label = i18n.checkboxName;

  static readonly applyEditor = () => {
    // eslint-disable-next-line no-console
    console.warn('SEO editor data can\'t be applied to DOM node, update that data on server side');
  };

  private beautifyOptions: { wrap_line_length: number } = {
    wrap_line_length: 140,
  };

  private modalNode?: HTMLElement;

  constructor(props: IPieceProps) {
    super(props);
    const { data } = this.props.piece;
    this.state = {
      title: data?.title || '',
      keywords: data?.keywords || '',
      description: data?.description || '',
      header: data?.header || '',
      sourceEditorActive: false,
    };
  }

  /**
   * That is a common public method that should activate component editor if it presents
   */
  activateEditor() {
    if (this.props.editorActive && !this.state.sourceEditorActive) {
      this.setEditorActive(true);
    }
  }

  deactivateEditor() {
    if (this.props.editorActive && this.state.sourceEditorActive) {
      this.setEditorActive(false);
    }
  }

  setEditorActive(active: boolean) {
    if (active !== this.state.sourceEditorActive) {
      this.setState({ sourceEditorActive: active });
      if (this.props.actions.onEditorActive) {
        this.props.actions.onEditorActive(this.props.piece.id, active);
      }
    }
  }

  @boundMethod
  onClick(e: MouseEvent) {
    e.preventDefault();
    this.setState({ sourceEditorActive: true });
  }

  componentWillUnmount() {
    // console.log(`SEO editor ${this.props.piece.id} unmounted`);
  }

  @boundMethod
  updateCode(value: string) {
    this.updateValue('header', value);
  }

  UNSAFE_componentWillReceiveProps(nextProps: IPieceProps) {
    // Props are always superior to state
    const { data } = nextProps.piece;
    this.setState({
      title: data.title || '',
      keywords: data.keywords || '',
      description: data.description || '',
      header: html_beautify(data.header || '', this.beautifyOptions),
    });

    if (nextProps.piece.manualActivation) {
      this.props.actions.onManualActivation(this.props.piece.id);
      this.activateEditor();
    }

    if (nextProps.piece.manualDeactivation) {
      this.props.actions.onManualDeactivation(this.props.piece.id);
      this.deactivateEditor();
    }
  }

  shouldComponentUpdate(nextProps: IPieceProps, nextState: WriteAwaySeoState) {
    if (this.props.piece.data) {
      if (!shallowEqual(nextProps.piece.data, this.props.piece.data)) {
        if (this.props.actions.setPieceMessage) {
          this.props.actions.setPieceMessage(this.props.piece.id, 'Page refresh is required', 'warning');
        }
      }
    }
    return !shallowEqual(nextProps.piece.data, this.props.piece.data)
      || this.props.editorActive !== nextProps.editorActive
      || !shallowEqual(this.state, nextState);
  }

  /**
   * Update a current value in the temp state
   * @param valueKey
   * @param value
   */
  updateValue(valueKey: WriteAwaySeoKeyField, value: string) {
    this.setState({
      [valueKey]: (value || '').trim(),
    } as any);
  }

  @boundMethod
  onSave() {
    if (this.props.actions.updatePiece) {
      this.props.actions.updatePiece(this.props.piece.id,
        {
          data: {
            title: this.state.title || '',
            keywords: this.state.keywords || '',
            description: this.state.description || '',
            header: html_beautify(this.state.header || '', this.beautifyOptions),
          },
        });
    }
    if (this.props.actions.savePiece) {
      this.props.actions.savePiece(this.props.piece.id);
    }
    this.setEditorActive(false);
  }

  @boundMethod
  onClose() {
    this.setEditorActive(false);
  }

  createEditor() {
    // this.props.node
    if (this.props.piece.node) {
      this.props.piece.node.addEventListener('click', this.onClick);
    }
  }

  destroyEditor() {
    if (this.props.piece.node) {
      this.props.piece.node.removeEventListener('click', this.onClick);
    }
  }

  renderNonReactAttributes() {
    if (this.props.editorActive && !this.state.sourceEditorActive) {
      this.createEditor();
      if (this.props.piece.node) {
        this.props.piece.node.classList.add(...(this.props.className || '').split(' '));
      }
    } else {
      this.destroyEditor();
      if (this.props.piece.node) {
        this.props.piece.node.classList.remove(...(this.props.className || '').split(' '));
      }
    }
  }

  /**
   * handle closed event from the modal component
   * @param event
   */
  handleCloseModal(event: React.MouseEvent | React.KeyboardEvent) {
    if (this.modalNode && event.type === 'keydown' && (event as React.KeyboardEvent).keyCode === 27) {
      this.modalNode.parentNode!.dispatchEvent(new KeyboardEvent('keyDown', { key: 'Escape' }));
    }
  }

  render() {
    let modalDiv = null;

    if (this.state.sourceEditorActive) {
      console.log('This');
      const { title, description, keywords } = this.state;
      const descr = description.length > 156 ? (`${description.substring(0, 153)}...`) : description;

      /* const descriptionIsLong = description.length > 156; */
      const titleIsLong = title.length > 70;

      /* const floatRight = {
        float: 'right',
        paddingRight: '131px',
      }; */
      const { id } = this.props.piece;
      const html = this.state.header;

      modalDiv = (
        <Modal
          contentLabel="Edit SEO Information"
          isOpen
          overlayClassName="r_modal-overlay r_reset r_visible"
          className="r_modal-content r_modal-content-seo"
          ref={(modal: any) => {
            this.modalNode = (modal && modal.node);
          }}
          onRequestClose={this.handleCloseModal}
        >
          <div className="r_modal-title">
            <div role="button" tabIndex={-1} className="r_modal-close" onClick={this.onClose}>
              <i className="rx_icon rx_icon-close">&nbsp;</i>
            </div>
            <span>{i18n.header}</span>
          </div>
          <div className="r_row">
            <div className="r_col">

              <div className="item-form">
                <input
                  id={`r_${id}_title`}
                  placeholder={i18n.title}
                  type="text"
                  defaultValue={title}
                  onChange={(event) => this.updateValue('title', event.target.value)}
                />
                <span className={`number-badge ${titleIsLong ? 'warning' : 'ok'}`}>{70 - title.length}</span>
                <div className="description">Keep less than 70 characters</div>
              </div>

              <div className="item-form">
                <textarea
                  id={`r_${id}_description`}
                  placeholder={i18n.description}
                  defaultValue={description}
                  rows={5}
                  onChange={(event) => this.updateValue('description', event.target.value)}
                />
                <span
                  className={`number-badge ${(description.length > 160) ? 'warning' : 'ok'}`}
                >
                  {160 - description.length}
                </span>
                <div className="description">Keep less than 160 characters</div>
              </div>

              <div className="item-form">
                <input
                  id={`r_${id}_keywords`}
                  placeholder={i18n.keywords}
                  type="text"
                  defaultValue={keywords}
                  onChange={(event) => this.updateValue('keywords', event.target.value)}
                />
                <span className="number-badge">{keywords.length}</span>
                <div className="description">Keep to 5 keywords or less</div>
              </div>
            </div>
            <div className="r_col r_source_editor">
              <label htmlFor={`r_${id}_description`}>
                {i18n.meta}
              </label>
              <Editor
                value={html}
                onValueChange={this.updateCode}
                highlight={(code: string) => highlight(code, languages.markup)}
                padding={10}
                style={{
                  fontFamily: '"Fira Code", "Menlo", monospace',
                  background: 'white',
                  fontSize: 12,
                }}
              />
              <div className="codemirror-hint">{i18n.metaDescription}</div>
            </div>
          </div>

          <div>
            <div className="google-preview-wrapper">
              <div className="google-preview">
                <div className="google-header">{title}</div>
                <div className="google-website">{window.location.href}</div>
                <div className="google-description">{descr}</div>
              </div>
            </div>
            <label htmlFor={`r_${id}_meta`}>{i18n.google}</label>
          </div>

          <div className="r_modal-actions-bar">
            <div
              role="button"
              tabIndex={-1}
              className="button button-cancel"
              onClick={this.onClose}
            >
              Cancel
            </div>
            <div
              role="button"
              tabIndex={-1}
              className="button button-save"
              onClick={this.onSave}
            >
              {i18n.saveButton}
            </div>
          </div>
        </Modal>
      );
    } else {
      modalDiv = <div data-editor-for={this.props.piece.name} />;
    }

    this.renderNonReactAttributes();
    return modalDiv;
  }
}
