import { useStore, Show } from '@builder.io/mitosis';
import CreateOIDCConnection from './oidc/index.lite';
import CreateSAMLConnection from './saml/index.lite';
import type { CreateSSOConnectionProps } from '../types';
import defaultClasses from './index.module.css';
import cssClassAssembler from '../../utils/cssClassAssembler';
import InputWithCopyButton from '../../../shared/inputs/InputWithCopyButton/index.lite';

export default function CreateSSOConnection(props: CreateSSOConnectionProps) {
  const state = useStore({
    newConnectionType: 'saml',
    get connectionIsSAML(): boolean {
      return state.newConnectionType === 'saml';
    },
    get connectionIsOIDC(): boolean {
      return state.newConnectionType === 'oidc';
    },
    get classes() {
      return {
        container: cssClassAssembler(props.classNames?.container, defaultClasses.container),
        formControl: cssClassAssembler(props.classNames?.formControl, defaultClasses.formControl),
        selectSSO: cssClassAssembler(props.classNames?.selectSSO, defaultClasses.selectSSO),
        idpId: cssClassAssembler(props.classNames?.idpId, defaultClasses.idpId),
        radio: cssClassAssembler(props.classNames?.radio, defaultClasses.radio),
        span: cssClassAssembler(props.classNames?.span, defaultClasses.span),
        label: cssClassAssembler(props.classNames?.label, defaultClasses.label),
      };
    },
    handleNewConnectionTypeChange(event: Event) {
      state.newConnectionType = (event.target as HTMLInputElement).value;
    },
  });

  return (
    <div>
      <Show when={props.idpEntityID && props.setupLinkToken}>
        <div className={state.classes.idpId}>
          <div className={state.classes.formControl}>
            <InputWithCopyButton
              text={props.idpEntityID || ''}
              label='IdP Entity ID'
              copyDoneCallback={props.successCallback}
            />
          </div>
        </div>
      </Show>
      <div>
        <h2 class={defaultClasses.heading}>Create SSO Connection</h2>
        <fieldset className={state.classes.container}>
          <legend className={state.classes.selectSSO}>Select SSO type:</legend>
          <div className={state.classes.formControl}>
            <label className={state.classes.label}>
              <input
                type='radio'
                name='connection'
                value='saml'
                className={state.classes.radio}
                checked={state.newConnectionType === 'saml'}
                onChange={(event) => state.handleNewConnectionTypeChange(event)}
              />
              <span className={state.classes.span}>SAML</span>
            </label>
          </div>
          <div className={state.classes.formControl}>
            <label className={state.classes.label}>
              <input
                type='radio'
                name='connection'
                value='oidc'
                className={state.classes.radio}
                checked={state.newConnectionType === 'oidc'}
                onChange={(event) => state.handleNewConnectionTypeChange(event)}
              />
              <span className={state.classes.span}>OIDC</span>
            </label>
          </div>
        </fieldset>
        <Show when={state.connectionIsSAML}>
          <CreateSAMLConnection
            urls={props.componentProps.saml.urls!}
            excludeFields={props.componentProps.saml.excludeFields}
            classNames={props.componentProps.saml.classNames}
            variant={props.componentProps.saml.variant}
            errorCallback={props.componentProps.saml.errorCallback!}
            successCallback={props.componentProps.saml.successCallback!}
            displayHeader={false}
          />
        </Show>
        <Show when={state.connectionIsOIDC}>
          <CreateOIDCConnection
            urls={props.componentProps.oidc.urls!}
            excludeFields={props.componentProps.oidc.excludeFields}
            classNames={props.componentProps.oidc.classNames}
            variant={props.componentProps.oidc.variant}
            errorCallback={props.componentProps.oidc.errorCallback!}
            successCallback={props.componentProps.oidc.successCallback!}
            displayHeader={false}
          />
        </Show>
      </div>
    </div>
  );
}
